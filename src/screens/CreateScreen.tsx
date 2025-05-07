import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📝 Add a New Recipe</Text>
      <Text style={styles.subtext}>Start fresh or remix an old favorite.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FAF6'
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
