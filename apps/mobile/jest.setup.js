// Configuration globale pour les tests Jest

// Mock des composants Expo
jest.mock('expo-font');
jest.mock('expo-linear-gradient');
jest.mock('expo-blur');
jest.mock('expo-haptics');
jest.mock('expo-image');
jest.mock('expo-splash-screen');
jest.mock('expo-status-bar');
jest.mock('expo-system-ui');
jest.mock('expo-web-browser');
jest.mock('expo-notifications');

// Mock des composants de navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children }) => children,
  },
}));

// Mock des composants UI
jest.mock('@gorhom/bottom-sheet', () => 'BottomSheet');
jest.mock('react-native-svg', () => 'Svg');

// Mock des composants Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
  StripeProvider: ({ children }) => children,
}));

// Mock des composants QR
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Configuration globale
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
