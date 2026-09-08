import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SdkProvider } from './SdkContext';
import type { RootStackParamList } from './navigation';
import { colors } from './theme';
import HomeScreen from './screens/HomeScreen';
import IdentifyScreen from './screens/IdentifyScreen';
import CaptureScreen from './screens/CaptureScreen';
import AttributeResultScreen from './screens/AttributeResultScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SdkProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.text,
              headerTitleStyle: { color: colors.text, fontWeight: '600' },
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Identify"
              component={IdentifyScreen}
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="Capture"
              component={CaptureScreen}
              options={{ headerShown: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="AttributeResult"
              component={AttributeResultScreen}
              options={{ title: 'Attribute Result' }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ title: 'Identify Result' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ title: 'About' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SdkProvider>
    </SafeAreaProvider>
  );
}
