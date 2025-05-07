import AppNavigator from './src/navigation/AppNavigator'
import 'react-native-url-polyfill/auto'
import { SafeAreaProvider } from 'react-native-safe-area-context'



export default function App() {
  return(
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}
