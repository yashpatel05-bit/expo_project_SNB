import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Ionicons name="cafe" size={48} color="#FF3D00" style={{ marginBottom: 8 }} />
          <Text style={styles.brand}>
            Sip <Text style={styles.brandAccent}>&</Text> Bite
          </Text>
          <Text style={styles.tagline}>A little joy in every sip</Text>
        </View>

        {/* Story */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Story</Text>
          <Text style={styles.cardText}>
            Welcome to Sip & Bite — your neighbourhood café where every cup of coffee tells a
            story and every bite is crafted with love. Founded with a passion for bringing people
            together over great food and beverages, we're committed to quality, freshness, and
            an unforgettable experience.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="restaurant-outline" size={22} color="#FF3D00" style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>15+</Text>
            <Text style={styles.statLabel}>Expert Chefs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cafe-outline" size={22} color="#FF3D00" style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color="#FF9100" style={{ marginBottom: 4 }} />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* What We Offer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What We Offer</Text>
          <FeatureRow iconName="cafe-outline" text="Freshly brewed artisan coffees & teas" />
          <FeatureRow iconName="fast-food-outline" text="Handcrafted pastries & bakery items" />
          <FeatureRow iconName="pizza-outline" text="Gourmet bites & sandwiches" />
          <FeatureRow iconName="ice-cream-outline" text="Signature desserts & sweet treats" />
          <FeatureRow iconName="nutrition-outline" text="Healthy salads & wholesome bowls" />
          <FeatureRow iconName="calendar-outline" text="Cozy ambience with table reservations" />
        </View>

        {/* Timings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hours & Location</Text>
          <View style={styles.timingRow}>
            <Text style={styles.timingDay}>Mon – Fri</Text>
            <Text style={styles.timingTime}>8:00 AM – 10:00 PM</Text>
          </View>
          <View style={styles.timingRow}>
            <Text style={styles.timingDay}>Sat – Sun</Text>
            <Text style={styles.timingTime}>9:00 AM – 11:00 PM</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#FF3D00" style={{ marginRight: 8 }} />
            <Text style={styles.locationText}>
              123 Café Street, Downtown{'\n'}New York, NY 10001
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get in Touch</Text>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+911234567890')}
          >
            <Ionicons name="call-outline" size={18} color="#FF3D00" style={{ marginRight: 10 }} />
            <Text style={styles.contactText}>+91 123-456-7890</Text>
          </Pressable>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:hello@sipnbite.com')}
          >
            <Ionicons name="mail-outline" size={18} color="#FF3D00" style={{ marginRight: 10 }} />
            <Text style={styles.contactText}>hello@sipnbite.com</Text>
          </Pressable>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('https://www.sipnbite.com')}
          >
            <Ionicons name="globe-outline" size={18} color="#FF3D00" style={{ marginRight: 10 }} />
            <Text style={styles.contactText}>www.sipnbite.com</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>
          Made with love by Sip & Bite Team{'\n'}v1.0.0 • React Native
        </Text>
      </ScrollView>
    </View>
  );
}

function FeatureRow({ iconName, text }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={iconName} size={18} color="#FF3D00" style={{ marginRight: 10 }} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
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

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  // Hero
  heroCard: {
    alignItems: 'center', backgroundColor: '#3D2D25', borderRadius: 22,
    marginBottom: 20, paddingHorizontal: 24, paddingVertical: 32,
  },
  heroEmoji: { fontSize: 50, marginBottom: 10 },
  brand: { color: '#FFF8F0', fontSize: 30, fontWeight: '900' },
  brandAccent: { color: '#D98A54' },
  tagline: { color: '#D6C4B4', fontSize: 13, marginTop: 6 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1, marginBottom: 16,
    padding: 20, shadowColor: '#3D2D25', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { color: '#332D28', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  cardText: { color: '#5C534A', fontSize: 14, lineHeight: 22 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1,
    flex: 1, paddingVertical: 18, shadowColor: '#3D2D25',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { color: '#B86B3D', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#9B8D7B', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Features
  featureRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 10 },
  featureEmoji: { fontSize: 18, marginRight: 12 },
  featureText: { color: '#5C534A', flex: 1, fontSize: 13 },

  // Timings
  timingRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
    paddingVertical: 4,
  },
  timingDay: { color: '#5C534A', fontSize: 13, fontWeight: '700' },
  timingTime: { color: '#B86B3D', fontSize: 13, fontWeight: '600' },
  locationRow: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 10 },
  locationIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  locationText: { color: '#5C534A', flex: 1, fontSize: 13, lineHeight: 19 },

  // Contact
  contactRow: {
    alignItems: 'center', flexDirection: 'row', marginBottom: 10, paddingVertical: 4,
  },
  contactIcon: { fontSize: 18, marginRight: 12 },
  contactText: { color: '#B86B3D', fontSize: 14, fontWeight: '600' },

  versionText: {
    color: '#A89E91', fontSize: 11, lineHeight: 18, marginTop: 10, textAlign: 'center',
  },
});
