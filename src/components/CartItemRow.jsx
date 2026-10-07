import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CartItemRow({
  cartItem,
  item,
  onIncrease,
  onDecrease,
  onIncrement,
  onDecrement,
  onDelete,
}) {
  const target = cartItem || item;
  if (!target || !target.menuItem) return null;

  const { menuItem, quantity } = target;
  const handleIncrease = onIncrease || onIncrement || (() => {});
  const handleDecrease = onDecrease || onDecrement || (() => {});

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{menuItem.name}</Text>
        <Text style={styles.price}>₹{menuItem.price} each</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={styles.controlButton}
          onPress={() => handleDecrease(target)}
          accessibilityLabel="Decrease quantity"
        >
          <Ionicons name="remove" size={14} color="#E23744" />
        </Pressable>

        <Text style={styles.quantity}>{quantity}</Text>

        <Pressable
          style={styles.controlButton}
          onPress={() => handleIncrease(target)}
          accessibilityLabel="Increase quantity"
        >
          <Ionicons name="add" size={14} color="#E23744" />
        </Pressable>
      </View>

      <Text style={styles.subtotal}>₹{(menuItem.price * quantity).toFixed(0)}</Text>

      <Pressable
        style={styles.deleteButton}
        onPress={() => onDelete && onDelete(target)}
        accessibilityLabel={`Remove ${menuItem.name}`}
      >
        <Ionicons name="trash-outline" size={16} color="#E23744" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#3D2D25',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#2D2925',
    fontSize: 14,
    fontWeight: '700',
  },
  price: {
    color: '#978D82',
    fontSize: 11,
    marginTop: 2,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#F1ECE6',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  controlText: {
    color: '#B86B3D',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
  },
  quantity: {
    color: '#2D2925',
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 10,
    minWidth: 18,
    textAlign: 'center',
  },
  subtotal: {
    color: '#B86B3D',
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 8,
    minWidth: 50,
    textAlign: 'right',
  },
  deleteButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  deleteText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
  },
});
