import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCategories, getMenuItems } from '../api/ApiClient';
import CategoryCard from '../components/CategoryCard';
import MenuItemCard from '../components/MenuItemCard';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { addItem, getItemCount, getTotal } = useCart();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const fetchData = useCallback(async () => {
    try {
      const [catRes, menuRes] = await Promise.all([
        getCategories(),
        getMenuItems({
          category_id: selectedCategoryId || undefined,
          search: searchText || undefined,
        }),
      ]);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (menuRes.data?.success) setMenuItems(menuRes.data.data);
    } catch (_) {}
  }, [selectedCategoryId, searchText]);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await getMenuItems({
        category_id: selectedCategoryId || undefined,
        search: searchText || undefined,
      });
      if (res.data?.success) setMenuItems(res.data.data);
    } catch (_) {}
  }, [selectedCategoryId, searchText]);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchMenu(); }, [selectedCategoryId, searchText]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCategoryPress = (cat) => {
    setSelectedCategoryId((prev) => (prev === cat.id ? null : cat.id));
  };

  const handleAddToCart = (item) => {
    addItem(item);
    showToast(`${item.name} added!`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'GOOD MORNING';
    if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
    if (hour >= 17 && hour < 21) return 'GOOD EVENING';
    return 'GOOD NIGHT';
  };

  const cartCount = getItemCount();
  const cartTotal = getTotal();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FBF8F4" translucent={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#B86B3D']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{getGreeting()}</Text>
            <Text style={styles.title}>
              Sip <Text style={styles.titleAccent}>&</Text> Bite
            </Text>
            {user && <Text style={styles.welcomeUser}>Hi, {user.name.split(' ')[0]} 👋</Text>}
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Open profile"
          >
            {user ? (
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            ) : (
              <Ionicons name="person" size={22} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Search — navigates to Menu screen */}
        <Pressable
          style={styles.searchBox}
          onPress={() => navigation.navigate('MenuTab')}
        >
          <Ionicons name="search" size={18} color="#9C91FA" style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholder}>Search coffee, bites, or treats</Text>
        </Pressable>

        {/* Hero Card */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>TODAY'S SPECIAL</Text>
            <Text style={styles.heroTitle}>A little joy in every sip.</Text>
            <Text style={styles.heroDescription}>Freshly made, just for you.</Text>
            <Pressable
              style={styles.orderButton}
              onPress={() => navigation.navigate('MenuTab')}
            >
              <Text style={styles.orderButtonText}>Order now</Text>
              <Ionicons name="arrow-forward" size={16} color="#9C91FA" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
          <View style={styles.heroCup}>
            <Ionicons name="cafe" size={54} color="#FFFFFF" style={{ transform: [{ rotate: '-10deg' }] }} />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickAction iconName="receipt-outline" label="My Orders" onPress={() => navigation.navigate('OrderHistory')} />
          <QuickAction iconName="restaurant-outline" label="Table Status" onPress={() => navigation.navigate('TableBookingHistory')} />
          <QuickAction iconName="location-outline" label="Addresses" onPress={() => navigation.navigate('Address')} />
          <QuickAction iconName="information-circle-outline" label="About Us" onPress={() => navigation.navigate('About')} />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>What are you craving?</Text>
          <Pressable onPress={() => navigation.navigate('MenuTab')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAll}>See all </Text>
              <Ionicons name="chevron-forward" size={14} color="#9C91FA" />
            </View>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategoryId === cat.id}
              onPress={() => handleCategoryPress(cat)}
            />
          ))}
        </ScrollView>

        {/* Menu Items Grid */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryId
              ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Filtered'
              : 'Popular Hot Picks 🔥'}
          </Text>
          <Text style={styles.itemCount}>{menuItems.length} items</Text>
        </View>

        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={48} color="#9C91FA" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No items match your selection</Text>
          </View>
        ) : (
          menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={() => handleAddToCart(item)}
              onPress={() => navigation.navigate('MenuItemDetail', { item })}
            />
          ))
        )}

        <Pressable
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('MenuTab')}
        >
          <Text style={styles.viewAllText}>Explore Full Menu 🔥</Text>
        </Pressable>

        {/* Bottom padding */}
        {cartCount > 0 && <View style={{ height: 72 }} />}
      </ScrollView>

      {/* Cart Floating Bar */}
      {cartCount > 0 && (
        <Pressable
          style={styles.cartBar}
          onPress={() => navigation.navigate('CartTab')}
          accessibilityLabel={`View cart with ${cartCount} items`}
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
            </Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarTotal}>₹{Math.round(cartTotal)}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FF9100" />
          </View>
        </Pressable>
      )}

      {/* Floating AI Chatbot Button */}
      <Pressable
        style={[styles.aiFab, cartCount > 0 && { bottom: 160 }]}
        onPress={() => navigation.navigate('ChatBot')}
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
      </Pressable>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
    </View>
  );
}

