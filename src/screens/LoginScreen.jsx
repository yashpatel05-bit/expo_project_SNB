import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password.trim());
      if (!result.success) {
        Alert.alert('Login Failed', result.message);
      }
    } catch (err) {
      Alert.alert('Connection Error', err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Area */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>☕</Text>
          <Text style={styles.brand}>
            Sip <Text style={styles.brandAccent}>&</Text> Bite
          </Text>
          <Text style={styles.tagline}>A little joy in every sip</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to continue</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A89E91"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#A89E91"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8F0" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3D2D25',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 60,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  brand: {
    color: '#FFF8F0',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  brandAccent: {
    color: '#D98A54',
  },
  tagline: {
    color: '#D6C4B4',
    fontSize: 13,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FBF8F4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    minHeight: 400,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  formTitle: {
    color: '#2D2925',
    fontSize: 24,
    fontWeight: '800',
  },
  formSubtitle: {
    color: '#9B8D7B',
    fontSize: 13,
    marginBottom: 28,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#5C534A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F1ECE6',
    borderRadius: 12,
    color: '#2D2925',
    fontSize: 14,
    height: 48,
    paddingHorizontal: 16,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#B86B3D',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFF8F0',
    fontSize: 15,
    fontWeight: '800',
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  registerHint: {
    color: '#9B8D7B',
    fontSize: 13,
  },
  registerLink: {
    color: '#B86B3D',
    fontSize: 13,
    fontWeight: '800',
  },
});
