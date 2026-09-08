import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createBooking, getUserBookings, cancelBooking } from '../api/ApiClient';

export default function TableBookingScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('BOOK'); // 'BOOK' or 'STATUS'

  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(false);

  // History State
  const [userBookings, setUserBookings] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'STATUS') {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setFetchingHistory(true);
    try {
      const res = await getUserBookings(user.id);
      if (res.data?.success) {
        setUserBookings(res.data.data || []);
      }
    } catch (_) {
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to reserve a table.');
      navigation.navigate('Login');
      return;
    }

    if (!date.trim() || !time.trim() || !guests.trim()) {
      Alert.alert('Missing Details', 'Please enter date, time, and number of guests.');
      return;
    }

    setLoading(true);
    try {
      const req = {
        user_id: user.id,
        table_id: null,
        booking_date: date.trim(),
        booking_time: time.trim(),
        guests_count: parseInt(guests, 10) || 2,
        special_request: specialRequest.trim() || null,
      };

      const res = await createBooking(req);
      if (res.data?.success) {
        Alert.alert(
          '🎉 Table Reservation Requested!',
          'Your table booking has been submitted. Switch to "My Table Status" tab to see live admin confirmation status.',
          [
            {
              text: 'View My Reservation Status ->',
              onPress: () => setActiveTab('STATUS'),
            },
          ]
        );
        setDate('');
        setTime('');
        setSpecialRequest('');
      } else {
        Alert.alert('Booking Error', res.data?.message || 'Failed to request table booking');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert('Cancel Table', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep Reservation', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await cancelBooking(bookingId);
            if (res.data?.success) {
              Alert.alert('Cancelled', 'Your reservation was cancelled.');
              fetchHistory();
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not cancel.');
          }
        },
      },
    ]);
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'approved') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
          <Text style={[styles.statusBadgeText, { color: '#15803D' }]}>✅ CONFIRMED BY ADMIN</Text>
        </View>
      );
    }
    if (s === 'cancelled' || s === 'rejected') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
          <Text style={[styles.statusBadgeText, { color: '#B91C1C' }]}>❌ CANCELLED</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
        <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>⏳ PENDING APPROVAL</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>Table Reservations</Text>
        <Pressable onPress={() => navigation.navigate('TableBookingHistory')} style={{ padding: 4 }}>
          <Ionicons name="list-outline" size={24} color="#1F1610" />
        </Pressable>
      </View>

      {/* Segmented Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <Pressable
          style={[styles.tabBtn, activeTab === 'BOOK' && styles.tabBtnActive]}
          onPress={() => setActiveTab('BOOK')}
        >
          <Ionicons name="calendar-outline" size={16} color={activeTab === 'BOOK' ? '#FFFFFF' : '#8C7D73'} style={{marginRight: 4}} />
          <Text style={[styles.tabBtnText, activeTab === 'BOOK' && styles.tabBtnTextActive]}>
            Book a Table
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === 'STATUS' && styles.tabBtnActive]}
          onPress={() => setActiveTab('STATUS')}
        >
          <Ionicons name="bookmark-outline" size={16} color={activeTab === 'STATUS' ? '#FFFFFF' : '#8C7D73'} style={{marginRight: 4}} />
          <Text style={[styles.tabBtnText, activeTab === 'STATUS' && styles.tabBtnTextActive]}>
            My Status
          </Text>
        </Pressable>
      </View>

      {activeTab === 'BOOK' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>🪑🔥</Text>
            <Text style={styles.heroTitle}>Reserve Your Special Table</Text>
            <Text style={styles.heroSubtitle}>
              Experience hot coffee & delicious dining at Sip N Bite Café
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Visit</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g. 2026-09-15)"
                placeholderTextColor="#A89E91"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time Slot</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 7:30 PM"
                placeholderTextColor="#A89E91"
                value={time}
                onChangeText={setTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>👥 Number of Guests</Text>
              <View style={styles.guestSelector}>
                {['1', '2', '4', '6', '8+'].map((num) => (
                  <Pressable
                    key={num}
                    style={[styles.guestChip, guests === num && styles.guestChipActive]}
                    onPress={() => setGuests(num)}
                  >
                    <Text style={[styles.guestChipText, guests === num && styles.guestChipTextActive]}>
                      {num} {num === '1' ? 'Guest' : 'Guests'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📝 Special Requests (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Birthday celebration, window seat, high chair..."
                placeholderTextColor="#A89E91"
                value={specialRequest}
                onChangeText={setSpecialRequest}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmitBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Table Reservation 🔥</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        /* Status Tab */
        <View style={{ flex: 1 }}>
          {fetchingHistory ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#FF3D00" />
              <Text style={{ color: '#8C7D73', marginTop: 8, fontWeight: '700' }}>Fetching your table status...</Text>
            </View>
          ) : userBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🪑</Text>
              <Text style={styles.emptyTitle}>No Table Booked Yet</Text>
              <Text style={styles.emptySubtitle}>Book a table now and check live admin confirmation status here!</Text>
              <Pressable style={styles.bookNowBtn} onPress={() => setActiveTab('BOOK')}>
                <Text style={styles.bookNowText}>🔥 Reserve a Table</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={userBookings}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.historyList}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTableTitle}>
                      🪑 {item.table ? `Table #${item.table.table_number}` : `Reservation #${item.id}`}
                    </Text>
                    <Text style={styles.cardGuests}>👥 {item.guests_count} Guests</Text>
                  </View>

                  {renderStatusBadge(item.status)}

                  <View style={styles.cardDetailsRow}>
                    <View>
                      <Text style={styles.cardDetailLabel}>DATE</Text>
                      <Text style={styles.cardDetailVal}>{item.booking_date}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardDetailLabel}>TIME</Text>
                      <Text style={styles.cardDetailVal}>{item.booking_time}</Text>
                    </View>
                  </View>

                  {(item.status || 'pending').toLowerCase() === 'pending' && (
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => handleCancelBooking(item.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </Pressable>
                  )}
                </View>
              )}
            />
          )}
        </View>
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

  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4D6',
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFF9F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4D6',
  },
  tabBtnActive: { backgroundColor: '#FF3D00', borderColor: '#FF3D00' },
  tabBtnText: { fontSize: 13, fontWeight: '800', color: '#8C7D73' },
  tabBtnTextActive: { color: '#FFFFFF' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#FF3D00',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 12, color: '#FFEAE0', marginTop: 4, textAlign: 'center', fontWeight: '600' },

  formSection: { gap: 16 },
  inputGroup: {},
  inputLabel: { fontSize: 13, fontWeight: '800', color: '#1F1610', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#1F1610',
    fontWeight: '700',
  },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  guestSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  guestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
  },
  guestChipActive: { backgroundColor: '#FF3D00', borderColor: '#FF3D00' },
  guestChipText: { fontSize: 13, fontWeight: '800', color: '#8C7D73' },
  guestChipTextActive: { color: '#FFFFFF' },

  submitButton: {
    backgroundColor: '#FF3D00',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#1F1610' },
  emptySubtitle: { fontSize: 13, color: '#8C7D73', marginTop: 4, textAlign: 'center' },
  bookNowBtn: { marginTop: 16, backgroundColor: '#FF3D00', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  bookNowText: { color: '#FFF', fontWeight: '900', fontSize: 13 },

  historyList: { padding: 16 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 3,
    shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTableTitle: { fontSize: 15, fontWeight: '900', color: '#1F1610' },
  cardGuests: { fontSize: 13, fontWeight: '800', color: '#FF3D00' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, marginBottom: 10 },
  statusBadgeText: { fontSize: 12, fontWeight: '900' },
  cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF9F5', padding: 10, borderRadius: 10 },
  cardDetailLabel: { fontSize: 9, fontWeight: '900', color: '#8C7D73' },
  cardDetailVal: { fontSize: 13, fontWeight: '900', color: '#1F1610', marginTop: 2 },
  cancelBtn: { marginTop: 10, backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '900' },
});
