import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Speech from 'expo-speech'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params
  const insets = useSafeAreaInsets()
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;
  
    const recipeData = {
        title: recipe.title,
        tag: recipe.tag || 'Uncategorized',
        ingredients: recipe.ingredients || ['No ingredients provided.'],
        instructions: recipe.instructions || ['No instructions provided.']
    };      
  
    try {
      const res = await fetch('http://localhost:3001/ask-ai-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion,
          recipe: recipeData
        })
      });
  
      const data = await res.json();
      setAiResponse(data.answer || 'Sorry, something went wrong.');
      // Optional: speak the response
      // Speech.speak(data.answer || 'Sorry, something went wrong.');
    } catch (err) {
      console.error('AI Error:', err);
      setAiResponse('Error contacting the AI chef.');
    }
  };  
  
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.imageContainer}>
          <Image source={recipe.image} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)']}
            style={styles.imageGradient}
          />
          <View style={[styles.topButtons, { top: insets.top - 50 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={28} color="#FF5C8A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={26} color="#FF5C8A" />
            </TouchableOpacity>
          </View>
          <View style={styles.titleOverlay}>
            <Text style={styles.title}>{recipe.title}</Text>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>{recipe.tag}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.floatingMicButton} onPress={handleAIQuestion}>
          <Ionicons name="mic-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.detailsSection}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🧾 Ingredients</Text>
            <View style={styles.ingredientGrid}>
                {(recipe.ingredients || []).map((item, idx) => (
                    <Text key={idx} style={styles.ingredient}>{item}</Text>
                ))}
            </View>

          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👩‍🍳 Instructions</Text>
            <View style={styles.stepBox}>
                {(recipe.instructions || []).map((step, idx) => (
                    <Text key={idx} style={styles.step}>{`${idx + 1}. ${step}`}</Text>
                ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🧠 Ask the AI Chef</Text>
            <Text style={styles.aiHelperText}>Need substitutions or have a question?</Text>
            <View style={styles.voiceRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. Can I swap banana?"
                value={aiQuestion}
                onChangeText={setAiQuestion}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.voiceButton} onPress={handleAIQuestion}>
                <Ionicons name="chatbubble-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            {aiResponse.length > 0 && (
              <View style={styles.aiResponseBox}>
                <Text style={styles.aiResponseText}>{aiResponse}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5F7'
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.65,
    position: 'relative',
    backgroundColor: '#eee',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imageGradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: 120
  },
  topButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  favoriteButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  floatingMicButton: {
    position: 'absolute',
    right: 20,
    top: SCREEN_WIDTH * 0.65 + 20,
    backgroundColor: '#FF5C8A',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 5
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 8
  },
  tagPill: {
    backgroundColor: '#FF5C8A99',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: 'center'
  },
  tagText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 40
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5C8A',
    marginBottom: 12
  },
  ingredientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  ingredient: {
    backgroundColor: '#FFF5F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#333'
  },
  stepBox: {},
  step: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10
  },
  aiHelperText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderColor: '#EEE',
    borderWidth: 1,
    fontSize: 14
  },
  voiceButton: {
    backgroundColor: '#FF5C8A',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiResponseBox: {
    backgroundColor: '#FFF5F7',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderColor: '#DDD',
    borderWidth: 1
  },
  aiResponseText: {
    fontSize: 14,
    color: '#444'
  }
})
