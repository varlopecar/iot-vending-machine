import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CheckoutGetStatusResponse } from '../types/stripe';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

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
  const { isDark } = useTailwindTheme();
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
    <View className={`flex-1 items-center justify-center p-6 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {/* En-tête avec montant */}
      <View className="mb-8 items-center">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
          Paiement confirmé !
        </Text>
        <Text className={`text-lg mb-1 ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
          Montant payé : {formatAmount(orderStatus.amountTotalCents, orderStatus.currency)}
        </Text>
        <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
          Commande #{orderId.slice(0, 8)}
        </Text>
      </View>

      {/* QR Code */}
      <View className={`mb-8 p-4 rounded-2xl ${isDark ? 'bg-white' : 'bg-white'}`}>
        <QRCode
          value={qrCodeToken}
          size={200}
          color="black"
          backgroundColor="white"
        />
      </View>

      {/* Instructions */}
      <View className="mb-8 items-center">
        <Text className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
          Présentez ce QR code au distributeur
        </Text>
        <Text className={`text-sm text-center leading-5 ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
          Scannez ce code sur la machine pour récupérer vos produits.
          Ce QR code est valide pendant 15 minutes.
        </Text>
      </View>

      {/* Bouton rafraîchir */}
      <TouchableOpacity
        onPress={handleRefreshStatus}
        className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} px-6 py-3 rounded-full`}
        activeOpacity={0.8}
      >
        <Text className={`font-semibold text-base ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
          Rafraîchir l&apos;état
        </Text>
      </TouchableOpacity>

      {/* Informations rassurantes */}
      <View className={`mt-6 p-4 rounded-xl w-full ${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'}`}>
        <Text className={`text-sm text-center ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
          ✅ Pas de souci ! Vous pouvez fermer cette page et retrouver votre QR code dans l&apos;onglet &quot;Commandes&quot;
        </Text>
      </View>
    </View>
  );
};
