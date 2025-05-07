import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'


import HomeScreen from '../screens/HomeScreen'
import MyRecipesScreen from '../screens/MyRecipesScreen'
import CookScreen from '../screens/CookScreen'
import CreateScreen from '../screens/CreateScreen'
import ProfileScreen from '../screens/ProfileScreen'


const Tab = createBottomTabNavigator()

const CookButton = ({ children, onPress }) => (
    <TouchableOpacity onPress={onPress} style={cookStyles.buttonContainer}>
      <View style={cookStyles.button}>
        {children}
      </View>
    </TouchableOpacity>
  )

  export default function AppNavigator() {
    return (
      <NavigationContainer>
        {/* Fix visual gap below tab bar */}
        <View style={styles.tabBarBase} />
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
            tabBarIcon: ({ focused }) => {
              let iconName: string = ''
              let iconSize = 26
              let iconColor = focused ? '#FF5C8A' : '#B0B0B0'
  
              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline'
                  break
                case 'MyRecipes':
                  iconName = focused ? 'book' : 'book-outline'
                  break
                case 'Cook':
                  iconName = focused ? 'flame' : 'flame-outline'
                  iconSize = 36
                  break
                case 'Create':
                  iconName = focused ? 'add-circle' : 'add-circle-outline'
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
                    marginTop: route.name === 'Cook' ? -8 : 0
                  }}
                />
              )
            }
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="MyRecipes" component={MyRecipesScreen} />
          <Tab.Screen
            name="Cook"
            component={CookScreen}
            options={{
              tabBarButton: (props) => <CookButton {...props} />,
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? 'flame' : 'flame-outline'}
                  size={28}
                  color="#fff"
                />
              )
            }}
          />
          <Tab.Screen name="Create" component={CreateScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    )
  }
  

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    paddingHorizontal: 16
  },
  centerIcon: {
    marginTop: -10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  tabBarBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFFFFF',
    zIndex: -1
  }    
})

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
