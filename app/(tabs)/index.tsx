import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Alert,
  StyleSheet,
  PanResponder,
  LayoutAnimation,
  Animated,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Camera,
  Gift,
  Lightning,
  Info,
  CaretUp,
  CaretDown,
  Check,
  PawPrint,
  Bell,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

const USER = {
  nickname: '몽이',
}

const PET = {
  name: '몽이',
  greetingBubble: '몽이지킴이님 오늘도 반가워요',
  level: 4,
  energy: 595,
  energyMax: 1000,
  foodCount: 0,
  toyCount: 3,
}

const HEADER_MENU = [
  {
    id: 'feed',
    label: '사료 받기',
    image: require('../../assets/images/bowl.png'),
    bgColor: Colors.surface,
    badge: 1,
  },
  {
    id: 'toy',
    label: '장난감 받기',
    image: require('../../assets/images/toy.png'),
    bgColor: Colors.surface,
  },
  {
    id: 'stamp',
    label: '출석 도장',
    image: require('../../assets/images/pet-menu-3.png'),
    bgColor: Colors.surface,
  },
  {
    id: 'draw',
    label: '매일 뽑기',
    image: require('../../assets/images/pet-menu-4.png'),
    bgColor: Colors.surface,
  },
  {
    id: 'mission',
    label: '찾기 미션',
    image: require('../../assets/images/pet-menu-5.png'),
    bgColor: Colors.surface,
  },
] as const

const TODAY_MISSIONS: {
  id: string
  label: string
  desc: string
  done: boolean
}[] = [
  { id: 'diary', label: '마음일기 쓰기', desc: '오늘의 감정을 짧게 남겨보세요', done: false },
  { id: 'video', label: '힐링 영상 보기', desc: '짧은 영상을 보면 케어 아이템을 받아요', done: true },
  { id: 'attendance', label: '출석하기', desc: '매일 출석하면 보상을 받아요', done: true },
]

const PET_CARE_MENU: {
  id: string
  label: string
  Icon: Icon
  color: string
}[] = [
  { id: 'album', label: '나의펫 앨범', Icon: Camera, color: Colors.textSecondary },
  { id: 'decorate', label: '꾸미기', Icon: Gift, color: Colors.textSecondary },
  { id: 'energy', label: '에너지 내역', Icon: Lightning, color: Colors.textSecondary },
  { id: 'guide', label: '서비스 안내', Icon: Info, color: Colors.textSecondary },
]

const CARE_ENERGY_GAIN = 8
const FIRST_OPEN_MISSION_ID =
  TODAY_MISSIONS.find((m) => !m.done)?.id ?? TODAY_MISSIONS[0]?.id ?? 'diary'

type CareStockCardProps = {
  count: number
  icon: number
  useLabel: string
  acquireLabel: string
  onUse: () => void
  onAcquire: () => void
  /** 0개일 때 아이콘 회색 처리 (장난감 등) */
  grayIconWhenEmpty?: boolean
}

