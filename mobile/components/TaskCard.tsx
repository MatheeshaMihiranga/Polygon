import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge }   from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import type { Task } from '../types';

interface Props {
  task:          Task;
  onPress:       (task: Task) => void;
  onDelete?:     (task: Task) => void;
  showAssignee?: boolean;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onDelete, showAssignee = false }) => (
  <TouchableOpacity
    onPress={() => onPress(task)}
    className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    activeOpacity={0.75}
  >
    {/* Title row */}
    <View className="flex-row justify-between items-start mb-2" style={{ gap: 8 }}>
      <Text className="text-gray-900 font-semibold text-base flex-1 mr-2" numberOfLines={2}>
        {task.title}
      </Text>
      <View className="flex-row items-center flex-wrap" style={{ gap: 8 }}>
        <StatusBadge status={task.status} />
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(task)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Description */}
    {task.description ? (
      <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
        {task.description}
      </Text>
    ) : null}

    {/* Footer */}
    <View className="flex-row justify-between items-center flex-wrap" style={{ gap: 8 }}>
      <PriorityBadge priority={task.priority} />
      <View className="flex-row items-center flex-wrap justify-end" style={{ gap: 12 }}>
        {showAssignee && task.assigned_to_name ? (
          <Text className="text-gray-400 text-xs">{task.assigned_to_name}</Text>
        ) : null}
        {task.due_date ? (
          <Text className="text-gray-400 text-xs">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);
