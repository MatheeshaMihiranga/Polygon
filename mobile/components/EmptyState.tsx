import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon?:    keyof typeof Ionicons.glyphMap;
  title:    string;
  message?: string;
}

export const EmptyState: React.FC<Props> = ({ icon = 'document-outline', title, message }) => (
  <View className="flex-1 justify-center items-center py-20">
    <Ionicons name={icon} size={64} color="#D1D5DB" />
    <Text className="text-gray-500 font-semibold text-lg mt-4">{title}</Text>
    {message ? (
      <Text className="text-gray-400 text-sm mt-2 text-center px-8">{message}</Text>
    ) : null}
  </View>
);
