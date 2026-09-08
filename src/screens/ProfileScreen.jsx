import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { updateProfilePhoto } from '../api/ApiClient';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handlePickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need photo gallery access to let you choose a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageAsset = result.assets[0];
        setUploading(true);

        const formData = new FormData();
        const filename = imageAsset.uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_photo', {
          uri: imageAsset.uri,
          name: filename,
          type,
        });

        const res = await updateProfilePhoto(formData);

        if (res.data?.success && res.data?.data) {
          updateUser(res.data.data);
          Alert.alert('Success 🎉', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Upload Failed', res.data?.message || 'Could not update profile photo');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while uploading your photo.');
    } finally {
      setUploading(false);
    }
  };

  const avatarUri = user?.profile_photo
    ? (user.profile_photo.startsWith('http')
        ? user.profile_photo
        : `http://10.0.2.2:8000/storage/${user.profile_photo}`)
    : null;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <Pressable style={styles.avatarContainer} onPress={handlePickProfileImage}>
            {uploading ? (
              <View style={[styles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {user ? user.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Not logged in'}</Text>
          
          <Pressable style={styles.changePhotoBtn} onPress={handlePickProfileImage}>
            <Ionicons name="camera-outline" size={16} color="#FF3D00" style={{ marginRight: 6 }} />
            <Text style={styles.changePhotoText}>Upload Photo from Phone</Text>
          </Pressable>
        </View>

        {/* Info Items */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Account Information</Text>
          <InfoRow iconName="mail-outline" label="Email Address" value={user?.email || 'N/A'} />
          <InfoRow iconName="call-outline" label="Phone Number" value={user?.phone || 'Not added'} />
          <InfoRow iconName="location-outline" label="Default Address" value={user?.address || 'Not added'} />
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text style={styles.sectionLabel}>App Features & Menu</Text>
          <LinkRow
            iconName="receipt-outline"
            label="My Order History & Live Track"
            onPress={() => navigation.navigate('OrderHistory')}
          />
          <LinkRow
            iconName="restaurant-outline"
            label="My Table Reservations & Admin Status"
            onPress={() => navigation.navigate('TableBookingHistory')}
          />
          <LinkRow
            iconName="calendar-outline"
            label="Reserve a New Table"
            onPress={() => navigation.navigate('TableBooking')}
          />
          <LinkRow
            iconName="location-outline"
            label="Saved Delivery Addresses"
            onPress={() => navigation.navigate('Address')}
          />
          <LinkRow
            iconName="chatbubble-ellipses-outline"
            label="Ratings & Feedback"
            onPress={() => navigation.navigate('Feedback', { orderId: null })}
          />
          <LinkRow
            iconName="information-circle-outline"
            label="About Sip N Bite Café"
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#C62828" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout Account</Text>
        </Pressable>

        <Text style={styles.versionText}>Sip N Bite Mobile v2.0 • Real Edition</Text>
      </ScrollView>
    </View>
  );
}

function InfoRow({ iconName, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={iconName} size={20} color="#FF3D00" style={{ marginRight: 12 }} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function LinkRow({ iconName, label, onPress }) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Ionicons name={iconName} size={20} color="#FF3D00" style={{ marginRight: 12 }} />
      <Text style={styles.linkLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#A89E91" />
    </Pressable>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 3,
    shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#FF3D00' },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FF3D00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
  },
  cameraIcon: { fontSize: 14 },
  userName: { fontSize: 20, fontWeight: '900', color: '#1F1610' },
  userEmail: { fontSize: 13, color: '#8C7D73', marginTop: 2, marginBottom: 12, fontWeight: '600' },
  changePhotoBtn: {
    backgroundColor: '#FFF5F0',
    borderWidth: 1.5,
    borderColor: '#FF3D00',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: { color: '#FF3D00', fontSize: 12, fontWeight: '900' },

  infoSection: { marginBottom: 20 },
  linksSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#FF9100', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
  },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#8C7D73', fontWeight: '700' },
  infoValue: { fontSize: 14, fontWeight: '900', color: '#1F1610', marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FFE4D6',
    elevation: 1,
  },
  linkIcon: { fontSize: 20, marginRight: 12 },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: '900', color: '#1F1610' },
  linkArrow: { fontSize: 22, color: '#FF3D00', fontWeight: '900' },

  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: { color: '#DC2626', fontSize: 15, fontWeight: '900' },
  versionText: { textAlign: 'center', color: '#8C7D73', fontSize: 12, marginTop: 20, fontWeight: '700' },
});
