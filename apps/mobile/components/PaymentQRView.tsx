import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CheckoutGetStatusResponse } from '../types/stripe';

interface PaymentQRViewProps {
  qrCodeToken: string;
  orderId: string;
  orderStatus: CheckoutGetStatusResponse;
  onRefreshStatus: () => void;
}

export const PaymentQRView: React.FC<PaymentQRViewProps> = ({
  qrCodeToken,
  orderId,
  orderStatus,
  onRefreshStatus,
}) => {
  const handleRefreshStatus = () => {
    Alert.alert(
      'Rafraîchir le statut',
      'Voulez-vous vérifier l\'état actuel de votre commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vérifier', onPress: onRefreshStatus },
      ]
    );
  };

  const formatAmount = (cents: number, currency: string) => {
    const amount = (cents / 100).toFixed(2);
    return `${amount} ${currency}`;
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-white">
      {/* En-tête avec montant */}
      <View className="mb-8 items-center">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Paiement confirmé !
        </Text>
        <Text className="text-lg text-gray-600 mb-1">
          Montant payé : {formatAmount(orderStatus.amountTotalCents, orderStatus.currency)}
        </Text>
        <Text className="text-sm text-gray-500">
          Commande #{orderId.slice(0, 8)}
        </Text>
      </View>

      {/* QR Code */}
      <View className="mb-8 p-4 bg-gray-50 rounded-2xl">
        <QRCode
          value={qrCodeToken}
          size={200}
          color="black"
          backgroundColor="white"
        />
      </View>

      {/* Instructions */}
      <View className="mb-8 items-center">
        <Text className="text-lg font-semibold text-gray-900 mb-3 text-center">
          Présentez ce QR code au distributeur
        </Text>
        <Text className="text-sm text-gray-600 text-center leading-5">
          Scannez ce code sur la machine pour récupérer vos produits.
          Ce QR code est valide pendant 15 minutes.
        </Text>
      </View>

      {/* Bouton rafraîchir */}
      <TouchableOpacity
        onPress={handleRefreshStatus}
        className="bg-blue-500 px-6 py-3 rounded-full"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">
          Rafraîchir l'état
        </Text>
      </TouchableOpacity>

      {/* Informations supplémentaires */}
      <View className="mt-6 p-4 bg-blue-50 rounded-xl w-full">
        <Text className="text-sm text-blue-800 text-center">
          💡 Conseil : Gardez cette page ouverte jusqu'à la récupération de vos produits
        </Text>
      </View>
    </View>
  );
};
