import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/ApiClient';
import OrderCard from '../components/OrderCard';

export default function OrderHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isManualRefresh = false) => {
    if (!user) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getUserOrders(user.id);
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchOrders(true);
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    const status = (o.order_status || '').toLowerCase();
    if (activeFilter === 'Active') {
      return status === 'pending' || status === 'preparing' || status === 'out for delivery' || status === 'confirmed';
    }
    if (activeFilter === 'Delivered') return status === 'delivered';
    if (activeFilter === 'Cancelled') return status === 'cancelled';
    return true; // 'All'
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Pressable onPress={() => fetchOrders(true)} style={{ padding: 4 }}>
          <Ionicons name="refresh" size={20} color="#FF3D00" />
        </Pressable>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterRow}>
        {['All', 'Active', 'Delivered', 'Cancelled'].map((f) => (
          <Pressable
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#B86B3D" />
          <Text style={styles.loadingText}>Fetching order history...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#FF3D00" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>No {activeFilter !== 'All' ? activeFilter : ''} Orders Found</Text>
          <Text style={styles.emptySubtitle}>Your order history will show here with real status tracking.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#B86B3D']}
              tintColor="#B86B3D"
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate('OrderTracking', { orderId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8F4' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8E0',
  },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  backText: { fontSize: 28, color: '#3D2D25', lineHeight: 30 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#3D2D25' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8E0',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8F4EE',
    borderWidth: 1,
    borderColor: '#EFE8E0',
  },
  filterChipActive: { backgroundColor: '#B86B3D', borderColor: '#B86B3D' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#8C827A' },
  filterChipTextActive: { color: '#FFF8F0' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8C827A', fontSize: 13, marginTop: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#3D2D25' },
  emptySubtitle: { fontSize: 13, color: '#8C827A', marginTop: 4, textAlign: 'center' },
  listContent: { padding: 16 },
});
