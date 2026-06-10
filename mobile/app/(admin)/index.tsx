import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout }            from '../../store/slices/authSlice';
import { fetchTasks, fetchTaskStats } from '../../store/slices/taskSlice';
import { TaskCard }          from '../../components/TaskCard';
import { LoadingSpinner }    from '../../components/LoadingSpinner';
import type { Task } from '../../types';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  const { user }             = useAppSelector((s) => s.auth);
  const { tasks, stats, isLoading } = useAppSelector((s) => s.tasks);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([dispatch(fetchTasks()), dispatch(fetchTaskStats())]);
  }, [dispatch]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => { dispatch(logout()); router.replace('/login'); },
      },
    ]);
  };

  const handleTaskPress = (task: Task) =>
    router.push({ pathname: '/(admin)/edit-task', params: { id: task.id } });

  if (isLoading && tasks.length === 0) return <LoadingSpinner message="Loading dashboard…" />;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View className="bg-blue-500 pt-12 pb-8 px-6">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100 text-sm">Welcome back,</Text>
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
            <Text className="text-blue-200 text-xs mt-0.5">Administrator</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="p-2">
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats ── */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-3">Task Overview</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <StatCard label="Total"       value={Number(stats?.total       ?? 0)} color="bg-blue-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatCard label="Pending"     value={Number(stats?.pending     ?? 0)} color="bg-yellow-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatCard label="In Progress" value={Number(stats?.in_progress ?? 0)} color="bg-purple-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatCard label="Done"        value={Number(stats?.completed   ?? 0)} color="bg-green-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
            </View>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View className="px-4 mt-5">
          <Text className="text-gray-700 font-semibold mb-3">Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TouchableOpacity
              className="bg-blue-500 rounded-xl p-4 items-center"
              style={{ width: isNarrow ? '48%' : '31%' }}
              onPress={() => router.push('/(admin)/create-task')}
            >
              <Ionicons name="add-circle-outline" size={26} color="white" />
              <Text className="text-white font-medium mt-2 text-sm">New Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white rounded-xl p-4 items-center border border-gray-200"
              style={{ width: isNarrow ? '48%' : '31%' }}
              onPress={() => router.push('/(admin)/tasks')}
            >
              <Ionicons name="list-outline" size={26} color="#3B82F6" />
              <Text className="text-blue-500 font-medium mt-2 text-sm">All Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white rounded-xl p-4 items-center border border-gray-200"
              style={{ width: isNarrow ? '48%' : '31%' }}
              onPress={() => router.push('/(admin)/employees')}
            >
              <Ionicons name="people-outline" size={26} color="#3B82F6" />
              <Text className="text-blue-500 font-medium mt-2 text-sm">Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent tasks ── */}
        <View className="px-4 mt-5 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-700 font-semibold">Recent Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/tasks')}>
              <Text className="text-blue-500 text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          {tasks.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="document-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3">No tasks yet</Text>
            </View>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} onPress={handleTaskPress} showAssignee />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color, style }: { label: string; value: number; color: string; style?: object }) {
  return (
    <View className={`${color} rounded-xl p-3 items-center`} style={style}>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-white text-xs opacity-80 mt-1" numberOfLines={1}>{label}</Text>
    </View>
  );
}
