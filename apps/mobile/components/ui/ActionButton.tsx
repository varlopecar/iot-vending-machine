import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false
}: ActionButtonProps) {
  const { isDark } = useTailwindTheme();

  const sizeClasses = {
    small: 'px-3 py-1.5',
    medium: 'px-6 py-3',
    large: 'px-8 py-4'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const getButtonStyles = () => {
    if (disabled) {
      return `${isDark ? 'bg-dark-surface' : 'bg-light-surface'} opacity-50`;
    }

    switch (variant) {
      case 'primary':
        return isDark ? 'bg-dark-secondary' : 'bg-light-secondary';
      case 'secondary':
        return isDark ? 'bg-dark-surface' : 'bg-light-surface';
      case 'outline':
        return isDark ? 'bg-dark-secondary' : 'bg-light-secondary';
      default:
        return isDark ? 'bg-dark-secondary' : 'bg-light-secondary';
    }
  };

  const getTextStyles = () => {
    if (disabled) {
      return isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary';
    }

    switch (variant) {
      case 'primary':
        return isDark ? 'text-dark-buttonText' : 'text-white';
      case 'secondary':
        return isDark ? 'text-dark-text' : 'text-light-text';
      case 'outline':
        return isDark ? 'text-dark-buttonText' : 'text-white';
      default:
        return isDark ? 'text-dark-buttonText' : 'text-white';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`${sizeClasses[size]} rounded-xl ${getButtonStyles()} justify-center items-center shadow-sm`}
    >
      <Text className={`${textSizeClasses[size]} font-semibold ${getTextStyles()}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
