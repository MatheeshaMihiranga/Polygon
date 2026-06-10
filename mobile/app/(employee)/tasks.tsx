import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTasks, setFilter } from '../../store/slices/taskSlice';
import { TaskCard }       from '../../components/TaskCard';
import { EmptyState }     from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Task } from '../../types';

const STATUS_FILTERS = ['All', 'pending', 'in_progress', 'completed'];

export default function EmployeeTasks() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading, filter } = useAppSelector((s) => s.tasks);
  const [refreshing,   setRefreshing]   = useState(false);
  const [searchText,   setSearchText]   = useState('');
  const [activeStatus, setActiveStatus] = useState('All');

  const loadTasks = useCallback(() => {
    const params: Record<string, string> = {};
    if (filter.status) params.status = filter.status;
    if (filter.search) params.search = filter.search;
    dispatch(fetchTasks(params));
  }, [dispatch, filter]);

  useEffect(() => { loadTasks(); }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(setFilter({ search: text }));
  };

  const handleStatusFilter = (status: string) => {
    setActiveStatus(status);
    dispatch(setFilter({ status: status === 'All' ? '' : status }));
  };

  const handleTaskPress = (task: Task) =>
    router.push({ pathname: '/(employee)/task-detail', params: { id: task.id } });

  if (isLoading && tasks.length === 0) return <LoadingSpinner />;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold mb-4">My Tasks</Text>

        {/* Search */}
        <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-3" style={{ gap: 8 }}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-gray-800"
            placeholder="Search tasks…"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full ${activeStatus === s ? 'bg-blue-500' : 'bg-gray-100'}`}
            >
              <Text className={`text-xs font-medium ${activeStatus === s ? 'text-white' : 'text-gray-600'}`}>
                {s === 'in_progress' ? 'In Progress' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TaskCard task={item} onPress={handleTaskPress} />}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="No tasks found"
            message="You don't have any assigned tasks yet"
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
