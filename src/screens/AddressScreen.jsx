import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, storeAddress, deleteAddress } from '../api/ApiClient';

export default function AddressScreen({ navigation }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getUserAddresses(user.id);
      if (res.data?.success) setAddresses(res.data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !addressLine.trim()) {
      Alert.alert('Error', 'Title and Address are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await storeAddress({
        user_id: user.id,
        title: title.trim(),
        address_line: addressLine.trim(),
        city: city.trim() || null,
        pincode: pincode.trim() || null,
      });
      if (res.data?.success) {
        resetForm();
        fetchAddresses();
      } else {
        Alert.alert('Failed', res.data?.message || 'Could not save address');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            fetchAddresses();
          } catch (_) {
            Alert.alert('Error', 'Could not delete address');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setShowForm(false);
    setTitle('');
    setAddressLine('');
    setCity('');
    setPincode('');
  };

  const getAddressIconName = (t) => {
    const lower = (t || '').toLowerCase();
    if (lower.includes('home')) return 'home-outline';
    if (lower.includes('work') || lower.includes('office')) return 'business-outline';
    return 'location-outline';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <Pressable
          onPress={() => setShowForm(!showForm)}
          style={styles.addHeaderButton}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#E23744" />
        </Pressable>
      </View>

      {/* Add Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Label (e.g. Home, Work)"
            placeholderTextColor="#A89E91"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Address Line"
            placeholderTextColor="#A89E91"
            value={addressLine}
            onChangeText={setAddressLine}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.flexInput]}
              placeholder="City"
              placeholderTextColor="#A89E91"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.input, styles.flexInput]}
              placeholder="Pincode"
              placeholderTextColor="#A89E91"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
            />
          </View>
          <Pressable
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveText}>Save Address</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Address List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#E23744" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color="#E23744" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>No Addresses Saved</Text>
          <Text style={styles.emptySub}>Add your home or office address for faster delivery.</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.addressCard}>
              <Ionicons name={getAddressIconName(item.title)} size={22} color="#E23744" style={{ marginRight: 12 }} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>{item.title}</Text>
                <Text style={styles.addressText}>{item.address_line}</Text>
                {(item.city || item.pincode) && (
                  <Text style={styles.addressSub}>
                    {[item.city, item.pincode].filter(Boolean).join(' - ')}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color="#E23744" />
              </Pressable>
            </View>
          )}
        />
      )}
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
  addHeaderButton: {
    alignItems: 'center', backgroundColor: '#B86B3D', borderRadius: 16,
    height: 32, justifyContent: 'center', width: 32,
  },
  addHeaderText: { color: '#FFF8F0', fontSize: 20, fontWeight: '600', marginTop: -1 },

  // Form
  formCard: {
    backgroundColor: '#FFFFFF', borderBottomColor: '#EFE8E0', borderBottomWidth: 1,
    paddingHorizontal: 16, paddingVertical: 18,
  },
  formTitle: { color: '#332D28', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  input: {
    backgroundColor: '#F1ECE6', borderRadius: 12, color: '#2D2925',
    fontSize: 14, height: 44, marginBottom: 10, paddingHorizontal: 14,
  },
  inputRow: { flexDirection: 'row', gap: 10 },
  saveButton: {
    alignItems: 'center', backgroundColor: '#B86B3D', borderRadius: 12,
    height: 44, justifyContent: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFF8F0', fontSize: 14, fontWeight: '800' },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  loadingState: { alignItems: 'center', flex: 1, justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { color: '#2D2925', fontSize: 18, fontWeight: '800' },
  emptySubtext: { color: '#9B8D7B', fontSize: 13, marginTop: 4, textAlign: 'center' },

  // Address card
  addressCard: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16,
    elevation: 1, flexDirection: 'row', marginBottom: 12, padding: 16,
    shadowColor: '#3D2D25', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  addressIcon: {
    alignItems: 'center', backgroundColor: '#F1ECE6', borderRadius: 14,
    height: 44, justifyContent: 'center', width: 44,
  },
  addressIconText: { fontSize: 20 },
  addressInfo: { flex: 1, marginLeft: 14 },
  addressTitle: { color: '#2D2925', fontSize: 14, fontWeight: '800' },
  addressLine: { color: '#5C534A', fontSize: 12, marginTop: 2 },
  addressMeta: { color: '#9B8D7B', fontSize: 11, marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 18 },
});
