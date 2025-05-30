import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { API_BASE_URL } from '../constants/config'

// InspireScreen: Allows user to prompt AI for recipe inspiration based on input text
export default function InspireScreen({ navigation }) {
  const [input, setInput] = useState('')              // User input prompt
  const [loading, setLoading] = useState(false)       // Loading state for fetch
  const [recipes, setRecipes] = useState([])          // Array of AI-generated recipe cards

  // Fetch recipes from backend using input as prompt
  const handleGetInspiration = async () => {
    if (!input.trim()) return
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/inspire-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })

      const data = await res.json()
      setRecipes(data.recipes || [])
    } catch (err) {
      console.error('Inspiration error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Render a single AI-generated recipe card
  const renderRecipe = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>

      {/* Tags display */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
      >
        {(item.tag || []).map((tag, idx) => (
          <View key={idx} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.cardHighlight}>{item.highlight}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>🍳 What should we make?</Text>
        <Text style={styles.subtext}>Ask for ideas, ingredients to use, or meal types.</Text>

        {/* Prompt input with icon button */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. healthy dinner with mushrooms"
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.iconButton} onPress={handleGetInspiration}>
            <Ionicons name="sparkles-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Loader or recipe results */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF5C8A" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item, idx) => idx.toString()}
            contentContainerStyle={{ paddingVertical: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

// Style definitions
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF6F0'
  },
  container: {
    flex: 1,
    padding: 20
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6
  },
  subtext: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderColor: '#EEE',
    borderWidth: 1
  },
  iconButton: {
    backgroundColor: '#FF5C8A',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    color: '#FF5C8A'
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF5C8A22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5C8A'
  },
  cardHighlight: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22
  }
})
