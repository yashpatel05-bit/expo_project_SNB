import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../api/ApiClient';

export default function FeedbackScreen({ route, navigation }) {
  const { user } = useAuth();
  const orderId = route.params?.orderId || null;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit feedback.');
      return;
    }
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitFeedback({
        user_id: user.id,
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
      });
      if (res.data?.success) {
        Alert.alert('Thank You!', 'Your feedback has been submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Failed', res.data?.message || 'Could not submit feedback');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1F1610" />
        </Pressable>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.heroCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#E23744" style={{ marginBottom: 8 }} />
          <Text style={styles.heroTitle}>We'd love your feedback!</Text>
          <Text style={styles.heroSubtitle}>
            Help us make Sip & Bite even better
          </Text>
        </View>

        {orderId && (
          <View style={styles.orderRef}>
            <Text style={styles.orderRefText}>For Order #{orderId}</Text>
          </View>
        )}

        {/* Star Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionLabel}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {stars.map((s) => (
              <Pressable key={s} onPress={() => setRating(s)} style={styles.starButton}>
                <Ionicons
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={s <= rating ? '#FF9100' : '#D6C4B4'}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Tell us more (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="What did you enjoy? What can we improve?"
            placeholderTextColor="#A89E91"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF8F0" />
          ) : (
            <Text style={styles.submitText}>Submit Feedback</Text>
          )}
        </Pressable>
      </ScrollView>
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

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Hero
  heroCard: {
    alignItems: 'center', backgroundColor: '#3D2D25', borderRadius: 20,
    marginBottom: 20, paddingHorizontal: 24, paddingVertical: 28,
  },
  heroEmoji: { fontSize: 44, marginBottom: 10 },
  heroTitle: { color: '#FFF8F0', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { color: '#D6C4B4', fontSize: 12, marginTop: 6, textAlign: 'center' },

  orderRef: {
    backgroundColor: '#F1ECE6', borderRadius: 10, marginBottom: 20,
    padding: 12, alignItems: 'center',
  },
  orderRefText: { color: '#73695F', fontSize: 13, fontWeight: '700' },

  // Rating
  ratingSection: { alignItems: 'center', marginBottom: 28 },
  sectionLabel: { color: '#332D28', fontSize: 15, fontWeight: '800', marginBottom: 16, alignSelf: 'flex-start' },
  starsRow: { flexDirection: 'row', gap: 10 },
  starButton: { padding: 4 },
  star: { color: '#D6C4B4', fontSize: 40 },
  starActive: { color: '#F9A825' },
  ratingLabel: { color: '#B86B3D', fontSize: 14, fontWeight: '700', marginTop: 10 },

  // Comment
  commentSection: { marginBottom: 24 },
  commentInput: {
    backgroundColor: '#FFFFFF', borderColor: '#EFE8E0', borderRadius: 14,
    borderWidth: 1, color: '#2D2925', fontSize: 14, minHeight: 120, padding: 16,
  },

  // Submit
  submitButton: {
    alignItems: 'center', backgroundColor: '#B86B3D', borderRadius: 14,
    height: 52, justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF8F0', fontSize: 15, fontWeight: '800' },
});
