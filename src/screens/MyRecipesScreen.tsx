import React, { useState } from 'react'
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

const recipeFilters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

const myRecipes = [
  {
    id: '1',
    title: 'Banana Oat Pancakes',
    tag: 'Breakfast',
    highlight: 'Fluffy, naturally sweet pancakes made with ripe bananas and hearty oats.',
    ingredients: [
      '2 ripe bananas',
      '1 cup rolled oats',
      '2 eggs',
      '1/2 tsp baking powder',
      '1/2 tsp cinnamon',
      '1/4 tsp salt',
      '1/2 tsp vanilla extract',
      'Butter or oil for cooking'
    ],
    instructions: [
      'Blend bananas, oats, eggs, baking powder, cinnamon, salt, and vanilla until smooth.',
      'Heat a lightly oiled skillet over medium heat.',
      'Pour batter onto the skillet and cook for 2–3 minutes until bubbles form.',
      'Flip and cook for another 1–2 minutes until golden.',
      'Serve warm with fresh fruit or maple syrup.'
    ],
    image: {
      uri: 'https://www.ambitiouskitchen.com/wp-content/uploads/2019/04/bananaoatmealpancakes-6-1064x1064.jpg'
    }
  },
  {
    id: '2',
    title: 'Avocado Chicken Salad',
    tag: 'Lunch',
    highlight: 'A creamy, refreshing chicken salad made with ripe avocado instead of mayo.',
    ingredients: [
      '2 cups cooked shredded chicken',
      '1 ripe avocado',
      '1 tbsp lime juice',
      '1/4 cup chopped red onion',
      '1/4 cup chopped cilantro',
      '1/2 cup diced cucumber',
      'Salt and pepper to taste'
    ],
    instructions: [
      'In a large bowl, mash the avocado with lime juice until creamy.',
      'Add the shredded chicken, red onion, cilantro, and cucumber.',
      'Season with salt and pepper to taste.',
      'Mix everything until evenly coated.',
      'Serve in lettuce cups, on toast, or with crackers.'
    ],
    image: {
      uri: 'https://www.simplyrecipes.com/thmb/Jjz-656DUltc_dL2RPd6JzC7vII=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2015__09__avocado-chicken-salad-horiz-a-1500-19fe81af6205417e9ffcaf2c72b0b7b6.jpg'
    }
  },
  {
    id: '3',
    title: 'Peanut Butter Chia Bars',
    tag: 'Snack',
    highlight: 'No-bake bars packed with peanut butter, chia seeds, and natural sweetness.',
    ingredients: [
      '1 cup natural peanut butter',
      '1/3 cup honey or maple syrup',
      '1 tsp vanilla extract',
      '1/4 cup chia seeds',
      '1 1/2 cups rolled oats',
      'Pinch of salt'
    ],
    instructions: [
      'In a saucepan, warm peanut butter and honey over low heat until smooth.',
      'Remove from heat and stir in vanilla and salt.',
      'Mix in chia seeds and oats until fully combined.',
      'Press mixture into a parchment-lined 8x8 pan.',
      'Refrigerate for at least 1 hour, then cut into bars and store chilled.'
    ],
    image: {
      uri: 'https://www.wellplated.com/wp-content/uploads/2015/08/The-best-healthy-granola-bar-recipe-No-Bake-Chia-Bars-made-with-peanut-butter-and-honey.jpg'
    }
  }
]

export default function MyRecipesScreen() {
  const navigation = useNavigation()
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filteredRecipes = myRecipes.filter((recipe) =>
    selectedFilter === 'All' ? true : recipe.tag === selectedFilter
  )

  const renderItem = ({ item }) => {
    if (item.id === 'spacer') {
      return <View style={[styles.card, styles.spacer]} />
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      >
        <Image source={item.image} style={styles.image} />
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.tag}>{item.tag}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>My Recipes ({filteredRecipes.length})</Text>

      <TextInput
        placeholder="Search your recipes"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

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

      {filteredRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recipes found.</Text>
          <Text style={styles.emptySubtext}>
            Try a different filter or create your first recipe!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes.length === 1 ? [...filteredRecipes, { id: 'spacer' }] : filteredRecipes}
          renderItem={({ item }) => {
            if (item.id === 'spacer') return <View style={[styles.card, styles.spacer]} />
            return renderItem({ item })
          }}
          keyExtractor={(item, index) => item.id + index}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingTop: 12 }]}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </SafeAreaView>
  )
}

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
    height: 200,
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
  tag: {
    fontSize: 12,
    color: '#888'
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
  }
})
