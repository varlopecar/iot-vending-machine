import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface ProfileAvatarProps {
  imageUri?: string | number;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showSettingsIcon?: boolean;
  onSettingsPress?: () => void;
}

export default function ProfileAvatar({
  imageUri,
  size = 'large',
  onPress,
  showSettingsIcon = false,
  onSettingsPress
}: ProfileAvatarProps) {
  const { isDark } = useTailwindTheme();

  const sizeMap = {
    small: 64,
    medium: 80,
    large: 140
  };

  const imageSize = sizeMap[size];
  const borderRadius = imageSize / 2;
  const borderColor = isDark ? '#FD9BD9' : '#5B715F';
  const shadowColor = isDark ? '#FD9BD9' : '#5B715F';

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    avatarContainer: {
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#493837' : '#E3E8E4',
    },
    glowContainer: {
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    settingsIcon: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 32,
      height: 32,
      backgroundColor: 'white',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.glowContainer,
          {
            width: imageSize,
            height: imageSize,
            borderRadius,
            borderWidth: 2,
            borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.avatarContainer,
            {
              width: '100%',
              height: '100%',
              borderRadius,
            },
          ]}
        >
                  {imageUri ? (
            <Image
              source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person"
              size={size === 'small' ? 24 : size === 'medium' ? 32 : 40}
              color={borderColor}
            />
          )}
        </View>
      </TouchableOpacity>
      
      {showSettingsIcon && (
        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsIcon}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={16} color={isDark ? '#2C2221' : '#3A2E2C'} />
        </TouchableOpacity>
      )}
    </View>
  );
}
