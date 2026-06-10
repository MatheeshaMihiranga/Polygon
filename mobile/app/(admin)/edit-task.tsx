import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTaskById, updateTask, deleteTask } from '../../store/slices/taskSlice';
import { fetchEmployees } from '../../store/slices/userSlice';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function EditTask() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const dispatch  = useAppDispatch();
  const { currentTask, isLoading } = useAppSelector((s) => s.tasks);
  const { employees }              = useAppSelector((s) => s.users);
  const [isSaving, setIsSaving]    = useState(false);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    status:      'pending'  as 'pending' | 'in_progress' | 'completed',
    priority:    'medium'   as 'low' | 'medium' | 'high',
    assigned_to: null       as number | null,
    due_date:    '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(Number(id)));
      dispatch(fetchEmployees());
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentTask) {
      setForm({
        title:       currentTask.title,
        description: currentTask.description ?? '',
        status:      currentTask.status,
        priority:    currentTask.priority,
        assigned_to: currentTask.assigned_to ?? null,
        due_date:    currentTask.due_date ? currentTask.due_date.split('T')[0] : '',
      });
    }
  }, [currentTask]);

  const handleUpdate = async () => {
    if (!form.title.trim()) { Alert.alert('Error', 'Task title is required'); return; }
    setIsSaving(true);
    const result = await dispatch(updateTask({
      id: Number(id),
      data: {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        status:      form.status,
        priority:    form.priority,
        assigned_to: form.assigned_to ?? undefined,
        due_date:    form.due_date    || undefined,
      },
    }));
    setIsSaving(false);
    if (updateTask.fulfilled.match(result)) {
      Alert.alert('Success', 'Task updated', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await dispatch(deleteTask(Number(id))); router.back(); },
      },
    ]);
  };

  if (isLoading || !currentTask) return <LoadingSpinner message="Loading task…" />;

  const PRIORITIES:  Array<'low' | 'medium' | 'high'>                 = ['low', 'medium', 'high'];
  const STATUSES:    Array<'pending' | 'in_progress' | 'completed'>   = ['pending', 'in_progress', 'completed'];
  const priorityColors: Record<string, string> = { low: 'bg-gray-500', medium: 'bg-orange-500', high: 'bg-red-500' };
  const statusLabel = (s: string) => s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 flex-row justify-between items-center">
        <View className="flex-row items-center" style={{ gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">Edit Task</Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Title *</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            value={form.title}
            onChangeText={(t) => setForm({ ...form, title: t })}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Description</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 h-24"
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Status */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Status</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setForm({ ...form, status: s })}
                className={`flex-1 py-2 rounded-xl items-center ${form.status === s ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-xs font-medium ${form.status === s ? 'text-white' : 'text-gray-600'}`}>
                  {statusLabel(s)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Priority</Text>
          <View className="flex-row" style={{ gap: 10 }}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setForm({ ...form, priority: p })}
                className={`flex-1 py-3 rounded-xl items-center ${form.priority === p ? priorityColors[p] : 'bg-white border border-gray-200'}`}
              >
                <Text className={`font-medium capitalize text-sm ${form.priority === p ? 'text-white' : 'text-gray-600'}`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assign to */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Assign To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setForm({ ...form, assigned_to: null })}
                className={`px-4 py-2 rounded-xl ${form.assigned_to === null ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-sm ${form.assigned_to === null ? 'text-white' : 'text-gray-600'}`}>Unassigned</Text>
              </TouchableOpacity>
              {employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id}
                  onPress={() => setForm({ ...form, assigned_to: emp.id })}
                  className={`px-4 py-2 rounded-xl ${form.assigned_to === emp.id ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
                >
                  <Text className={`text-sm ${form.assigned_to === emp.id ? 'text-white' : 'text-gray-600'}`}>{emp.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Due date */}
        <View className="mb-8">
          <Text className="text-gray-700 font-medium mb-2">Due Date (YYYY-MM-DD)</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
            placeholder="e.g. 2025-12-31"
            placeholderTextColor="#9CA3AF"
            value={form.due_date}
            onChangeText={(t) => setForm({ ...form, due_date: t })}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mb-8 ${isSaving ? 'bg-blue-300' : 'bg-blue-500'}`}
          onPress={handleUpdate}
          disabled={isSaving}
        >
          <Text className="text-white font-semibold text-base">
            {isSaving ? 'Saving…' : 'Update Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
