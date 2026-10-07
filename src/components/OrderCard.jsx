import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function OrderCard({ order, onPress }) {
  const statusColor = getStatusColor(order.order_status);

  return (
    <Pressable style={styles.card} onPress={() => onPress(order)} accessibilityRole="button">
      <View style={styles.topRow}>
        <Text style={styles.orderNumber}>#{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {(order.order_status || 'Pending').toUpperCase()}
          </Text>
        </View>
      </View>

      {order.items && order.items.length > 0 && (
        <Text style={styles.items} numberOfLines={2}>
          {order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
        </Text>
      )}

      <View style={styles.bottomRow}>
        <Text style={styles.total}>₹{Math.round(order.total_amount)}</Text>
        <Text style={styles.payment}>
          {order.payment_method} • {order.payment_status}
        </Text>
      </View>

      {order.created_at && (
        <Text style={styles.date}>
          {new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </Pressable>
  );
}

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return '#E6A817';
    case 'confirmed':
    case 'preparing':
      return '#2196F3';
    case 'out for delivery':
      return '#FF9800';
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
      return '#C62828';
    default:
      return '#9B8D7B';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 3,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderNumber: {
    color: '#1F1610',
    fontSize: 16,
    fontWeight: '900',
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  items: {
    color: '#5C4E43',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 8,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  total: {
    color: '#E23744',
    fontSize: 17,
    fontWeight: '900',
  },
  payment: {
    color: '#8C7D73',
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    color: '#8C7D73',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
});
