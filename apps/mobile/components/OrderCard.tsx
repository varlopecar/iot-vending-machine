import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { Order } from '../types/product';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const { isDark } = useTailwindTheme();

  const getTimeRemaining = () => {
    const now = new Date();
    const expiresAt = new Date(order.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expiré';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}min`;
    } else {
      return `${minutes}min`;
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'active':
        return isDark ? '#10b981' : '#10b981';
      case 'expired':
        return isDark ? '#ef4444' : '#ef4444';
      case 'used':
        return isDark ? '#6b7280' : '#6b7280';
      case 'cancelled':
        return isDark ? '#f59e0b' : '#f59e0b';
      default:
        return isDark ? '#6b7280' : '#6b7280';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(order)}
      className="w-full"
      activeOpacity={0.7}
    >
      {/* Contenu avec padding et centrage vertical */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-1">
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold mb-1`}
          >
            Commande du {order.date}
          </Text>
          
          <View className="flex-row items-center">
            <Text
              className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-sm mr-2`}
            >
              Temps restant :
            </Text>
            <Text
              style={{ color: getStatusColor() }}
              className="text-sm font-medium"
            >
              {getTimeRemaining()}
            </Text>
          </View>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDark ? '#FEFCFA' : '#3A2E2C'} 
        />
      </View>
      
      {/* Ligne de séparation sur toute la largeur (sans padding) */}
      <View 
        className="w-full h-px"
        style={{ 
          backgroundColor: isDark ? '#493837' : '#F3E9D8'
        }}
      />
    </TouchableOpacity>
  );
}
