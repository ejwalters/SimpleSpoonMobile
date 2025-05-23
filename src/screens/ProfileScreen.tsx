import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../services/supabaseClient'
import { useNavigation } from '@react-navigation/native'

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 Your Profile</Text>
      <Text style={styles.subtext}>Customize your preferences and pantry.</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F3FF'
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8
  },
  subtext: {
    fontSize: 16,
    color: '#666'
  },
  signOutButton: {
    marginTop: 32,
    backgroundColor: '#FF5C8A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
})
