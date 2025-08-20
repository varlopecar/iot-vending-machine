// Jest setup file for mobile app
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // The mock for `call` immediately calls the callback which is incorrect
    // So we override it with a no-op
    Reanimated.default.call = () => { };

    return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // Commented out as module not found

// Mock expo modules
jest.mock('expo-constants', () => ({
    default: {
        statusBarHeight: 44,
        deviceName: 'iPhone',
    },
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    Redirect: ({ href }) => `Redirect to ${href}`,
}));

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
    BlurView: 'BlurView',
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }) => children,
    useStripe: () => ({
        createPaymentMethod: jest.fn(),
        confirmPayment: jest.fn(),
    }),
    usePaymentSheet: () => ({
        initPaymentSheet: jest.fn(),
        presentPaymentSheet: jest.fn(),
    }),
}));

// Global test setup
global.__DEV__ = true;
