import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  CalendarHeart,
  ChatCircle,
  FlowerLotus,
  PawPrint,
  GearSix,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'
import { Colors, Shadows } from '../../constants/Colors'

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
      <View style={styles.tabIconWrap}>
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
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          ...Shadows.elevation,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
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
              IconComponent={FlowerLotus}
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
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={GearSix}
              color={String(color)}
              focused={focused}
              label="설정"
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
