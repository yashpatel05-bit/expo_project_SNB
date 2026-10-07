import React from 'react';
import { ActivityIndicator, View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import MenuItemDetailScreen from './src/screens/MenuItemDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import TableBookingScreen from './src/screens/TableBookingScreen';
import TableBookingHistoryScreen from './src/screens/TableBookingHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import AddressScreen from './src/screens/AddressScreen';
import AboutScreen from './src/screens/AboutScreen';
import ChatBotScreen from './src/screens/ChatBotScreen';

import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom Figma Capsule Tab Bar Component ──────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const tabDetails = {
    HomeTab: { iconName: 'home', label: 'Home' },
    MenuTab: { iconName: 'restaurant', label: 'Menu' },
    CartTab: { iconName: 'cart', label: 'Cart' },
    OrdersTab: { iconName: 'receipt', label: 'Orders' },
    BookTableTab: { iconName: 'calendar', label: 'Book Table' },
    ProfileTab: { iconName: 'person', label: 'Profile' },
  };

  return (
    <View style={tabStyles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const info = tabDetails[route.name] || { iconName: 'square', label: 'Tab' };
        const badge = route.name === 'CartTab' ? cartCount : 0;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={tabStyles.tabItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            {isFocused ? (
              <View style={tabStyles.activePill}>
                <Ionicons name={info.iconName} size={18} color="#9C91FA" />
                <Text style={tabStyles.activeLabel}>{info.label}</Text>
                {badge > 0 && (
                  <View style={tabStyles.activeBadge}>
                    <Text style={tabStyles.activeBadgeText}>{badge > 99 ? '99+' : badge}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={tabStyles.inactiveIconBox}>
                <Ionicons name={`${info.iconName}-outline`} size={22} color="#A0A0A0" />
                {badge > 0 && (
                  <View style={tabStyles.inactiveBadge}>
                    <Text style={tabStyles.inactiveBadgeText}>{badge > 99 ? '99+' : badge}</Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Bottom Tabs Navigator ──────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MenuTab" component={MenuScreen} />
      <Tab.Screen name="CartTab" component={CartScreen} />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} />
      <Tab.Screen name="BookTableTab" component={TableBookingScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ─────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── App Stack (Tabs + Modal Screens) ───────────────────────
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="TableBooking" component={TableBookingScreen} />
      <Stack.Screen name="TableBookingHistory" component={TableBookingHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ChatBot" component={ChatBotScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ─────────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>☕</Text>
        <ActivityIndicator size="large" color="#E23744" />
        <Text style={styles.loadingText}>Loading Sip & Bite...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// ─── App Entry Point ────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

// ─── Figma Capsule Dock Tab Bar Styles ───────────────────────
const tabStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4FB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  activeLabel: {
    color: '#9C91FA',
    fontSize: 12,
    fontWeight: '800',
  },
  activeBadge: {
    backgroundColor: '#FA73A0',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 2,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  inactiveIconBox: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveBadge: {
    backgroundColor: '#FA73A0',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: 'absolute',
    top: 2,
    right: 2,
  },
  inactiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});

// ─── Global Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFBF7',
    flex: 1,
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    color: '#8C7D73',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
});
