import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Switch,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getCategories, getMenuItems } from '../api/ApiClient';
import CategoryCard from '../components/CategoryCard';
import MenuItemCard from '../components/MenuItemCard';

export default function MenuScreen({ navigation }) {
  const { addItem } = useCart();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Debounce timer
  const debounceRef = useRef(null);

  // Toast animation
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  // Fetch categories on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        if (res.data?.success) setCategories(res.data.data || []);
      } catch (_) {}
    })();
  }, []);

  // Fetch menu items (debounced on search, immediate on filter change)
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (searchText.trim()) params.search = searchText.trim();
      if (isVegOnly) params.is_veg = true;

      const res = await getMenuItems(params);
      if (res.data?.success) setMenuItems(res.data.data || []);
    } catch (_) {}
    setLoading(false);
    setInitialLoad(false);
  }, [selectedCategoryId, searchText, isVegOnly]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchMenu, 350);
    return () => clearTimeout(debounceRef.current);
  }, [fetchMenu]);

  const handleCategoryPress = (cat) => {
    setSelectedCategoryId((prev) => (prev === cat.id ? null : cat.id));
  };

  const handleAddToCart = (item) => {
    addItem(item);
    showToast(`${item.name} added to cart!`);
  };

  const renderItem = ({ item }) => (
    <MenuItemCard
      item={item}
      onAddToCart={handleAddToCart}
      onPress={() => navigation.navigate('MenuItemDetail', { item })}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9C91FA" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search for dishes, drinks..."
            placeholderTextColor="#A89E91"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => { setSearchText(''); Keyboard.dismiss(); }} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#8C7D73" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters Row */}
      <View style={styles.filterRow}>
        <View style={styles.vegToggle}>
          <Text style={styles.vegLabel}>🥬 Veg Only</Text>
          <Switch
            value={isVegOnly}
            onValueChange={setIsVegOnly}
            trackColor={{ false: '#EFE8E0', true: '#A5D6A7' }}
            thumbColor={isVegOnly ? '#2E7D32' : '#D6C4B4'}
          />
        </View>
        {(selectedCategoryId || searchText || isVegOnly) && (
          <Pressable
            style={styles.clearFilters}
            onPress={() => {
              setSelectedCategoryId(null);
              setSearchText('');
              setIsVegOnly(false);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All ✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item: cat }) => (
            <CategoryCard
              category={cat}
              isActive={selectedCategoryId === cat.id}
              onPress={() => handleCategoryPress(cat)}
            />
          )}
        />
      )}

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {loading ? 'Searching...' : `${menuItems.length} items found`}
        </Text>
        {selectedCategoryId && (
          <Pressable onPress={() => setSelectedCategoryId(null)}>
            <Text style={styles.activeFilter}>
              {categories.find((c) => c.id === selectedCategoryId)?.name || 'Category'} ✕
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title bar */}
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>Menu</Text>
        <Text style={styles.titleSubtext}>Explore our delicious offerings</Text>
      </View>

      {initialLoad ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#9C91FA" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#9C91FA" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptySubtext}>Try a different search or filter</Text>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Toast Notification */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4FB' },

  titleBar: {
    backgroundColor: '#F3F4FB',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 6,
  },
  titleText: { color: '#333333', fontSize: 28, fontWeight: '900' },
  titleSubtext: { color: '#9B8D7B', fontSize: 13, marginTop: 2 },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // Search
  searchSection: { marginTop: 14, marginBottom: 10 },
  searchBox: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16,
    flexDirection: 'row', height: 50, paddingHorizontal: 16,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { color: '#333333', flex: 1, fontSize: 14 },
  clearButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  clearText: { color: '#766D63', fontSize: 16 },

  // Filters
  filterRow: {
    alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10,
  },
  vegToggle: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  vegLabel: { color: '#5C534A', fontSize: 13, fontWeight: '700' },
  clearFilters: {
    backgroundColor: '#FFF0E6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  clearFiltersText: { color: '#9C91FA', fontSize: 11, fontWeight: '700' },

  // Categories
  categoryList: { paddingVertical: 6 },

  // Results
  resultsRow: {
    alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12, marginTop: 8,
  },
  resultsText: { color: '#9B8D7B', fontSize: 12, fontWeight: '600' },
  activeFilter: {
    backgroundColor: '#9C91FA22', borderRadius: 8, color: '#9C91FA',
    fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4,
  },

  // Loading / Empty
  loadingState: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#9B8D7B', fontSize: 13, marginTop: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { color: '#333333', fontSize: 18, fontWeight: '800' },
  emptySubtext: { color: '#9B8D7B', fontSize: 13, marginTop: 4 },

  // Toast
  toast: {
    alignItems: 'center', backgroundColor: '#3D2D25', borderRadius: 14,
    bottom: 90, elevation: 10, left: 40, paddingHorizontal: 20,
    paddingVertical: 12, position: 'absolute', right: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10,
  },
  toastText: { color: '#FFF8F0', fontSize: 13, fontWeight: '700' },
});
