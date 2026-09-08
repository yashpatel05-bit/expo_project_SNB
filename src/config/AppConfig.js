import Constants from 'expo-constants';

export const RAZORPAY_KEY = 'rzp_test_TXveDStqLBJjaK';
export const RAZORPAY_SECRET = 'FLXRT96zZHYQaR0M1gqy4wwO';
export const DISTANCE_MATRIX_API_KEY = '1padf1Q3jnteeyaMMFa8kLDnzqxd815ay0VD9VP6omJwsEb8j5HJt86PIVRSvjtk';

// Dynamically extract Metro host IP when running on physical device via Expo Go or Emulator
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '10.0.2.2';

export const API_BASE_URL = `http://${hostIp}:8000/api/`;

console.log(`[AppConfig] Connected API Base URL: ${API_BASE_URL}`);
