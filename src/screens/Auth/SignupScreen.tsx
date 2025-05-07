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

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Signup failed', error.message)
    else Alert.alert('🎉 Success!', 'Check your email to confirm your account.')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topSection}>
        <Text style={styles.welcome}>🧁 Let's Get Started</Text>
        <Text style={styles.subtitle}>Create your SimpleSpoon account</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign Up</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          style={styles.input}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>→ Create Account</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkAccent}>Log in →</Text>
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F8F1', // soft mint
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
    backgroundColor: '#1B9A77',
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
    color: '#1B9A77'
  }
})
