import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : Platform.OS === 'web' ? 78 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : Platform.OS === 'web' ? 16 : 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.pink,
        tabBarInactiveTintColor: theme.textSoft,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: { marginBottom: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
