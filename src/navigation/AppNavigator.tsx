import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { supabase } from '../services/supabaseClient'

// Screens
import HomeScreen from '../screens/HomeScreen'
import MyRecipesScreen from '../screens/MyRecipesScreen'
import InspireScreen from '../screens/InspireScreen'
import CreateScreen from '../screens/CreateScreen'
import ProfileScreen from '../screens/ProfileScreen'
import RecipeDetailScreen from '../screens/RecipeDetailScreen'
import LoginScreen from '../screens/Auth/LoginScreen'
import SignupScreen from '../screens/Auth/SignupScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import CreateRecipeScreen from '../screens/CreateRecipeScreen'

const Tab = createBottomTabNavigator()
const AppStack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()

// Custom center tab button used for "Inspire" tab
const InspireButton = ({ children, onPress }) => (
  <TouchableOpacity onPress={onPress} style={cookStyles.buttonContainer}>
    <View style={cookStyles.button}>{children}</View>
  </TouchableOpacity>
)

// Main bottom tab navigation for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
          paddingTop: 10
        },
        // Dynamically define icons based on the route name
        tabBarIcon: ({ focused }) => {
          let iconName = ''
          let iconSize = 26
          let iconColor = focused ? '#FF5C8A' : '#B0B0B0'

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline'
              break
            case 'MyRecipes':
              iconName = focused ? 'book' : 'book-outline'
              break
            case 'Inspire':
              iconName = focused ? 'flame' : 'flame-outline'
              iconSize = 36
              break
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline'
              break
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline'
              break
          }

          return (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={{
                alignSelf: 'center',
                marginTop: route.name === 'Inspire' ? -8 : 0
              }}
            />
          )
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyRecipes" component={MyRecipesScreen} />
      <Tab.Screen
        name="Inspire"
        component={InspireScreen}
        options={{
          tabBarButton: (props) => <InspireButton {...props} />, // Use custom button for Inspire tab
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'flame' : 'flame-outline'}
              size={28}
              color="#fff"
            />
          )
        }}
      />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Main stack navigator for app: includes tabs and recipe detail
function AppStackScreen() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <AppStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ headerShown: false }} />
      <AppStack.Screen name="CreateRecipe" component={CreateRecipeScreen} options={{ headerShown: false }} />
    </AppStack.Navigator>
  )
}

// Auth flow navigator shown when user is not logged in
function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  )
}

// AppNavigator: determines whether to show the app or auth stack based on user auth state
export default function AppNavigator() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get initial user session
    const session = supabase.auth.session()
    setUser(session?.user ?? null)

    // Listen for authentication state changes (e.g., login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Clean up listener when component unmounts
    return () => {
      listener?.unsubscribe()
    }
  }, [])

  return (
    <NavigationContainer>
      {/* Conditional navigation tree: show auth flow if no user */}
      {user ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  )
}

// Styles for the Inspire center tab button
const cookStyles = StyleSheet.create({
  buttonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8
  }
})
