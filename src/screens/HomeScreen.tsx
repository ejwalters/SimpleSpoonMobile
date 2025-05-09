import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Tags from 'react-native-tags'



const savedRecipes = [
  {
    id: '1',
    title: 'Berry Overnight Oats',
    image: { uri: 'https://iheartvegetables.com/wp-content/uploads/2022/10/Berry-Overnight-Oats-1-of-6.jpg' }
  },
  {
    id: '2',
    title: 'Veggie Egg Muffins',
    image: { uri: 'https://www.spendwithpennies.com/wp-content/uploads/2018/01/Veggie-Egg-Muffins-25.jpg' }
  },
  {
    id: '3',
    title: 'Peanut Butter Bites',
    image: { uri: 'https://www.sarahbakesgfree.com/wp-content/uploads/2018/04/peanut-butter-energy-bites.jpg' }
  }
]

const friends = [
  {
    id: '1',
    name: 'Jess',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    recipe: 'Peach Chia Pudding',
    comment: 'So refreshing & easy 🌞'
  },
  {
    id: '2',
    name: 'Mark',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    recipe: 'Protein Pancakes',
    comment: 'New Sunday tradition 💪'
  },
  {
    id: '3',
    name: 'Nina',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    recipe: 'Zucchini Noodles',
    comment: 'Topped with pesto — amazing!'
  }
]


const inspirations = ['Spring Lunches 🥗', '3-Ingredient Dinners 🍋', 'High-Protein Snacks 💪', 'Make-Ahead Meals ⏱️']

const seasonalIdeas = [
  { id: '1', title: 'Spring Dinners 🌱' },
  { id: '2', title: 'Back-to-School Snacks 🎒' },
  { id: '3', title: 'Hearty Bowls 🥣' },
  { id: '4', title: 'Quick No-Bake Treats ❄️' }
]



export default function HomeScreen() {

  const [ingredients, setIngredients] = React.useState('')
  const [recipeSuggestion, setRecipeSuggestion] = React.useState<null | { title: string; description: string }>(null)
  const [tags, setTags] = React.useState<string[]>([])

  const handleGetRecipe = () => {
    if (!ingredients.trim()) return
  
    // Simulated AI output (replace with OpenAI call later)
    setRecipeSuggestion({
      title: 'Cheesy Carrot Scramble 🥕🧀🍳',
      description: 'Sauté shredded carrots, add beaten eggs and cheese, and cook until fluffy!'
    })
  
    setIngredients('')
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>👋 Hi there</Text>
        <Text style={styles.subtext}>Let’s get something delicious started.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Go-Tos</Text>
          <FlatList
            horizontal
            data={savedRecipes}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            renderItem={({ item }) => (
              <View style={styles.recipeCard}>
                <Image source={item.image} style={styles.recipeImage} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Your Friends Are Cooking</Text>
          <FlatList
            horizontal
            data={friends}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendRecipeTitle}>{item.recipe}</Text>
                <Text style={styles.friendComment} numberOfLines={2}>{item.comment}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Picks This Week</Text>
        <View style={styles.seasonalGrid}>
          {seasonalIdeas.map((item) => (
            <View key={item.id} style={styles.seasonalCard}>
              <Text style={styles.seasonalText}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>

        <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Can You Make?</Text>
        <Text style={styles.subtext}>Enter a few ingredients you have on hand:</Text>

        <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <Tags
            initialText=""
            textInputProps={{
              placeholder: 'Add an ingredient',
              placeholderTextColor: '#888',
              backgroundColor: '#F8E5EC'
            }}
            containerStyle={styles.tagContainer}
            inputStyle={{ fontSize: 14 }}
            renderTag={({ tag, index, onPress }) => (
              <TouchableOpacity key={`${tag}-${index}`} onPress={onPress} style={styles.tag}>
                <Text style={styles.tagText}>{tag} ✕</Text>
              </TouchableOpacity>
            )}
            onChangeTags={setTags}
          />
        </View>

          <TouchableOpacity style={styles.getRecipeButton} onPress={handleGetRecipe}>
            <Text style={styles.getRecipeText}>🤖</Text>
          </TouchableOpacity>
        </View>


        {recipeSuggestion && (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>{recipeSuggestion.title}</Text>
            <Text style={styles.suggestionDesc}>{recipeSuggestion.description}</Text>
          </View>
        )}
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1A1A1A'
  },
  subtext: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  carousel: {
    gap: 16
  },
  recipeCard: {
    width: 160,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden'
  },
  recipeImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover'
  },
  recipeTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: '500'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gridItem: {
    backgroundColor: '#F3FBF6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: '48%',
    alignItems: 'center',
    marginBottom: 12
  },
  gridText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  cookButton: {
    backgroundColor: '#FF5C8A',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 12
  },
  cookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF'
  },
  friendsList: {
    gap: 16
  },
  friendCard: {
    width: 180,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 16
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8
  },
  friendName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2
  },
  friendRecipeTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF5C8A',
    marginBottom: 2
  },
  friendComment: {
    fontSize: 12,
    color: '#555'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
    flexWrap: 'nowrap'
  } 
  ,
  input: {
    flex: 1,
    backgroundColor: '#F8E5EC', // soft pink contrast
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#222',
    borderWidth: 1,
    borderColor: '#FF5C8A'
  },
  getRecipeButton: {
    backgroundColor: '#FF5C8A',
    padding: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  getRecipeText: {
    color: '#FFF',
    fontSize: 16
  },
  suggestionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4
  },
  suggestionDesc: {
    fontSize: 14,
    color: '#444'
  },
  tagContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF5C8A'
  },
  tag: {
    backgroundColor: '#E1F4EE', // soft mint green
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4
  },
  tagText: {
    color: '#1B9A77', // deeper mint or pine green
    fontWeight: '500'
  },
  seasonalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  seasonalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12
  },
  seasonalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center'
  }         
})
