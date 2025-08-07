import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function AuthInput({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none'
}: AuthInputProps) {
  const { isDark } = useTailwindTheme();
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = secureTextEntry;
  const shouldShowPassword = isPassword && !showPassword;
  
  return (
    <View className={`relative mb-4`}>
      <TextInput
        className={`w-full px-4 py-3 rounded-xl border-2 ${
          isDark 
            ? 'bg-white border-dark-secondary text-gray-800' 
            : 'bg-white border-light-secondary text-gray-800'
        }`}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={shouldShowPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {isPassword && (
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={isDark ? '#6B7280' : '#9CA3AF'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
