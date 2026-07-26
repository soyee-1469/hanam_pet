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
import { petTourTabHighlight, type PetTourTabHighlight } from '../../lib/coachmarkTour'
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

function useTourTabHighlight(): PetTourTabHighlight {
  const [step, setStep] = useState(getPetTourStepIndex)
  useEffect(() => {
    return subscribePetTour(() => setStep(getPetTourStepIndex()))
  }, [])
  return petTourTabHighlight(step)
}

function isTourTabSpotlight(
  routeName: TourTabName,
  highlight: PetTourTabHighlight,
): boolean {
  if (highlight == null) return false
  // 6단계 — 하단 네비 전체를 하나의 프레임으로 (설정 포함)
  if (highlight.mode === 'mainMenu') return true
  return highlight.route === routeName
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
  highlightRoute: PetTourTabHighlight
}) {
  const spotlight = isTourTabSpotlight(routeName, highlightRoute)
  const dimmed = highlightRoute != null && !spotlight

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
        // 개별 탭 박스 테두리는 구멍 테두리와 안 맞아 제거.
        // 비활성만 어둡게, 6단계 그룹 프레임이 테두리를 담당.
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

  const mainMenuTour = tourHighlight?.mode === 'mainMenu'
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
            // 투어 중: 일반은 어둡게 / 6단계는 크림 풀폭으로만 밝게
            backgroundColor: mainMenuTour
              ? Colors.cardRecessed
              : tourHighlight
                ? 'rgba(45, 28, 18, 0.94)'
                : Colors.cardRecessed,
            borderTopWidth: mainMenuTour
              ? 1
              : tourHighlight
                ? 0
                : StyleSheet.hairlineWidth,
            borderTopColor: mainMenuTour
              ? 'rgba(122, 91, 69, 0.35)'
              : Colors.border,
            borderTopLeftRadius: mainMenuTour ? 16 : 0,
            borderTopRightRadius: mainMenuTour ? 16 : 0,
            marginHorizontal: 0,
            overflow: 'hidden' as const,
            elevation: 0,
            shadowOpacity: 0,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            zIndex: tourHighlight ? 50 : undefined,
          },
    [overlayLocked, tabHeight, tabBottomPad, tourHighlight, mainMenuTour],
  )

  return (
    <>
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
    </>
  )
}

const styles = StyleSheet.create({
  tabItem: {
    width: '100%',
    minWidth: 64,
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
  tourTabDimmed: {
    opacity: 0.32,
  },
  tabPressed: {
    opacity: 0.88,
  },
})
