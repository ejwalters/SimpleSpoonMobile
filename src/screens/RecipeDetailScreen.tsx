import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
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
import { supabase } from '../services/supabaseClient'
import { API_BASE_URL } from '../constants/config'
import Carousel from 'react-native-reanimated-carousel'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params
  const insets = useSafeAreaInsets()
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [userId, setUserId] = useState(null)
  const [showSaveTooltip, setShowSaveTooltip] = useState(false)
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = supabase.auth.user()
    if (user) setUserId(user.id)
  }, [])

  // Check if recipe is already favorited by user when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (!userId || !recipe?.id) return;

      const checkFavoriteStatus = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/favorite-recipe-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, recipe_id: recipe.id })
          });

          const data = await res.json();
          setIsFavorited(!!data.isFavorited);
        } catch (err) {
          console.error('Error checking favorite status:', err);
        }
      };

      checkFavoriteStatus();
    }, [userId, recipe?.id])
  );

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return

    const recipeData = {
      title: recipe.title,
      tag: recipe.tag || 'Uncategorized',
      ingredients: recipe.ingredients || ['No ingredients provided.'],
      instructions: recipe.instructions || ['No instructions provided.']
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ask-ai-chef`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion,
          recipe: recipeData
        })
      })
      const data = await res.json()
      setAiResponse(data.answer || 'Sorry, something went wrong.')
    } catch (err) {
      console.error('AI Error:', err)
      setAiResponse('Error contacting the AI chef.')
    }
  }

  const isOwner = recipe.user_id && userId && recipe.user_id === userId
  const isAISuggestion = !recipe.user_id

  const handleSaveRecipe = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/save-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: { ...recipe, user_id: userId } })
      })
      const data = await res.json()
      if (data.success) alert('Recipe saved!')
      else alert('Failed to save recipe.')
    } catch (err) {
      alert('Error saving recipe.')
    }
  }

  const handleFavorite = async () => {
    if (!userId || !recipe.id) return;

    try {
      const endpoint = '/favorite-recipe';
      const method = isFavorited ? 'DELETE' : 'POST';

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, recipe_id: recipe.id })
      });

      const data = await res.json();
      if (data.success) {
        setIsFavorited(!isFavorited);
      } else {
        alert('Failed to update favorite status.');
      }
    } catch (err) {
      alert('Error updating favorite.');
    }
  }

  const images = [
    recipe.image, // main image
    ...(recipe.supporting_images || []), // supporting images
  ].filter(Boolean); // remove any null/undefined

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/save-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: { ...recipe, user_id: userId } })
      })
      const data = await res.json()
      if (data.success) {
        alert('Recipe saved!')
        setIsEditing(false)
      } else {
        alert('Failed to save recipe.')
      }
    } catch (err) {
      alert('Error saving recipe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: isEditing ? 120 : 60 }}>
          <View style={styles.imageContainer}>
            {images.length > 0 ? (
              <Carousel
                width={SCREEN_WIDTH}
                height={SCREEN_WIDTH * 0.65}
                data={images}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
              />
            ) : (
              <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFE4EF' }]}> 
                <Ionicons name="restaurant-outline" size={64} color="#FF5C8A" />
                <Text style={styles.placeholderText}>
                  {recipe.title?.split(' ').map(w => w[0]).join('').toUpperCase() || '��️'}
                </Text>
              </View>
            )}

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)']} style={styles.imageGradient} />

            <View style={[styles.topButtons, { top: insets.top - 50 }]}> 
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#FF5C8A" />
              </TouchableOpacity>
              {recipe.id && userId && (
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={handleFavorite}
                  onLongPress={() => setShowFavoriteTooltip(true)}
                >
                  <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={26} color="#FF5C8A" />
                </TouchableOpacity>
              )}
            </View>

            {showFavoriteTooltip && (
              <View style={[styles.tooltip, { position: 'absolute', top: 40, right: 10 }]}> 
                <Text style={styles.tooltipText}>Quickly access this recipe from your favorites.</Text>
                <TouchableOpacity onPress={() => setShowFavoriteTooltip(false)}>
                  <Text style={styles.tooltipClose}>Got it</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.titleOverlay}>
              <Text style={styles.title}>{recipe.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
                {(recipe.tag || []).map((tag, index) => (
                  <View key={index} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🧾 Ingredients</Text>
              <View style={styles.ingredientGrid}>
                {(recipe.ingredients || []).map((item, idx) => (
                  <Text key={idx} style={styles.ingredient}>{item}</Text>
                ))}
              </View>
            </View>

            {recipe.nutrition_info && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🍎 Nutritional Info</Text>
                <View style={styles.ingredientGrid}>
                  {(() => {
                    const nutrition = Array.isArray(recipe.nutrition_info) && recipe.nutrition_info.length === 1
                      ? recipe.nutrition_info[0]
                      : recipe.nutrition_info
                    return Object.entries(nutrition).map(([key, value]) => (
                      <Text key={key} style={styles.ingredient}>{`${key.charAt(0).toUpperCase() + key.slice(1)}: ${typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}`}</Text>
                    ))
                  })()}
                </View>
              </View>
            )}

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
        {/* Floating Action Button for Edit */}
        {isOwner && !isEditing && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateRecipe', { recipe, isEdit: true })}
            activeOpacity={0.85}
          >
            <Ionicons name="pencil" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        {/* Save/Cancel Action Row at Bottom in Edit Mode */}
        {isEditing && (
          <View style={styles.editActionRow}>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#aaa', marginLeft: 12 }]}
              onPress={() => setIsEditing(false)}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    marginBottom: 8,
    textAlign: 'center'
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tagPill: {
    backgroundColor: '#FF5C8A99',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  tagText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 25
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
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#FF5C8A',
    letterSpacing: 2
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5C8A',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
    width: '90%',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff'
  },
  tooltip: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    maxWidth: 220,
    alignItems: 'center',
    marginTop: 8,
    zIndex: 100,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
  },
  tooltipClose: {
    color: '#FF5C8A',
    marginTop: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  imageScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  imageThumbContainer: {
    position: 'relative',
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    padding: 2,
  },
  addImageBtn: {
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    backgroundColor: '#FF5C8A99',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  chipInput: {
    flex: 1,
    padding: 10,
    borderColor: '#EEE',
    borderWidth: 1,
    fontSize: 14
  },
  nutritionCard: {
    marginBottom: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutritionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutritionInput: {
    flex: 1,
    padding: 10,
    borderColor: '#EEE',
    borderWidth: 1,
    fontSize: 14
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumberCircle: {
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  chipInputColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addActionBtn: {
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addActionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#FF5C8A99',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chipDelete: {
    backgroundColor: '#FF5C8A',
    borderRadius: 16,
    padding: 2,
  },
  chipText: {
    color: '#FF5C8A',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  addActionBtnDisabled: {
    backgroundColor: '#FFD6E8',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#FF5C8A',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
})
