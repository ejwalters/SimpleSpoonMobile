import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function CookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🍳 Let’s Cook</Text>
      <Text style={styles.subtext}>Your AI sous-chef is standing by.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF6F0'
  },
  text: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8
  },
  subtext: {
    fontSize: 16,
    color: '#666'
  }
})
