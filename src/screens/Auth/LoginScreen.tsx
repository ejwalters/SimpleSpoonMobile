import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { supabase } from '../../services/supabaseClient'

export default function LoginScreen({ navigation }) {
  // Local state for controlled inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Handles login using Supabase auth
  const handleLogin = async () => {
    const { error } = await supabase.auth.signIn({ email, password })

    // Show alert if login fails
    if (error) Alert.alert('Login failed', error.message)
  }

  return (
    // Avoids keyboard covering input fields on iOS
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Greeting section at top */}
      <View style={styles.topSection}>
        <Text style={styles.welcome}>👋 Welcome back</Text>
        <Text style={styles.subtitle}>Let's get you cooking again.</Text>
      </View>

      {/* Card-like login form container */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Log In</Text>

        {/* Email input */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password input */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          style={styles.input}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Submit button */}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>→ Enter</Text>
        </Pressable>
      </View>

      {/* Link to signup screen */}
      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>
          No account yet? <Text style={styles.linkAccent}>Create one →</Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

// Style definitions for layout and UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7', // Soft, friendly pink background
    justifyContent: 'flex-start',
    padding: 24
  },
  topSection: {
    marginTop: 60,
    marginBottom: 40
  },
  welcome: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1A1A1A'
  },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 18,
    color: '#222'
  },
  button: {
    backgroundColor: '#FF5C8A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600'
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666'
  },
  linkAccent: {
    fontWeight: '600',
    color: '#FF5C8A'
  }
})
