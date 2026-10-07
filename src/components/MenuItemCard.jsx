import React, { useRef } from 'react';
import { View, Text, Pressable, Image, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuItemCard({ item, onAddToCart, onPress }) {
  const imageUri = item.image
    ? (item.image.startsWith('http') ? item.image : `http://10.0.2.2:8000/storage/${item.image}`)
    : null;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const handleAdd = () => {
    // Quick bounce on the card
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
    onAddToCart(item);
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`View ${item.name} details`}
      >
        {/* Image area */}
        <View style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="fast-food-outline" size={28} color="#E23744" />
            </View>
          )}
          {/* Veg / Non-veg badge */}
          <View style={[styles.vegBadge, { backgroundColor: item.is_veg ? '#2E7D32' : '#C62828' }]}>
            <Text style={styles.vegBadgeText}>{item.is_veg ? 'VEG' : 'NON'}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoWrap}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.bottomRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.rating > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={11} color="#FF9100" style={{ marginRight: 2 }} />
                <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Add button */}
        <Pressable
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation?.();
            handleAdd();
          }}
          accessibilityLabel={`Add ${item.name} to cart`}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imageWrap: {
    height: 100,
    position: 'relative',
    width: 100,
  },
  image: {
    borderRadius: 14,
    height: 84,
    margin: 8,
    width: 84,
  },
  placeholderImage: {
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 14,
    height: 84,
    justifyContent: 'center',
    margin: 8,
    width: 84,
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  vegBadge: {
    borderRadius: 6,
    left: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: 12,
  },
  vegBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  infoWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  name: {
    color: '#1F1610',
    fontSize: 15,
    fontWeight: '900',
  },
  description: {
    color: '#8C7D73',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
    fontWeight: '600',
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  price: {
    color: '#E23744',
    fontSize: 16,
    fontWeight: '900',
  },
  rating: {
    color: '#FF9100',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 10,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E23744',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    marginRight: 14,
    width: 36,
    elevation: 2,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: -2,
  },
});
