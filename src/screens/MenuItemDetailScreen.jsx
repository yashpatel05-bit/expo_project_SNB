import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function MenuItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { addItem, getCartItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const imageUri = item.image
    ? (item.image.startsWith('http') ? item.image : `http://10.0.2.2:8000/storage/${item.image}`)
    : null;

  const handleAddToCart = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    for (let i = 0; i < quantity; i++) {
      addItem(item);
    }
    setTimeout(() => navigation.goBack(), 300);
  };

  const existingInCart = getCartItems().find((ci) => ci.menuItem.id === item.id);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header with back button */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="fast-food-outline" size={48} color="#E23744" />
            </View>
          )}
          {/* Veg badge */}
          <View style={[styles.vegBadge, { backgroundColor: item.is_veg ? '#2E7D32' : '#C62828' }]}>
            <View style={[styles.vegDot, { borderColor: item.is_veg ? '#2E7D32' : '#C62828' }]} />
            <Text style={styles.vegText}>{item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#FF9100" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category.name}</Text>
              </View>
            )}
          </View>

          {item.description ? (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionLabel}>About this dish</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
          ) : null}

          {/* Nutrition / Info cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={22} color="#E23744" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCardLabel}>Prep Time</Text>
              <Text style={styles.infoCardValue}>15-20 min</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={22} color="#E23744" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCardLabel}>Calories</Text>
              <Text style={styles.infoCardValue}>~250 kcal</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="star-outline" size={22} color="#E23744" style={{ marginBottom: 4 }} />
              <Text style={styles.infoCardLabel}>Rating</Text>
              <Text style={styles.infoCardValue}>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
            </View>
          </View>

          {existingInCart && (
            <View style={styles.inCartBanner}>
              <Text style={styles.inCartText}>
                Already {existingInCart.quantity} in cart
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControls}>
          <Pressable
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable
            style={styles.qtyButton}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>

        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
          <Pressable style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>
              Add to Cart • ₹{(item.price * quantity).toFixed(0)}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
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

  scrollContent: { paddingBottom: 30 },

  // Image
  imageContainer: { height: 240, position: 'relative', width: '100%' },
  image: { height: '100%', width: '100%' },
  placeholderImage: {
    alignItems: 'center', backgroundColor: '#F1ECE6', height: '100%',
    justifyContent: 'center', width: '100%',
  },
  placeholderEmoji: { fontSize: 80 },
  vegBadge: {
    alignItems: 'center', borderRadius: 10, bottom: 14, flexDirection: 'row',
    left: 16, paddingHorizontal: 12, paddingVertical: 6, position: 'absolute',
  },
  vegDot: {
    borderRadius: 5, borderWidth: 2, height: 10, marginRight: 6, width: 10,
    backgroundColor: '#FFF',
  },
  vegText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Info
  infoSection: { paddingHorizontal: 20, paddingTop: 20 },
  itemName: { color: '#2D2925', fontSize: 26, fontWeight: '900', lineHeight: 32 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 12 },
  price: { color: '#B86B3D', fontSize: 24, fontWeight: '900' },
  ratingBadge: {
    backgroundColor: '#FFF8E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  ratingText: { color: '#F57C00', fontSize: 12, fontWeight: '700' },
  categoryBadge: {
    backgroundColor: '#F1ECE6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { color: '#73695F', fontSize: 11, fontWeight: '700' },

  // Description
  descriptionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1, marginTop: 20,
    padding: 18, shadowColor: '#3D2D25', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  descriptionLabel: { color: '#9B8D7B', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' },
  descriptionText: { color: '#5C534A', fontSize: 14, lineHeight: 21 },

  // Info cards
  infoCards: { flexDirection: 'row', gap: 10, marginTop: 18 },
  infoCard: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, elevation: 1,
    flex: 1, paddingVertical: 16, shadowColor: '#3D2D25',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  infoCardEmoji: { fontSize: 22, marginBottom: 6 },
  infoCardLabel: { color: '#9B8D7B', fontSize: 10, fontWeight: '600' },
  infoCardValue: { color: '#2D2925', fontSize: 14, fontWeight: '800', marginTop: 2 },

  // In cart banner
  inCartBanner: {
    backgroundColor: '#E8F5E9', borderRadius: 12, marginTop: 16, padding: 12,
    alignItems: 'center',
  },
  inCartText: { color: '#2E7D32', fontSize: 13, fontWeight: '700' },

  // Bottom bar
  bottomBar: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderTopColor: '#EFE8E0',
    borderTopWidth: 1, flexDirection: 'row', gap: 14, paddingBottom: 28,
    paddingHorizontal: 20, paddingTop: 16,
  },
  quantityControls: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  qtyButton: {
    alignItems: 'center', backgroundColor: '#F1ECE6', borderRadius: 10,
    height: 40, justifyContent: 'center', width: 40,
  },
  qtyButtonText: { color: '#B86B3D', fontSize: 22, fontWeight: '700', marginTop: -2 },
  qtyValue: { color: '#2D2925', fontSize: 18, fontWeight: '800', minWidth: 30, textAlign: 'center' },

  addButton: {
    alignItems: 'center', backgroundColor: '#B86B3D', borderRadius: 14,
    height: 50, justifyContent: 'center',
  },
  addButtonText: { color: '#FFF8F0', fontSize: 15, fontWeight: '800' },
});
