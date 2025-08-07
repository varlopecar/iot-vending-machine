import React from 'react';
import { Modal, ModalProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface SafeModalProps extends ModalProps {
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export default function SafeModal({ 
  children, 
  className = '',
  overlayClassName = '',
  ...props 
}: SafeModalProps) {
  const { isDark } = useTailwindTheme();
  
  const defaultOverlayClassName = 'absolute inset-0 bg-black opacity-50';
  const combinedOverlayClassName = overlayClassName 
    ? `${defaultOverlayClassName} ${overlayClassName}` 
    : defaultOverlayClassName;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      statusBarTranslucent={false}
      {...props}
    >
      <SafeAreaView className="flex-1 justify-end">
        <View className={combinedOverlayClassName} />
        <View className={`${className} w-full`}>
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
