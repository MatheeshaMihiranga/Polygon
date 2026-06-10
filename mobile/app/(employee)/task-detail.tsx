import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTaskById, updateTask } from '../../store/slices/taskSlice';
import { StatusBadge }   from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const STATUS_OPTIONS: { value: 'pending' | 'in_progress' | 'completed'; label: string }[] = [
  { value: 'pending',     label: 'Pending'     },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
];

export default function TaskDetail() {
  const { id }   = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentTask, isLoading } = useAppSelector((s) => s.tasks);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchTaskById(Number(id)));
  }, [id, dispatch]);

  const handleStatusUpdate = (status: 'pending' | 'in_progress' | 'completed') => {
    if (status === currentTask?.status) return;
    Alert.alert('Update Status', `Change status to "${status.replace('_', ' ')}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setIsUpdating(true);
          await dispatch(updateTask({ id: Number(id), data: { status } }));
          setIsUpdating(false);
          Alert.alert('Success', 'Task status updated successfully');
        },
      },
    ]);
  };

  if (isLoading || !currentTask) return <LoadingSpinner message="Loading task…" />;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 flex-row items-center" style={{ gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold flex-1" numberOfLines={1}>Task Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Task info ── */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-gray-900 text-xl font-bold flex-1 mr-3">{currentTask.title}</Text>
            <StatusBadge status={currentTask.status} />
          </View>

          {currentTask.description ? (
            <Text className="text-gray-600 text-sm leading-5 mb-4">{currentTask.description}</Text>
          ) : null}

          <View className="flex-row flex-wrap items-center" style={{ gap: 12 }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Text className="text-gray-400 text-xs">Priority:</Text>
              <PriorityBadge priority={currentTask.priority} />
            </View>
            {currentTask.due_date ? (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs">
                  Due: {new Date(currentTask.due_date).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Meta info ── */}
        <View className="mx-4 mt-3 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-3">Task Details</Text>
          <InfoRow label="Created by"   value={currentTask.created_by_name ?? 'Unknown'}   />
          <InfoRow label="Assigned to"  value={currentTask.assigned_to_name ?? 'Unassigned'} />
          <InfoRow label="Created"      value={new Date(currentTask.created_at).toLocaleDateString()} />
          <InfoRow label="Last updated" value={new Date(currentTask.updated_at).toLocaleDateString()} />
        </View>

        {/* ── Update status ── */}
        <View className="mx-4 mt-3 mb-8 bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-3">Update Status</Text>
          <View style={{ gap: 10 }}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleStatusUpdate(opt.value)}
                disabled={isUpdating}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${
                  currentTask.status === opt.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <Text className={`font-medium ${currentTask.status === opt.value ? 'text-blue-600' : 'text-gray-600'}`}>
                  {opt.label}
                </Text>
                {currentTask.status === opt.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-50">
      <Text className="text-gray-400 text-sm">{label}</Text>
      <Text className="text-gray-700 text-sm font-medium">{value}</Text>
    </View>
  );
}
