import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
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
import { Colors } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  isTabBarOverlayLocked,
  subscribeTabBarOverlay,
} from '../../lib/tabBarOverlay'

/** Soft tab button — navigation tab bar button props */
type SoftTabButtonProps = {
  children: ReactNode
  style?: object
  onPress?: (e: unknown) => void
  onLongPress?: (e: unknown) => void
  accessibilityState?: { selected?: boolean }
  accessibilityLabel?: string
  testID?: string
}

function SoftTabButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: SoftTabButtonProps) {
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
        <IconComponent
          size={20}
          color={color}
          weight={focused ? 'fill' : 'light'}
        />
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
  const tabBottomPad = Math.max(bottom, 8) + Layout.tabBarExtraBottom
  const tabHeight = tabBarReserveHeight(bottom)
  const [overlayLocked, setOverlayLocked] = useState(isTabBarOverlayLocked)

  useEffect(() => {
    return subscribeTabBarOverlay(() => {
      setOverlayLocked(isTabBarOverlayLocked())
    })
  }, [])

  const tabBarStyle = useMemo(
    () =>
      overlayLocked
        ? {
            display: 'none' as const,
            height: 0,
            overflow: 'hidden' as const,
          }
        : {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            bottom: 0,
            height: tabHeight,
            paddingTop: 4,
            paddingBottom: tabBottomPad,
            backgroundColor: Colors.cardRecessed,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: 'rgba(142, 111, 92, 0.12)',
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
          },
    [overlayLocked, tabHeight, tabBottomPad],
  )

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDisabled,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle,
        tabBarButton: (props) => (
          <SoftTabButton {...(props as SoftTabButtonProps)} />
        ),
        tabBarItemStyle: {
          flex: 1,
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          width: '100%',
          height: 42,
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
          title: '마음일기',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={CalendarHeart}
              color={String(color)}
              focused={focused}
              label="마음일기"
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
      <Tabs.Screen
        name="storage"
        options={{
          href: null,
          title: '보관함',
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          href: null,
          title: '출석',
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
    paddingTop: 0,
  },
  tabIconWrap: {
    height: 26,
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    width: '100%',
    marginTop: 1,
    fontSize: 11,
    lineHeight: 13,
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
