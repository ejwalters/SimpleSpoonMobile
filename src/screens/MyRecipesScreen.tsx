import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { supabase } from '../services/supabaseClient'
import Ionicons from 'react-native-vector-icons/Ionicons'

const recipeFilters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function MyRecipesScreen() {
  const navigation = useNavigation()
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [recipes, setRecipes] = useState([])
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Debounce the search input to reduce unnecessary requests
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  // Retrieve user ID from Supabase
  useEffect(() => {
    const user = supabase.auth.user()
    if (user) setUserId(user.id)
  }, [])

  // Fetch recipes whenever the userId, search term, or filter changes
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    const fetchRecipes = async () => {
      try {
        const params = new URLSearchParams({ user_id: userId })
        if (debouncedSearch) params.append('search', debouncedSearch)
        if (selectedFilter !== 'All') params.append('tag', selectedFilter)

        const res = await fetch(`http://localhost:3001/api/recipes?${params.toString()}`)
        const data = await res.json()
        setRecipes(data.recipes || [])
      } catch (err) {
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [userId, debouncedSearch, selectedFilter])

  const renderItem = ({ item }) => {
    if (item.id === 'spacer') {
      return <View style={[styles.card, styles.spacer]} />
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      >
        {/* Conditionally render recipe image or a placeholder if not available */}
        {item.image?.uri ? (
          <Image source={item.image} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="restaurant-outline" size={36} color="#FF5C8A" />
            <Text style={styles.placeholderInitials}>
              {item.title?.split(' ').map(w => w[0]).join('').toUpperCase() || '🍽️'}
            </Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>My Recipes ({recipes.length})</Text>

      {/* Search bar input */}
      <TextInput
        placeholder="Search your recipes"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {recipeFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[styles.chip, selectedFilter === filter && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe list or loading/empty states */}
      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading recipes...</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recipes found.</Text>
          <Text style={styles.emptySubtext}>
            Try a different filter or create your first recipe!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes.length === 1 ? [...recipes, { id: 'spacer' }] : recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingTop: 12 }]}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </SafeAreaView>
  )
}

// Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 20,
    paddingTop: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 8
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0
  },
  chipActive: {
    backgroundColor: '#FF5C8A'
  },
  chipText: {
    fontSize: 14,
    color: '#555'
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600'
  },
  list: {
    paddingBottom: 100
  },
  row: {
    justifyContent: 'space-between'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    width: '48%',
    marginBottom: 20
  },
  spacer: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0
  },
  image: {
    width: '100%',
    height: 110,
    resizeMode: 'cover'
  },
  cardBody: {
    padding: 12
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  tagPill: {
    backgroundColor: '#FF5C8A22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  moreTagPill: {
    backgroundColor: '#FF5C8A44'
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5C8A'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888'
  },
  placeholderImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#FFE4EF',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  placeholderInitials: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5C8A',
    letterSpacing: 2
  }
})
