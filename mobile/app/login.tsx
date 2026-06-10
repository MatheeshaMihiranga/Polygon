import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ScrollView, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppDispatch, useAppSelector } from '../store';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginScreen() {
  const dispatch               = useAppDispatch();
  const { isLoading, error }   = useAppSelector((s) => s.auth);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      const { user } = result.payload;
      router.replace(user.role === 'admin' ? '/(admin)' : '/(employee)');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-blue-500"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center" style={{ paddingHorizontal: isSmall ? 16 : 24, paddingVertical: isSmall ? 24 : 48 }}>
          {/* ── Logo ── */}
          <View className="items-center mb-10">
            <View className="bg-white rounded-full items-center justify-center mb-4" style={{ width: isSmall ? 64 : 80, height: isSmall ? 64 : 80 }}>
              <Text className="text-blue-500 font-bold" style={{ fontSize: isSmall ? 24 : 30 }}>TM</Text>
            </View>
            <Text className="text-white font-bold" style={{ fontSize: isSmall ? 28 : 32 }}>Task Manager</Text>
            <Text className="text-blue-100 mt-2" style={{ fontSize: isSmall ? 14 : 16 }}>Sign in to your account</Text>
          </View>

          {/* ── Form card ── */}
          <View className="bg-white rounded-2xl shadow-lg self-center w-full" style={{ maxWidth: 520, padding: isSmall ? 16 : 24 }}>
            <Text className="text-gray-800 font-semibold text-lg mb-6">Welcome Back</Text>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm font-medium mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-gray-600 text-sm font-medium mb-2">Password</Text>
              <View>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 pr-16"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: 14 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-blue-500 text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Demo credentials */}
            <View className="mt-6 p-3 bg-gray-50 rounded-xl">
              <Text className="text-gray-500 text-xs text-center font-semibold mb-1">
                Demo Credentials
              </Text>
              <Text className="text-gray-400 text-xs text-center">
                Admin: admin@company.com / admin123
              </Text>
              <Text className="text-gray-400 text-xs text-center">
                Employee: john@company.com / password123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
