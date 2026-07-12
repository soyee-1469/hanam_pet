import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  CalendarHeart,
  ChatCircle,
  Heart,
  List,
  PawPrint,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import { Colors } from '../../constants/Colors'

function SoftTabButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [style, { opacity: pressed ? 0.88 : 1 }]}
    >
      {children}
    </Pressable>
  )
}

function TabIcon({
  IconComponent,
  color,
  focused,
  label,
}: {
  IconComponent: Icon
  color: string
  focused: boolean
  label: string
}) {
  return (
    <View style={styles.tabItem}>
      <View
        style={[styles.tabIconWrap, focused && styles.tabIconWrapFocused]}
      >
        <IconComponent size={22} color={color} weight={focused ? 'fill' : 'light'} />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelIdle]}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets()
  const tabBottomPad = Math.max(bottom, 8) + 5
  const tabHeight = 72 + tabBottomPad

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDisabled,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: tabBottomPad,
          backgroundColor: 'rgba(255, 249, 243, 0.94)',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarButton: (props) => <SoftTabButton {...props} />,
        tabBarItemStyle: {
          flex: 1,
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          width: '100%',
          height: 52,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: '대화',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={ChatCircle}
              color={String(color)}
              focused={focused}
              label="대화"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '감정일기',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={CalendarHeart}
              color={String(color)}
              focused={focused}
              label="감정일기"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '나의 펫',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={PawPrint}
              color={String(color)}
              focused={focused}
              label="나의 펫"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: '마음챙김',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={Heart}
              color={String(color)}
              focused={focused}
              label="마음챙김"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '더보기',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={List}
              color={String(color)}
              focused={focused}
              label="더보기"
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabItem: {
    width: '100%',
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  tabIconWrap: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  tabIconWrapFocused: {
    backgroundColor: Colors.primaryLight,
  },
  tabLabel: {
    width: '100%',
    marginTop: 4,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  tabLabelIdle: {
    fontWeight: '500',
    color: Colors.textDisabled,
  },
})
