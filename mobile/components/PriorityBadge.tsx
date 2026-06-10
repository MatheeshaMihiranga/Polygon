import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  priority: 'low' | 'medium' | 'high';
}

const CONFIG = {
  low:    { label: 'Low',    bg: 'bg-gray-100',   text: 'text-gray-600'   },
  medium: { label: 'Medium', bg: 'bg-orange-100', text: 'text-orange-600' },
  high:   { label: 'High',   bg: 'bg-red-100',    text: 'text-red-600'    },
} as const;

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const cfg = CONFIG[priority] ?? CONFIG.medium;
  return (
    <View className={`px-2 py-1 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
};
