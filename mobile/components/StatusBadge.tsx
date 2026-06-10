import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  status: 'pending' | 'in_progress' | 'completed';
}

const CONFIG = {
  pending:     { label: 'Pending',     bg: 'bg-yellow-100', text: 'text-yellow-700' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  completed:   { label: 'Completed',   bg: 'bg-green-100',  text: 'text-green-700'  },
} as const;

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return (
    <View className={`px-2 py-1 rounded-full ${cfg.bg}`}>
      <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
    </View>
  );
};
