import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchEmployees } from '../../store/slices/userSlice';
import { EmptyState }     from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function Employees() {
  const dispatch = useAppDispatch();
  const { employees, isLoading } = useAppSelector((s) => s.users);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = useCallback(() => { dispatch(fetchEmployees()); }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (isLoading && employees.length === 0) return <LoadingSpinner message="Loading employees…" />;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <Text className="text-gray-900 text-2xl font-bold">Employees</Text>
        <Text className="text-gray-500 text-sm mt-1">{employees.length} team members</Text>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No employees found" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View className="bg-white mx-0 mb-3 rounded-xl p-4 border border-gray-100">
            {/* Employee info */}
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Text className="text-blue-600 font-bold text-lg">
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.email}</Text>
                {item.department ? (
                  <Text className="text-gray-400 text-xs mt-0.5">{item.department}</Text>
                ) : null}
              </View>
            </View>

            {/* Task stats */}
            <View className="flex-row border-t border-gray-50 pt-3" style={{ gap: 4 }}>
              <TaskStat label="Total"       value={Number(item.total_tasks       ?? 0)} color="text-gray-700"  />
              <TaskStat label="Pending"     value={Number(item.pending_tasks     ?? 0)} color="text-yellow-600" />
              <TaskStat label="In Progress" value={Number(item.in_progress_tasks ?? 0)} color="text-blue-600"  />
              <TaskStat label="Done"        value={Number(item.completed_tasks   ?? 0)} color="text-green-600" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

function TaskStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className={`font-bold text-lg ${color}`}>{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}
