import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppDispatch } from '../store';
import { restoreSession } from '../store/slices/authSlice';

/**
 * Entry screen – restores persisted session and redirects based on role.
 */
export default function Index() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession()).then((result) => {
      if (restoreSession.fulfilled.match(result)) {
        const user = result.payload.user;
        router.replace(user.role === 'admin' ? '/(admin)' : '/(employee)');
      } else {
        router.replace('/login');
      }
    });
  }, [dispatch]);

  return (
    <View className="flex-1 justify-center items-center bg-blue-500">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
