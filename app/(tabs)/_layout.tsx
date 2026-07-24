import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  FlowerLotus,
  GearSix,
  NotePencil,
  PawPrint,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { ChatTabIcon } from '../../components/ChatTabIcon'
import { Colors } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { petTourTabRouteName } from '../../lib/coachmarkTour'
import {
  getPetTourStepIndex,
  subscribePetTour,
} from '../../lib/coachmarkTourState'
import {
  isTabBarOverlayLocked,
  subscribeTabBarOverlay,
  useHideTabBarWhileKeyboard,
} from '../../lib/tabBarOverlay'

type TourTabName = 'chat' | 'diary' | 'index' | 'mind' | 'more'

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

function useTourTabHighlight(): ReturnType<typeof petTourTabRouteName> {
  const [step, setStep] = useState(getPetTourStepIndex)
  useEffect(() => {
    return subscribePetTour(() => setStep(getPetTourStepIndex()))
  }, [])
  return petTourTabRouteName(step)
}

function SoftTabButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
  routeName,
  highlightRoute,
}: SoftTabButtonProps & {
  routeName: TourTabName
  highlightRoute: ReturnType<typeof petTourTabRouteName>
}) {
  const spotlight = highlightRoute != null && highlightRoute === routeName
  const dimmed = highlightRoute != null && highlightRoute !== routeName

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={dimmed ? undefined : onPress}
      onLongPress={dimmed ? undefined : onLongPress}
      android_ripple={{ color: 'transparent' }}
      style={({ pressed }) => [
        style,
        spotlight && styles.tourTabSpotlight,
        dimmed && styles.tourTabDimmed,
        pressed && !dimmed && styles.tabPressed,
      ]}
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
  customIcon,
}: {
  IconComponent?: Icon
  color?: string
  focused: boolean
  label: string
  customIcon?: ReactNode
}) {
  return (
    <View style={styles.tabItem}>
      <View style={styles.tabIconWrap}>
        {customIcon ??
          (IconComponent ? (
            <IconComponent
              size={24}
              color={color}
              weight={focused ? 'fill' : 'light'}
            />
          ) : null)}
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelActive : styles.tabLabelIdle,
        ]}
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
  const tourHighlight = useTourTabHighlight()

  useHideTabBarWhileKeyboard()

  useEffect(() => {
    return subscribeTabBarOverlay(() => {
      setOverlayLocked(isTabBarOverlayLocked())
    })
  }, [])

  const chatTabButton = useCallback(
    (props: object) => (
      <SoftTabButton
        {...(props as SoftTabButtonProps)}
        routeName="chat"
        highlightRoute={tourHighlight}
      />
    ),
    [tourHighlight],
  )
  const diaryTabButton = useCallback(
    (props: object) => (
      <SoftTabButton
        {...(props as SoftTabButtonProps)}
        routeName="diary"
        highlightRoute={tourHighlight}
      />
    ),
    [tourHighlight],
  )
  const petTabButton = useCallback(
    (props: object) => (
      <SoftTabButton
        {...(props as SoftTabButtonProps)}
        routeName="index"
        highlightRoute={tourHighlight}
      />
    ),
    [tourHighlight],
  )
  const mindTabButton = useCallback(
    (props: object) => (
      <SoftTabButton
        {...(props as SoftTabButtonProps)}
        routeName="mind"
        highlightRoute={tourHighlight}
      />
    ),
    [tourHighlight],
  )
  const moreTabButton = useCallback(
    (props: object) => (
      <SoftTabButton
        {...(props as SoftTabButtonProps)}
        routeName="more"
        highlightRoute={tourHighlight}
      />
    ),
    [tourHighlight],
  )

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
            paddingTop: 5,
            paddingBottom: tabBottomPad,
            backgroundColor: Colors.cardRecessed,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.border,
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            // 투어 중에도 탭바를 남겨 하이라이트(시안)를 보여 준다
            zIndex: tourHighlight ? 50 : undefined,
          },
    [overlayLocked, tabHeight, tabBottomPad, tourHighlight],
  )

  return (
    <Tabs
      initialRouteName="index"
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        lazy: true,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDisabled,
        // Opaque scenes so inactive tabs (e.g. home welcome Modal) cannot
        // sit under / steal taps from the focused tab on web.
        sceneStyle: { backgroundColor: Colors.background, flex: 1 },
        tabBarStyle,
        tabBarItemStyle: {
          flex: 1,
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          width: '100%',
          height: 50,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: '대화',
          tabBarButton: chatTabButton,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              label="대화"
              customIcon={
                <ChatTabIcon
                  focused={focused}
                  size={31}
                  color={String(color)}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '마음일기',
          tabBarButton: diaryTabButton,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={NotePencil}
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
          tabBarButton: petTabButton,
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
          tabBarButton: mindTabButton,
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
          tabBarButton: moreTabButton,
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
    paddingTop: 0,
  },
  tabIconWrap: {
    height: 34,
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    width: '100%',
    marginTop: 2,
    fontSize: 13,
    lineHeight: 16,
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
  tourTabSpotlight: {
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardRecessed,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  tourTabDimmed: {
    opacity: 0.4,
  },
  tabPressed: {
    opacity: 0.88,
  },
})
