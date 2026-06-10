import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout, updateUser }   from '../../store/slices/authSlice';
import { updateUserProfile }    from '../../store/slices/userSlice';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);

  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    phone:      user?.phone      ?? '',
    department: user?.department ?? '',
  });

  const [pwForm, setPwForm] = useState({
    current:  '',
    next:     '',
    confirm:  '',
  });

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? '', department: user.department ?? '' });
  }, [user]);

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setIsSaving(true);
    const result = await dispatch(updateUserProfile({
      id: user!.id,
      data: { name: form.name, phone: form.phone, department: form.department },
    }));
    setIsSaving(false);
    if (updateUserProfile.fulfilled.match(result)) {
      dispatch(updateUser(result.payload));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // ── Change password ───────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) {
      Alert.alert('Error', 'Please fill all password fields'); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      Alert.alert('Error', 'New passwords do not match'); return;
    }
    if (pwForm.next.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters'); return;
    }
    setIsSaving(true);
    const result = await dispatch(updateUserProfile({
      id: user!.id,
      data: { currentPassword: pwForm.current, newPassword: pwForm.next },
    }));
    setIsSaving(false);
    if (updateUserProfile.fulfilled.match(result)) {
      setPwForm({ current: '', next: '', confirm: '' });
      Alert.alert('Success', 'Password changed successfully');
    } else {
      Alert.alert('Error', 'Incorrect current password');
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: () => { dispatch(logout()); router.replace('/login'); },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-gray-900 text-2xl font-bold">Profile</Text>
        <TouchableOpacity
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-xl ${isEditing ? 'bg-blue-500' : 'bg-gray-100'}`}
        >
          <Text className={`font-medium text-sm ${isEditing ? 'text-white' : 'text-gray-600'}`}>
            {isSaving ? 'Saving…' : isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
        <View className="w-full" style={{ maxWidth: 720 }}>
        {/* ── Avatar ── */}
        <View className="items-center py-8">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center">
            <Text className="text-white text-4xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-gray-900 text-xl font-bold mt-4">{user?.name}</Text>
          <Text className="text-gray-500 text-sm">{user?.email}</Text>
          <View className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
            <Text className="text-blue-600 text-xs font-medium capitalize">{user?.role}</Text>
          </View>
        </View>

        {/* ── Personal info ── */}
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-4">Personal Information</Text>
          <Field label="Full Name"    value={form.name}       editable={isEditing} onChange={(v) => setForm({ ...form, name:       v })} />
          <Field label="Phone"        value={form.phone}      editable={isEditing} onChange={(v) => setForm({ ...form, phone:      v })} keyboardType="phone-pad" />
          <Field label="Department"   value={form.department} editable={isEditing} onChange={(v) => setForm({ ...form, department: v })} />
          <Field label="Email"        value={user?.email ?? ''} editable={false}   onChange={() => {}} />
          {isEditing && (
            <TouchableOpacity
              className="mt-3 py-1"
              onPress={() => {
                setIsEditing(false);
                setForm({ name: user?.name ?? '', phone: user?.phone ?? '', department: user?.department ?? '' });
              }}
            >
              <Text className="text-gray-400 text-sm text-center">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Change password ── */}
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-4">Change Password</Text>
          <Field label="Current Password" value={pwForm.current} editable onChange={(v) => setPwForm({ ...pwForm, current: v })} secureTextEntry />
          <Field label="New Password"     value={pwForm.next}    editable onChange={(v) => setPwForm({ ...pwForm, next:    v })} secureTextEntry />
          <Field label="Confirm Password" value={pwForm.confirm} editable onChange={(v) => setPwForm({ ...pwForm, confirm: v })} secureTextEntry />
          <TouchableOpacity
            className={`mt-4 rounded-xl py-3 items-center ${isSaving ? 'bg-blue-300' : 'bg-blue-500'}`}
            onPress={handleChangePassword}
            disabled={isSaving}
          >
            <Text className="text-white font-medium">Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* ── Logout ── */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center justify-center"
            style={{ gap: 8 }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Reusable form field ───────────────────────────────────────
interface FieldProps {
  label:          string;
  value:          string;
  editable:       boolean;
  onChange:       (text: string) => void;
  keyboardType?:  'default' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
}
function Field({ label, value, editable, onChange, keyboardType, secureTextEntry }: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wide">{label}</Text>
      <TextInput
        className={`py-2 text-gray-800 border-b ${editable ? 'border-gray-300' : 'border-gray-100'}`}
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        placeholder={editable ? `Enter ${label.toLowerCase()}` : 'Not set'}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
