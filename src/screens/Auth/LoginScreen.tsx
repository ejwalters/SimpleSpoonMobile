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
    if (error) Alert.alert('Login failed', error.message)
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Welcome Back 👋</Text>
        <Text style={styles.greetingSubtitle}>Log in to continue your healthy journey</Text>
      </View>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>Log In</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#B0B0B0"
          style={styles.input}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#B0B0B0"
          style={styles.input}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In →</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => navigation.navigate('Signup')} style={styles.signupLinkContainer}>
        <Text style={styles.signupLinkText}>
          No account yet? <Text style={styles.signupLinkAccent}>Create one →</Text>
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Even lighter background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  greetingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 32,
    marginLeft: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'left',
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#7B8D93',
    fontWeight: '400',
    textAlign: 'left',
  },
  loginCard: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: 'transparent', // Remove shadow
    elevation: 0,
    marginBottom: 32,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#F0F0F0', // Subtle border
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 22,
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 18,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    shadowColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#FF5C8A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupLinkContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  signupLinkText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#B0B0B0',
    fontWeight: '400',
  },
  signupLinkAccent: {
    fontWeight: '700',
    color: '#FF5C8A',
  },
})
