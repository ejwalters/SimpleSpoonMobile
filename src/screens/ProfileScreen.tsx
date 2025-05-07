import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 Your Profile</Text>
      <Text style={styles.subtext}>Customize your preferences and pantry.</Text>
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
  }
})