/** Soft recessed CTA card v2 — Fill #FFFBF6 / Stroke 0.5 #F0E2D2 / Inner shadow */
function CareStockCard({
  count,
  icon,
  useLabel,
  acquireLabel,
  onUse,
  onAcquire,
  grayIconWhenEmpty = false,
}: CareStockCardProps) {
  const enabled = count > 0
  const scale = useRef(new Animated.Value(1)).current
  const [hovered, setHovered] = useState(false)

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start()
  }

  return (
    <Animated.View style={[styles.stockCardWrap, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={enabled ? useLabel : acquireLabel}
        // Nudge: disabled 금지 — 카드 전체가 CTA
        onPress={enabled ? onUse : onAcquire}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.stockCard,
          hovered && styles.stockCardHovered,
          { cursor: 'pointer' } as object,
        ]}
      >
        <Text style={styles.stockActionLabel} numberOfLines={1}>
          {enabled ? useLabel : acquireLabel}
        </Text>
        <View style={styles.stockIconCountRow}>
          <Image
            source={icon}
            style={[
              styles.stockIcon,
              grayIconWhenEmpty && !enabled && styles.stockIconMuted,
            ]}
            resizeMode="contain"
          />
          <Text style={styles.stockCount} numberOfLines={1}>
            {count}개
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

type MenuQuickItemProps = {
  label: string
  image: number
  bgColor: string
  badge?: number
  circleSize: number
  iconSize: number
  labelSize: number
  onPress: () => void
}

/** 미션 퀵 바 — Bounding Box 전체 터치 + 수령 가능 Hover lift */
function MenuQuickItem({
  label,
  image,
  bgColor,
  badge,
  circleSize,
  iconSize,
  labelSize,
  onPress,
}: MenuQuickItemProps) {
  const claimable = Boolean(badge)
  const [hovered, setHovered] = useState(false)
  const lift = claimable && hovered

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.menuItem,
        { cursor: 'pointer' } as object,
        lift && styles.menuItemLift,
      ]}
    >
      <View style={styles.menuIconWrap}>
        <View
          style={[
            styles.menuCircle,
            {
              width: circleSize,
              height: circleSize,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Image
            source={image}
            style={{ width: iconSize, height: iconSize }}
            resizeMode="contain"
          />
        </View>
        {badge ? (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.menuLabel, { fontSize: labelSize }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

function LevelEnergyBlock({
  energy,
  energyMax,
}: {
  energy: number
  energyMax: number
}) {
  const energyRatio = Math.min(100, Math.round((energy / energyMax) * 100))

  return (
    <View style={styles.energyBlock}>
      <View style={styles.levelRow}>
        <View style={styles.levelLeft}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>레벨 {PET.level}</Text>
          </View>
          <Lightning size={16} color={Colors.secondary} weight="fill" />
          <Text style={styles.energyLabelInline}>에너지</Text>
        </View>
        <View style={styles.energyNums}>
          <Text style={styles.energyCurrent}>{energy.toLocaleString()}</Text>
          <Text style={styles.energyMax}> / {energyMax.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.energyTrack}>
        <View style={[styles.energyFill, { width: `${energyRatio}%` }]} />
      </View>
    </View>
  )
}

export default function PetHomeScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [expanded, setExpanded] = useState(false)
  const [energy, setEnergy] = useState(PET.energy)
  const [foodCount, setFoodCount] = useState(PET.foodCount)
  const [toyCount, setToyCount] = useState(PET.toyCount)
  const [focusMissionId, setFocusMissionId] = useState<string | null>(null)
  const [speech, setSpeech] = useState<string | null>(null)
  const [fxLabel, setFxLabel] = useState<string | null>(null)
  const [fxAccent, setFxAccent] = useState(false)
  const [sheetH, setSheetH] = useState(320)
  const expandedRef = useRef(expanded)
  expandedRef.current = expanded
  const careBusyRef = useRef(false)

  // 폰에서 헤더·캐릭터가 시트에 가리지 않도록 영역 고정
  const tabBarReserve = 72 + Math.max(insets.bottom, 8) + 5
  const sheetMaxHeight = Math.round(screenHeight * 0.7)
  const headerTopPad = insets.top + 8
  const headerBlockH = 102 // 닉네임 + 메뉴 대략 높이
  const petTop = headerTopPad + headerBlockH
  // 실측 시트 높이 기준으로 캐릭터 영역 확보 (가림 방지)
  const petSheetGap = 28
  const petBottom = tabBarReserve + sheetH + petSheetGap
  const petAvailH = Math.max(screenHeight - petTop - petBottom, 160)
  const petSize = Math.round(Math.min(200, Math.max(128, petAvailH * 0.68)))
  const menuCircleSize = Math.min(46, Math.floor((screenWidth - 32) / 5) - 8)
  const menuIconSize = Math.min(32, menuCircleSize - 12)
  const menuLabelSize = screenWidth < 360 ? 9 : 10
  const sheetMaxHeightSafe = Math.min(sheetMaxHeight, screenHeight - headerTopPad - 80)
  const actionGap = 10

  const arrowAnim = useRef(new Animated.Value(0)).current
  const speechOpacity = useRef(new Animated.Value(0)).current
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const petScale = useRef(new Animated.Value(1)).current
  const petNudgeY = useRef(new Animated.Value(0)).current
  const fxOpacity = useRef(new Animated.Value(0)).current
  const fxTranslateY = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<ScrollView>(null)
  const missionSectionY = useRef(0)

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [arrowAnim])

  useEffect(() => {
    return () => {
      if (speechTimer.current) clearTimeout(speechTimer.current)
      if (focusTimer.current) clearTimeout(focusTimer.current)
    }
  }, [])

  const arrowTranslateY = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: expanded ? [0, 3] : [0, -4],
  })

  const arrowOpacity = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  })

  const setSheetExpanded = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(next)
    if (!next) setFocusMissionId(null)
  }

  const showSpeech = (message: string) => {
    if (speechTimer.current) clearTimeout(speechTimer.current)
    setSpeech(message)
    speechOpacity.setValue(0)
    Animated.timing(speechOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start()
    speechTimer.current = setTimeout(() => {
      Animated.timing(speechOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setSpeech(null)
          speechOpacity.setValue(1)
        }
      })
    }, 2400)
  }

  const playFx = (label: string, accent: boolean) =>
    new Promise<void>((resolve) => {
      setFxLabel(label)
      setFxAccent(accent)
      fxOpacity.setValue(0)
      fxTranslateY.setValue(8)
      Animated.parallel([
        Animated.timing(fxOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(fxTranslateY, {
          toValue: -18,
          duration: 520,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(fxOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => {
          setFxLabel(null)
          resolve()
        })
      })
    })

  const playPetReact = (kind: 'eat' | 'play') =>
    new Promise<void>((resolve) => {
      const bounce =
        kind === 'eat'
          ? Animated.sequence([
              Animated.timing(petScale, {
                toValue: 1.06,
                duration: 160,
                useNativeDriver: true,
              }),
              Animated.timing(petNudgeY, {
                toValue: 6,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(petNudgeY, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(petScale, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
              }),
            ])
          : Animated.sequence([
              Animated.timing(petNudgeY, {
                toValue: -10,
                duration: 140,
                useNativeDriver: true,
              }),
              Animated.timing(petNudgeY, {
                toValue: 0,
                duration: 140,
                useNativeDriver: true,
              }),
              Animated.timing(petScale, {
                toValue: 1.05,
                duration: 140,
                useNativeDriver: true,
              }),
              Animated.timing(petScale, {
                toValue: 1,
                duration: 160,
                useNativeDriver: true,
              }),
            ])
      bounce.start(() => resolve())
    })

  const runCareAction = async (kind: 'feed' | 'play') => {
    if (careBusyRef.current) return

    if (kind === 'feed' && foodCount <= 0) return
    if (kind === 'play' && toyCount <= 0) return

    careBusyRef.current = true
    try {
      if (kind === 'feed') {
        setFoodCount((c) => Math.max(0, c - 1))
        await playFx('-1', false)
        showSpeech('맛있어요!')
        await playPetReact('eat')
      } else {
        setToyCount((c) => Math.max(0, c - 1))
        await playFx('-1', false)
        showSpeech('신나요!')
        await playPetReact('play')
      }

      setEnergy((e) => Math.min(PET.energyMax, e + CARE_ENERGY_GAIN))
      await playFx(`+${CARE_ENERGY_GAIN}`, true)
    } finally {
      careBusyRef.current = false
    }
  }

  const triggerMissionNudge = (missionId: string = FIRST_OPEN_MISSION_ID) => {
    setFocusMissionId(missionId)
    setSheetExpanded(true)
    if (focusTimer.current) clearTimeout(focusTimer.current)
    focusTimer.current = setTimeout(() => setFocusMissionId(null), 3200)
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(missionSectionY.current - 8, 0),
        animated: true,
      })
    }, 280)
  }

  const handleAcquireFeed = () => {
    showSpeech('오늘 할 일에서 사료를 받아와 줄래요?')
    triggerMissionNudge(FIRST_OPEN_MISSION_ID)
  }

  const handleAcquireToy = () => {
    showSpeech('오늘 할 일에서 장난감을 받아와 줄래요?')
    triggerMissionNudge(FIRST_OPEN_MISSION_ID)
  }

  const handleFeedPress = () => {
    void runCareAction('feed')
  }

  const handlePlayPress = () => {
    void runCareAction('play')
  }

  const bubbleText = speech ?? PET.greetingBubble
  const bubbleAnimated = speech != null

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderRelease: (_, g) => {
          if (g.dy < -36) setSheetExpanded(true)
          else if (g.dy > 36) setSheetExpanded(false)
          else setSheetExpanded(!expandedRef.current)
        },
      }),
    [],
  )

  return (
    <ImageBackground
      source={require('../../assets/images/pet_bg.png')}
      style={styles.screen}
      resizeMode="cover"
      imageStyle={styles.petBgImage}
    >
      {/* 헤더 (닉네임 + 메뉴) — 항상 상단 고정 */}
      <View style={[styles.headerLayer, { paddingTop: headerTopPad }]}>
        <View style={styles.nicknameRow}>
          <Text style={styles.nicknameText} numberOfLines={1}>
            {USER.nickname}
          </Text>
          <Pressable
            style={styles.bellBtn}
            onPress={() => Alert.alert('알림', '더미: 알림 화면입니다.')}
            hitSlop={8}
          >
            <View>
              <Bell size={24} color={Colors.textPrimary} weight="light" />
              <View style={styles.notifDot} />
            </View>
          </Pressable>
        </View>

        <View style={styles.menuRow}>
          {HEADER_MENU.map((item) => (
            <MenuQuickItem
              key={item.id}
              label={item.label}
              image={item.image}
              bgColor={item.bgColor}
              badge={'badge' in item ? item.badge : undefined}
              circleSize={menuCircleSize}
              iconSize={menuIconSize}
              labelSize={menuLabelSize}
              onPress={() => Alert.alert(item.label, '더미 화면입니다.')}
            />
          ))}
        </View>
      </View>

      {/* 말풍선 + 캐릭터 — 영역 정중앙 */}
      <View
        style={[styles.petLayer, { top: petTop, bottom: petBottom }]}
        pointerEvents="box-none"
      >
        <View style={styles.petCluster}>
          <Animated.View
            style={[
              styles.greetingBubble,
              bubbleAnimated ? { opacity: speechOpacity } : null,
            ]}
          >
            <Text style={styles.greetingBubbleText}>{bubbleText}</Text>
            <View style={styles.greetingBubbleTail} />
          </Animated.View>
          <View style={styles.petStage}>
            {fxLabel ? (
              <Animated.Text
                style={[
                  styles.careFxText,
                  fxAccent && styles.careFxTextAccent,
                  {
                    opacity: fxOpacity,
                    transform: [{ translateY: fxTranslateY }],
                  },
                ]}
              >
                {fxLabel}
              </Animated.Text>
            ) : null}
            <Animated.Image
              source={require('../../assets/images/dog-model.png')}
              style={{
                width: petSize,
                height: petSize,
                transform: [{ scale: petScale }, { translateY: petNudgeY }],
              }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* 하단 시트 */}
      <View
        style={[styles.sheet, { bottom: tabBarReserve }]}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height)
          if (h > 0 && Math.abs(h - sheetH) > 2) setSheetH(h)
        }}
      >
        <View style={styles.sheetHandle} {...panResponder.panHandlers}>
          <Animated.View
            style={{
              opacity: arrowOpacity,
              transform: [{ translateY: arrowTranslateY }],
            }}
          >
            {expanded ? (
              <CaretDown size={20} color={Colors.textSecondary} weight="bold" />
            ) : (
              <CaretUp size={20} color={Colors.textSecondary} weight="bold" />
            )}
          </Animated.View>
        </View>

        {/* 레벨 + 보유 카드 — 항상 표시 */}
        <View style={styles.primaryBlock}>
          <LevelEnergyBlock energy={energy} energyMax={PET.energyMax} />
          <View style={styles.actionRow}>
            <CareStockCard
              count={foodCount}
              icon={
                foodCount <= 0
                  ? require('../../assets/images/null-bowl.png')
                  : require('../../assets/images/bowl.png')
              }
              useLabel="사료 주기"
              acquireLabel="사료 획득하기"
              onUse={handleFeedPress}
              onAcquire={handleAcquireFeed}
            />
            <View style={{ width: actionGap }} />
            <CareStockCard
              count={toyCount}
              icon={require('../../assets/images/toy.png')}
              useLabel="놀아 주기"
              acquireLabel="장난감 획득하기"
              grayIconWhenEmpty
              onUse={handlePlayPress}
              onAcquire={handleAcquireToy}
            />
          </View>
        </View>

        {/* 펼쳤을 때만 미션/펫키우기 */}
        {expanded ? (
          <ScrollView
            ref={scrollRef}
            style={{ maxHeight: Math.max(sheetMaxHeightSafe - 220, 160) }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }}
          >
            <View
              style={styles.sectionCard}
              onLayout={(e) => {
                missionSectionY.current = e.nativeEvent.layout.y
              }}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>오늘 할 일</Text>
              </View>
              <View>
                {TODAY_MISSIONS.map((item) => {
                  const focused = focusMissionId === item.id
                  return (
                    <View
                      key={item.id}
                      style={[styles.missionRow, focused && styles.missionRowFocused]}
                    >
                      <View
                        style={[
                          styles.missionCheck,
                          item.done ? styles.missionCheckDone : styles.missionCheckTodo,
                        ]}
                      >
                        {item.done ? <Check size={12} color={Colors.textDisabled} weight="bold" /> : null}
                      </View>

                      <View style={styles.missionCopy}>
                        <Text
                          style={[
                            styles.missionLabel,
                            item.done && styles.missionLabelDone,
                            focused && styles.missionLabelFocused,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[styles.missionDesc, item.done && styles.missionDescDone]}
                        >
                          {item.desc}
                        </Text>
                      </View>

                      <View style={styles.missionRight}>
                        {item.done ? (
                          <View style={styles.missionDoneBox}>
                            <PawPrint size={12} color={Colors.textSecondary} weight="fill" />
                            <Text style={styles.missionDoneText}>완료</Text>
                          </View>
                        ) : (
                          <Pressable
                            style={styles.missionCta}
                            onPress={() => {
                              setFocusMissionId(null)
                              Alert.alert(item.label, `${item.label} 화면으로 이동합니다. (더미)`)
                            }}
                          >
                            <Text style={styles.missionCtaText}>확인하기</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

            <View style={[styles.sectionCardAlt, { marginTop: 12 }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionAccent, styles.sectionAccentAlt]} />
                <Text style={[styles.sectionTitle, styles.careSectionTitle]}>펫 키우기</Text>
              </View>
              <View style={styles.careGrid}>
                {PET_CARE_MENU.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.careItem}
                    onPress={() => Alert.alert(item.label, '더미 화면입니다.')}
                  >
                    <item.Icon size={18} color={Colors.textDisabled} weight="light" />
                    <Text style={styles.careLabel}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  petBgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingHorizontal: 16,
  },
  nicknameRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nicknameText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
  },
  menuItemLift: {
    transform: [{ translateY: -2 }],
  },
  menuIconWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  menuCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  menuBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    minHeight: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.background,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  menuBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
    textAlign: 'center',
    includeFontPadding: false,
  },
  menuLabel: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  petLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    overflow: 'visible',
  },
  petCluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  careFxText: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 5,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  careFxTextAccent: {
    color: Colors.primary,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 10,
    overflow: 'visible',
    borderTopWidth: 1,
    borderColor: Colors.border,
    alignItems: 'stretch',
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  menuIcon: {
    width: 36,
    height: 36,
  },
  notifDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  greetingBubble: {
    zIndex: 2,
    alignSelf: 'center',
    maxWidth: 260,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetingBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  greetingBubbleTail: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
  },
  levelRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
    marginRight: 8,
  },
  levelBadgeText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  energyLabelInline: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  energyNums: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  energyCurrent: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  energyMax: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textDisabled,
  },
  energyBlock: {
    width: '100%',
    marginBottom: 12,
  },
  energyTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.energyFill,
  },
  primaryBlock: {
    alignSelf: 'stretch',
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stockCardWrap: {
    flex: 1,
  },
  stockCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFBF6',
    borderWidth: 0.5,
    borderColor: '#F0E2D2',
    // Figma: Inner Shadow X:-3 Y:-3 Blur:4 Color:#F1E7DC
    boxShadow: 'inset -3px -3px 4px 0px #F1E7DC',
  },
  stockCardHovered: {
    backgroundColor: '#FFF7EF',
  },
  stockActionLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stockIconCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  stockIcon: {
    width: 36,
    height: 36,
    marginRight: 6,
  },
  stockIconMuted: {
    tintColor: '#B8B0A8',
    opacity: 0.55,
  },
  stockCount: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  careGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionCard: {
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  sectionCardAlt: {
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginRight: 8,
  },
  sectionAccentAlt: {
    backgroundColor: Colors.textDisabled,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  careSectionTitle: {
    color: Colors.textSecondary,
  },
  careItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.divider,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  careLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  missionCard: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 4,
  },
  missionTitle: {
    marginBottom: 16,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  missionRow: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  missionRowFocused: {
    borderRadius: 10,
    backgroundColor: Colors.divider,
  },
  missionCheck: {
    width: 18,
    height: 18,
    marginRight: 12,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCheckDone: {
    borderColor: Colors.border,
    backgroundColor: Colors.buttonDisabledBg,
  },
  missionCheckTodo: {
    borderColor: Colors.textDisabled,
    backgroundColor: 'transparent',
  },
  missionCopy: {
    flex: 1,
    marginRight: 10,
  },
  missionLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  missionDesc: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  missionDescDone: {
    color: Colors.textDisabled,
  },
  missionLabelDone: {
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  missionLabelFocused: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  missionRight: {
    width: 78,
    marginRight: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  missionDoneBox: {
    width: 78,
    minHeight: 34,
    marginRight: 0,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionDoneText: {
    marginLeft: 4,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  missionCta: {
    width: 78,
    minHeight: 34,
    marginRight: 0,
    borderRadius: 999,
    backgroundColor: Colors.textPrimary,
    borderWidth: 0,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCtaText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: Colors.surface,
  },
})
