import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Linking,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { getOrderDetails } from '../api/ApiClient';

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getOrderDetails(orderId);
      if (res.data?.success) {
        setOrder(res.data.data);
        setLastSynced(new Date().toLocaleTimeString());
        if (isManualRefresh) {
          if (Platform.OS === 'android') {
            ToastAndroid.show('Live order status updated!', ToastAndroid.SHORT);
          }
        }
      }
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    fetchOrder(true);
  }, [orderId]);

  const callDriver = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#B86B3D" />
        <Text style={{ marginTop: 12, color: '#8C827A', fontWeight: '600' }}>Fetching live order status...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingState}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentIndex = statusSteps.findIndex(
    (s) => s.toLowerCase() === (order.order_status || '').toLowerCase(),
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Live Order Tracking</Text>
          <Text style={{ fontSize: 10, color: '#8C827A' }}>Synced at {lastSynced}</Text>
        </View>
        <Pressable onPress={() => fetchOrder(true)} style={{ padding: 6 }}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B86B3D']}
            tintColor="#B86B3D"
          />
        }
      >
        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) + '22' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.order_status) }]}>
              {(order.order_status || 'Pending').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Order Progress</Text>
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotCompleted,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isCompleted && <Text style={styles.stepCheck}>✓</Text>}
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[styles.stepLine, isCompleted && styles.stepLineCompleted]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.orderItemName}>
                {item.quantity}x {item.item_name}
              </Text>
              <Text style={styles.orderItemPrice}>₹{Math.round(item.subtotal)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderItemRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{Math.round(order.total_amount)}</Text>
          </View>
          <Text style={styles.paymentInfo}>
            {order.payment_method} • {order.payment_status}
          </Text>
        </View>

        {/* Delivery Person */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Partner</Text>
          {order.delivery_person ? (
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>🚗</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{order.delivery_person.name}</Text>
                <Text style={styles.driverPhone}>{order.delivery_person.phone}</Text>
              </View>
              <Pressable
                style={styles.callButton}
                onPress={() => callDriver(order.delivery_person.phone)}
              >
                <Text style={styles.callButtonText}>📞 Call</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.noDriveRow}>
              <Text style={styles.noDriverEmoji}>⏳</Text>
              <Text style={styles.noDriverText}>Assigning nearby driver...</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.feedbackButton}
            onPress={() => navigation.navigate('Feedback', { orderId: order.id })}
          >
            <Text style={styles.feedbackButtonText}>💬 Give Feedback</Text>
          </Pressable>
          <Pressable
            style={styles.homeButton}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.homeButtonText}>🏠 Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending': return '#E6A817';
    case 'confirmed':
    case 'preparing': return '#2196F3';
    case 'out for delivery': return '#FF9800';
    case 'delivered': return '#4CAF50';
    case 'cancelled': return '#C62828';
    default: return '#9B8D7B';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8F4' },

  headerBar: {
    alignItems: 'center', backgroundColor: '#FBF8F4', borderBottomColor: '#EFE8E0',
    borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
  },
  backButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  backText: { color: '#2D2925', fontSize: 22, fontWeight: '600' },
  headerTitle: { color: '#2D2925', fontSize: 17, fontWeight: '800' },

  loadingState: { alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#FBF8F4' },
  errorText: { color: '#9B8D7B', fontSize: 14 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },

  // Info card
  infoCard: {
    alignItems: 'center', backgroundColor: '#3D2D25', borderRadius: 18,
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16,
    paddingHorizontal: 20, paddingVertical: 18,
  },
  orderNumber: { color: '#FFF8F0', fontSize: 18, fontWeight: '800' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  // Cards
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1, marginBottom: 16, padding: 18, shadowColor: '#3D2D25', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1, marginBottom: 16, padding: 18, shadowColor: '#3D2D25', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTitle: { color: '#332D28', fontSize: 14, fontWeight: '800', marginBottom: 14 },

  // Progress steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepIndicator: { alignItems: 'center', width: 28 },
  stepDot: { alignItems: 'center', backgroundColor: '#EFE8E0', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  stepDotCompleted: { backgroundColor: '#4CAF50' },
  stepDotCurrent: { backgroundColor: '#B86B3D' },
  stepCheck: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  stepLine: { backgroundColor: '#EFE8E0', height: 20, width: 2 },
  stepLineCompleted: { backgroundColor: '#4CAF50' },
  stepLabel: { color: '#9B8D7B', flex: 1, fontSize: 13, marginLeft: 12, paddingTop: 3, paddingBottom: 12 },
  stepLabelCompleted: { color: '#5C534A' },
  stepLabelCurrent: { color: '#B86B3D', fontWeight: '800' },

  // Order items
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderItemName: { color: '#5C534A', flex: 1, fontSize: 13 },
  orderItemPrice: { color: '#2D2925', fontSize: 13, fontWeight: '600' },
  divider: { backgroundColor: '#EFE8E0', height: 1, marginVertical: 10 },
  totalLabel: { color: '#2D2925', fontSize: 15, fontWeight: '800' },
  totalValue: { color: '#B86B3D', fontSize: 17, fontWeight: '800' },
  paymentInfo: { color: '#9B8D7B', fontSize: 11, marginTop: 6 },

  // Driver
  driverRow: { alignItems: 'center', flexDirection: 'row' },
  driverAvatar: { alignItems: 'center', backgroundColor: '#F1ECE6', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  driverAvatarText: { fontSize: 22 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { color: '#2D2925', fontSize: 14, fontWeight: '700' },
  driverPhone: { color: '#9B8D7B', fontSize: 12, marginTop: 2 },
  callButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  callButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  noDriveRow: { alignItems: 'center', flexDirection: 'row' },
  noDriverEmoji: { fontSize: 24, marginRight: 10 },
  noDriverText: { color: '#9B8D7B', fontSize: 13 },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  feedbackButton: {
    alignItems: 'center', backgroundColor: '#B86B3D', borderRadius: 14,
    flex: 1, height: 48, justifyContent: 'center',
  },
  feedbackButtonText: { color: '#FFF8F0', fontSize: 13, fontWeight: '800' },
  homeButton: {
    alignItems: 'center', backgroundColor: '#F1ECE6', borderRadius: 14,
    flex: 1, height: 48, justifyContent: 'center',
  },
  homeButtonText: { color: '#5C534A', fontSize: 13, fontWeight: '800' },
});
