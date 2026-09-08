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

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        name.trim(),
        email.trim(),
        password.trim(),
        phone.trim() || null,
        address.trim() || null,
      );
      if (!result.success) {
        Alert.alert('Registration Failed', result.message);
      }
      // On success, AuthContext auto-navigates via user state change
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to connect to server');
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
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>

        <View style={styles.heroMini}>
          <Text style={styles.brand}>
            Create <Text style={styles.brandAccent}>Account</Text>
          </Text>
          <Text style={styles.tagline}>Join the Sip & Bite family</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <InputField label="Full Name *" placeholder="Your name" value={name} onChangeText={setName} />
          <InputField label="Email *" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Phone" placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputField label="Address" placeholder="Your address" value={address} onChangeText={setAddress} />
          <InputField label="Password *" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />

          <Pressable
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8F0" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Already have an account? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, placeholder, value, onChangeText, ...rest }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A89E91"
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3D2D25',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  backButton: {
    paddingVertical: 6,
  },
  backText: {
    color: '#D6C4B4',
    fontSize: 14,
    fontWeight: '600',
  },
  heroMini: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  brand: {
    color: '#FFF8F0',
    fontSize: 28,
    fontWeight: '900',
  },
  brandAccent: {
    color: '#D98A54',
  },
  tagline: {
    color: '#D6C4B4',
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FBF8F4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#5C534A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F1ECE6',
    borderRadius: 12,
    color: '#2D2925',
    fontSize: 14,
    height: 46,
    paddingHorizontal: 16,
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: '#B86B3D',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFF8F0',
    fontSize: 15,
    fontWeight: '800',
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginHint: {
    color: '#9B8D7B',
    fontSize: 13,
  },
  loginLink: {
    color: '#B86B3D',
    fontSize: 13,
    fontWeight: '800',
  },
});
