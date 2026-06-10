import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface Props {
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message }) => (
  <View className="flex-1 justify-center items-center bg-gray-50">
    <ActivityIndicator size="large" color="#3B82F6" />
    {message ? <Text className="mt-3 text-gray-500 text-sm">{message}</Text> : null}
  </View>
);
