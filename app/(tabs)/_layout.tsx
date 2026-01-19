import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useThemeStyles } from '@/src/hooks/useThemeStyles';

export default function TabLayout() {
  const {colors} = useThemeStyles()
  return (
    <>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.textMuted, 
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 100,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="category" color={color} />,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Savings',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="savings" color={color} />,
        }}
      />

      <Tabs.Screen
        name="budgetings"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="budgetings" color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="settings/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="appearance/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/[id]/index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="profile/edit/index"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="feedback/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="login/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reset-password/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="signup/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="verify-email/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="reset-password-confirm/index"
        options={{
          href: null,
        }}
      /> 

      <Tabs.Screen
        name="[...notfound]"
        options={{
          href: null,
        }}
      />
      
    </Tabs>
    </>
  );
}