function QuickAction({ iconName, label, onPress }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Ionicons name={iconName} size={22} color="#9C91FA" style={{ marginBottom: 4 }} />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4FB' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 54, paddingBottom: 24 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#FF9100', fontSize: 11, fontWeight: '900', letterSpacing: 1.6, marginBottom: 4 },
  title: { color: '#1F1610', fontSize: 26, fontWeight: '900', letterSpacing: 0.2 },
  titleAccent: { color: '#9C91FA' },
  welcomeUser: { color: '#5C4E43', fontSize: 13, fontWeight: '700', marginTop: 4 },
  avatar: { alignItems: 'center', backgroundColor: '#9C91FA', borderRadius: 22, height: 44, justifyContent: 'center', width: 44, borderWidth: 2, borderColor: '#EBEAF5' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },

  // Search
  searchBox: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#EBEAF5', flexDirection: 'row', height: 50, marginTop: 18, paddingLeft: 16 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchPlaceholder: { color: '#A89E91', fontSize: 13, fontWeight: '600' },

  // Hero
  heroCard: { backgroundColor: '#9C91FA', borderRadius: 22, flexDirection: 'row', marginTop: 16, minHeight: 155, overflow: 'hidden', padding: 18, elevation: 4, shadowColor: '#9C91FA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroKicker: { color: '#FFEAE0', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', lineHeight: 26, marginTop: 8, maxWidth: 170 },
  heroDescription: { color: '#FFEAE0', fontSize: 11, marginTop: 6, fontWeight: '600' },
  orderButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, flexDirection: 'row', marginTop: 14, paddingHorizontal: 14, paddingVertical: 9, alignSelf: 'flex-start' },
  orderButtonText: { color: '#9C91FA', fontSize: 12, fontWeight: '900' },
  orderArrow: { color: '#9C91FA', fontSize: 16, marginLeft: 7, fontWeight: '900' },
  heroCup: { alignItems: 'center', justifyContent: 'center', width: 80 },
  cupEmoji: { fontSize: 62, transform: [{ rotate: '-10deg' }] },

  // Quick actions
  quickActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  quickAction: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#EBEAF5', flex: 1, paddingVertical: 14, elevation: 2, shadowColor: '#9C91FA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  quickActionEmoji: { fontSize: 22, marginBottom: 4 },
  quickActionLabel: { color: '#1F1610', fontSize: 10, fontWeight: '900' },

  // Sections
  sectionHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 4 },
  sectionTitle: { color: '#1F1610', fontSize: 16, fontWeight: '900' },
  seeAll: { color: '#9C91FA', fontSize: 13, fontWeight: '800' },
  itemCount: { color: '#8C7D73', fontSize: 12, fontWeight: '700' },
  categoryList: { paddingVertical: 8 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyText: { color: '#8C7D73', fontSize: 14, fontWeight: '700' },

  // View all
  viewAllButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#9C91FA', marginTop: 8, paddingVertical: 14 },
  viewAllText: { color: '#9C91FA', fontSize: 14, fontWeight: '900' },

  // Cart bar
  cartBar: {
    alignItems: 'center', backgroundColor: '#140D07', borderRadius: 22,
    bottom: 90, elevation: 12, flexDirection: 'row', justifyContent: 'space-between',
    left: 16, paddingHorizontal: 18, paddingVertical: 14, position: 'absolute',
    right: 16, shadowColor: '#9C91FA', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, borderWidth: 1.5, borderColor: '#9C91FA',
  },
  cartBarLeft: { alignItems: 'center', flexDirection: 'row' },
  cartBadge: { alignItems: 'center', backgroundColor: '#9C91FA', borderRadius: 10, height: 22, justifyContent: 'center', marginRight: 10, minWidth: 22, paddingHorizontal: 6 },
  cartBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  cartBarLabel: { color: '#FFEAE0', fontSize: 13, fontWeight: '700' },
  cartBarRight: { alignItems: 'center', flexDirection: 'row' },
  cartBarTotal: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginRight: 8 },
  cartBarArrow: { color: '#FF9100', fontSize: 18, fontWeight: '900' },

  // AI Chatbot FAB
  aiFab: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#FA73A0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FA73A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#EBEAF5',
  },

  // Toast
  toast: {
    alignItems: 'center', backgroundColor: '#9C91FA', borderRadius: 14,
    bottom: 160, elevation: 10, left: 40, paddingHorizontal: 20,
    paddingVertical: 12, position: 'absolute', right: 40,
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
