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
import Ionicons from 'react-native-vector-icons/Ionicons'

// Sample data for saved recipes, friends, and seasonal ideas
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

const seasonalIdeas = [
  { id: '1', title: 'Spring Dinners 🌱' },
  { id: '2', title: 'Back-to-School Snacks 🎒' },
  { id: '3', title: 'Hearty Bowls 🥣' },
  { id: '4', title: 'Quick No-Bake Treats ❄️' }
]

// Add category icons (example, you can swap for your own icons/images)
const categories = [
  { key: 'breakfast', label: 'Breakfast', icon: 'ios-sunny' },
  { key: 'lunch', label: 'Lunch', icon: 'ios-restaurant' },
  { key: 'dinner', label: 'Dinner', icon: 'ios-moon' },
  { key: 'dessert', label: 'Dessert', icon: 'ios-ice-cream' },
  { key: 'snack', label: 'Snack', icon: 'ios-nutrition' },
]

const cookingTips = [
  { id: '1', tip: '🧊 Freeze chopped herbs in olive oil for quick flavor boosts' },
  { id: '2', tip: '🥣 Swap Greek yogurt for sour cream to add protein' },
  { id: '3', tip: '🔪 A sharp knife is safer than a dull one — really!' }
]


const collections = [
  {
    id: '1',
    title: '5-Ingredient Meals',
    image: { uri: 'https://www.simplyrecipes.com/thmb/ziaAVNudRwsfd_g3PsJk7ClZDVY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Skillet-Cacio-e-Pepe-Tortellini-LEAD-5-7da8ba9f4cd84afabdf938bafe7b92bc.jpg' }
  },
  {
    id: '2',
    title: 'Meal Prep Bowls',
    image: { uri: 'https://s23209.pcdn.co/wp-content/uploads/2017/05/Chicken-Burrito-Bowl-Meal-PrepIMG_9445edit.jpg' }
  },
  {
    id: '3',
    title: 'No-Bake Treats',
    image: { uri: 'https://minimalistbaker.com/wp-content/uploads/2021/03/No-Bake-Sugar-Cookie-Dough-Bites-SQUARE.jpg' }
  }
]


export default function HomeScreen() {
  // State for tags input, recipe suggestion, and manual ingredient text input
  const [ingredients, setIngredients] = useState('')
  const [recipeSuggestion, setRecipeSuggestion] = useState<null | { title: string; description: string }>(null)
  const [tags, setTags] = useState<string[]>([])

  // Simulated AI response handler — can be replaced with real OpenAI call
  const handleGetRecipe = () => {
    if (!ingredients.trim()) return

    setRecipeSuggestion({
      title: 'Cheesy Carrot Scramble 🥕🧀🍳',
      description: 'Sauté shredded carrots, add beaten eggs and cheese, and cook until fluffy!'
    })

    setIngredients('')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Bar: Greeting, sub-greeting, avatar */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.helloText}>Hello, Eric</Text>
            <Text style={styles.bigGreeting}>What's cooking?</Text>
          </View>
          <Image
            source={require('../assets/eric-avatar.png')}
            style={styles.avatar}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={22} color="#B0B0B0" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any recipes"
            placeholderTextColor="#B0B0B0"
          />
          <View style={styles.searchDivider} />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color="#B0B0B0" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        {/* AI Recipe Generator Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <Text style={styles.aiCardTitle}>✨ AI Recipe Generator</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={20} color="#4F4F4F" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aiCardSubtitle}>Build a meal with what you have</Text>
          <TouchableOpacity style={styles.aiCardButton} onPress={handleGetRecipe}>
            <Text style={styles.aiCardButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Recent Recipes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={savedRecipes}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activityList}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Image source={item.image} style={styles.activityImageRounded} />
              <Text style={styles.activityTitleCentered} numberOfLines={2}>{item.title}</Text>
            </View>
          )}
        />

        {/* Today's Inspiration */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today’s Inspiration</Text>
        </View>

        <View style={styles.featuredCard}>
          <Image source={{ uri: 'https://minimalistbaker.com/wp-content/uploads/2019/06/Crispy-Miso-Chickpea-Bowls-SQUARE.jpg' }} style={styles.featuredImage} />
          <Text style={styles.featuredTitle}>Creamy Chickpea Bowl</Text>
          <Text style={styles.featuredSubtitle}>Ready in 20 minutes · Vegan</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Collections to Explore</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={collections}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.collectionCard}>
              <Image source={item.image} style={styles.collectionImage} />
              <Text style={styles.collectionTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Tips & Tricks */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tips & Tricks</Text>
        </View>
        <FlatList
          horizontal
          data={cookingTips}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsList}
          renderItem={({ item }) => (
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  scrollContent: {
    padding: 0,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    marginBottom: 18,
  },
  helloText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  bigGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 0,
    fontFamily: 'Inter_700Bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: '#EEE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  searchDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E6E6E6',
    marginHorizontal: 10,
    borderRadius: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Inter_700Bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#1B9A77',
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
  },
  categoriesList: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexDirection: 'column',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryCardActive: {
    backgroundColor: '#1B9A77',
    borderColor: '#1B9A77',
  },
  categoryLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#4F4F4F',
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  recommendList: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  recommendCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 16,
    width: 150,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    padding: 10,
    alignItems: 'center',
  },
  recommendImage: {
    width: 120,
    height: 90,
    borderRadius: 14,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  recommendTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
  },
  recommendBy: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  aiCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Inter_700Bold',
  },
  aiCardSubtitle: {
    fontSize: 15,
    color: '#4F4F4F',
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  aiCardButton: {
    backgroundColor: '#1B9A77',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_700Bold',
  },
  activityItem: {
    alignItems: 'center',
    marginRight: 40,
    width: 110, // consistent with image width
  },
  activityImageRounded: {
    width: 130,
    height: 150,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  activityTitleCentered: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    alignSelf: 'stretch',
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: 4,
  },
  activityList: {
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  featuredImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },

  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 12,
    marginHorizontal: 16,
    fontFamily: 'Inter_700Bold',
  },

  featuredSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    marginHorizontal: 16,
    fontFamily: 'Inter_400Regular',
  },
  collectionList: {
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  collectionCard: {
    marginRight: 16,
    width: 140,
    alignItems: 'center',
  },
  collectionImage: {
    width: 140,
    height: 100,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  collectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  tipsList: {
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    maxWidth: 220,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Inter_400Regular',
  }
})
