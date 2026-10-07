import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, cancelBooking } from '../api/ApiClient';

export default function TableBookingHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async (isManualRefresh = false) => {
    if (!user) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getUserBookings(user.id);
      if (res.data?.success) {
        setBookings(res.data.data || []);
        setLastSynced(new Date().toLocaleTimeString());
        if (isManualRefresh && Platform.OS === 'android') {
          ToastAndroid.show('Table booking status updated!', ToastAndroid.SHORT);
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchBookings(true);
  }, [user]);

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Table Reservation',
      'Are you sure you want to cancel this table booking?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await cancelBooking(bookingId);
              if (res.data?.success) {
                Alert.alert('Reservation Cancelled', 'Your table reservation has been cancelled.');
                fetchBookings(true);
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not cancel booking.');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'approved') {
      return {
        label: 'CONFIRMED BY ADMIN',
        bgColor: '#DCFCE7',
        textColor: '#15803D',
        borderColor: '#86EFAC',
        desc: 'Your table is officially reserved for you!',
      };
    }
    if (s === 'cancelled' || s === 'rejected') {
      return {
        label: 'CANCELLED',
        bgColor: '#FEE2E2',
        textColor: '#B91C1C',
        borderColor: '#FCA5A5',
        desc: 'This table reservation was cancelled.',
      };
    }
    return {
      label: 'PENDING APPROVAL',
      bgColor: '#FEF3C7',
      textColor: '#B45309',
      borderColor: '#FDE68A',
      desc: 'Admin is reviewing your reservation request.',
    };
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>My Table Status</Text>
          <Text style={styles.syncText}>Last synced {lastSynced}</Text>
        </View>
        <Pressable onPress={() => fetchBookings(true)} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#E23744" />
        </Pressable>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#E23744" />
          <Text style={styles.loadingText}>Fetching reservation status...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={48} color="#E23744" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>No Table Reservations Yet</Text>
          <Text style={styles.emptySubtitle}>Book a table at Sip N Bite and track admin approval live here!</Text>
          <Pressable
            style={styles.bookNowBtn}
            onPress={() => navigation.navigate('TableBooking')}
          >
            <Text style={styles.bookNowText}>Reserve a Table Now</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E23744']}
              tintColor="#E23744"
            />
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.tableBadge}>
                    <Text style={styles.tableBadgeText}>
                      🪑 {item.table ? `Table #${item.table.table_number}` : `Reservation #${item.id}`}
                    </Text>
                  </View>
                  <Text style={styles.guestsBadge}>👥 {item.guests_count} Guests</Text>
                </View>

                {/* Status Box */}
                <View style={[styles.statusBox, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
                  <Text style={[styles.statusTitle, { color: badge.textColor }]}>{badge.label}</Text>
                  <Text style={[styles.statusDesc, { color: badge.textColor }]}>{badge.desc}</Text>
                </View>

                {/* Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>DATE</Text>
                    <Text style={styles.detailValue}>{item.booking_date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>TIME</Text>
                    <Text style={styles.detailValue}>{item.booking_time}</Text>
                  </View>
                </View>

                {item.special_request ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Note: {item.special_request}</Text>
                  </View>
                ) : null}

                {/* Action button if pending */}
                {(item.status || 'pending').toLowerCase() === 'pending' && (
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => handleCancelBooking(item.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF7' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFE4D6',
  },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  backText: { fontSize: 28, color: '#1F1610', fontWeight: '900', lineHeight: 30 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F1610' },
  syncText: { fontSize: 10, color: '#FF9100', fontWeight: '700', marginTop: 1 },
  refreshBtn: { padding: 4 },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8C7D73', fontSize: 13, marginTop: 10, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1F1610' },
  emptySubtitle: { fontSize: 13, color: '#8C7D73', marginTop: 6, marginBottom: 24, textAlign: 'center' },
  bookNowBtn: {
    backgroundColor: '#E23744',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookNowText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 4,
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tableBadge: { backgroundColor: '#FFF3EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  tableBadgeText: { color: '#E23744', fontWeight: '900', fontSize: 14 },
  guestsBadge: { fontSize: 13, fontWeight: '800', color: '#1F1610' },
  statusBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusTitle: { fontSize: 13, fontWeight: '900' },
  statusDesc: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF9F5', padding: 12, borderRadius: 12 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '900', color: '#8C7D73' },
  detailValue: { fontSize: 14, fontWeight: '900', color: '#1F1610', marginTop: 2 },
  notesBox: { marginTop: 10, backgroundColor: '#FFF8F0', borderRadius: 10, padding: 10 },
  notesLabel: { fontSize: 12, color: '#5C4E43', fontWeight: '700' },
  cancelBtn: { marginTop: 12, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '900' },
});
