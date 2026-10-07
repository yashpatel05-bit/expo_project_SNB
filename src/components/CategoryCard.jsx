import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export default function CategoryCard({ category, isActive, isSelected, onPress }) {
  const active = isActive || isSelected;
  const emoji = getCategoryEmoji(category.name);

  return (
    <Pressable
      style={[styles.card, active && styles.cardActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.name}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

function getCategoryEmoji(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('coffee') || lower.includes('beverage') || lower.includes('drink'))
    return '☕';
  if (lower.includes('pastry') || lower.includes('bakery') || lower.includes('bread'))
    return '🥐';
  if (lower.includes('bite') || lower.includes('snack') || lower.includes('sandwich'))
    return '🥪';
  if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake'))
    return '🍰';
  if (lower.includes('pizza') || lower.includes('burger'))
    return '🍕';
  if (lower.includes('salad') || lower.includes('healthy'))
    return '🥗';
  return '🍴';
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    height: 76,
    justifyContent: 'center',
    marginRight: 10,
    width: 78,
    elevation: 2,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardActive: {
    backgroundColor: '#E23744',
    borderColor: '#E23744',
    elevation: 4,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    color: '#8C7D73',
    fontSize: 11,
    fontWeight: '800',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
