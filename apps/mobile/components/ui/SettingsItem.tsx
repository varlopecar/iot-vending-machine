import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  type?: 'toggle' | 'select' | 'action';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  showArrow?: boolean;
  disabled?: boolean;
}

export default function SettingsItem({
  title,
  subtitle,
  type = 'action',
  value,
  onPress,
  onToggle,
  icon,
  showArrow = true,
  disabled = false
}: SettingsItemProps) {
  const { isDark } = useTailwindTheme();

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleToggle = (newValue: boolean) => {
    if (!disabled && onToggle) {
      onToggle(newValue);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || type === 'toggle'}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="flex-1 flex-row items-center">
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isDark ? '#FD9BD9' : '#5B715F'}
            style={{ marginRight: 12 }}
          />
        )}
        
        <View className="flex-1">
          <Text
            className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-base font-medium`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className={`${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} text-sm mt-1 opacity-70`}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row items-center">
        {type === 'toggle' && typeof value === 'boolean' && (
          <Switch
            value={value}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{
              false: isDark ? '#493837' : '#E3E8E4',
              true: isDark ? '#FD9BD9' : '#5B715F'
            }}
            thumbColor={value ? (isDark ? '#320120' : '#ffffff') : (isDark ? '#FAE4D1' : '#3A2E2C')}
          />
        )}
        
        {type === 'select' && typeof value === 'string' && (
          <View className="flex-row items-center">
            <Text
              className={`${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} text-base mr-2`}
            >
              {value}
            </Text>
            {showArrow && (
              <Ionicons
                name="chevron-down"
                size={16}
                color={isDark ? '#FD9BD9' : '#5B715F'}
              />
            )}
          </View>
        )}
        
        {type === 'action' && showArrow && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? '#FD9BD9' : '#5B715F'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
