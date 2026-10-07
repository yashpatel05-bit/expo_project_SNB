import Constants from 'expo-constants';

export const RAZORPAY_KEY = 'rzp_test_TXveDStqLBJjaK';
export const RAZORPAY_SECRET = 'FLXRT96zZHYQaR0M1gqy4wwO';
export const DISTANCE_MATRIX_API_KEY = '1padf1Q3jnteeyaMMFa8kLDnzqxd815ay0VD9VP6omJwsEb8j5HJt86PIVRSvjtk';

// ──────────────────────────────────────────────────────────────
// Your PC's local IP address (run `ipconfig` to find it).
// Update this if your WiFi IP changes.
// Make sure to start Laravel with: php artisan serve --host=0.0.0.0
// ──────────────────────────────────────────────────────────────
import { Platform } from 'react-native';

const SERVER_IP = '10.206.5.191';

// If running in Android Emulator, use the special alias 10.0.2.2 which bypasses Windows Firewall completely
const isEmulator = !Constants.isDevice;
export const API_BASE_URL = (Platform.OS === 'android' && isEmulator)
  ? 'http://10.0.2.2:8000/api/'
  : `http://${SERVER_IP}:8000/api/`;

console.log(`[AppConfig] Connected API Base URL: ${API_BASE_URL}`);

