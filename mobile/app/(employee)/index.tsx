import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout }                         from '../../store/slices/authSlice';
import { fetchTasks, fetchTaskStats }      from '../../store/slices/taskSlice';
import { TaskCard }                        from '../../components/TaskCard';
import { LoadingSpinner }                  from '../../components/LoadingSpinner';
import type { Task } from '../../types';

export default function EmployeeDashboard() {
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
    router.push({ pathname: '/(employee)/task-detail', params: { id: task.id } });

  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  if (isLoading && tasks.length === 0) return <LoadingSpinner message="Loading…" />;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View className="bg-blue-500 pt-12 pb-8 px-6">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100 text-sm">Hello,</Text>
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
            {user?.department ? (
              <Text className="text-blue-200 text-xs mt-0.5">{user.department}</Text>
            ) : null}
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
        <View className="px-4 -mt-5">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-3">My Task Summary</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <StatItem label="Total"       value={Number(stats?.total       ?? 0)} color="text-gray-700" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatItem label="Pending"     value={Number(stats?.pending     ?? 0)} color="text-yellow-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatItem label="In Progress" value={Number(stats?.in_progress ?? 0)} color="text-blue-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
              <StatItem label="Done"        value={Number(stats?.completed   ?? 0)} color="text-green-500" style={{ width: isNarrow ? '48%' : undefined, flex: isNarrow ? undefined : 1 }} />
            </View>
          </View>
        </View>

        {/* ── Active tasks ── */}
        <View className="px-4 mt-5 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-700 font-semibold">Active Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(employee)/tasks')}>
              <Text className="text-blue-500 text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {activeTasks.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="checkmark-circle-outline" size={48} color="#22C55E" />
              <Text className="text-green-500 font-semibold mt-3">All caught up!</Text>
              <Text className="text-gray-400 text-sm mt-1">No active tasks right now</Text>
            </View>
          ) : (
            activeTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} onPress={handleTaskPress} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value, color, style }: { label: string; value: number; color: string; style?: object }) {
  return (
    <View className="items-center" style={style}>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-gray-400 text-xs mt-1">{label}</Text>
    </View>
  );
}
