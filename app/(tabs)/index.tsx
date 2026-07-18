import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Alert,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Lightning,
  CaretRight,
  Bell,
  X,
  PencilSimple,
  Heart,
  CaretDown,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { tabBarReserveHeight } from '../../constants/Layout'
import { useDesignWindow } from '../../components/AppViewport'
import {
  consumeWelcomePending,
  getOnboardingProfile,
  type PetChoice,
} from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { refillChatEnergy } from '../../lib/chatEnergy'
import {
  consumeEnergyCareNudge,
  pickRandom,
} from '../../lib/careNudge'
import {
  getPetName,
  setPetName,
  PET_NAME_MAX,
  defaultPetName,
} from '../../lib/petProfile'
import { showToast } from '../../lib/toast'

const USER = {
  nickname: '몽이',
}

const PET = {
  name: '몽이',
  greetingBubble: '오늘도 같이 있어줘서 고마워',
  energy: 595,
  energyMax: 1000,
  foodCount: 1,
  toyCount: 3,
}

const HEADER_MENU = [
  {
    id: 'feed',
    label: '사료 받기',
    image: require('../../assets/images/bowl.png'),
    bgColor: Colors.surface,
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
    id: 'storage',
    label: '내 보관함',
    image: require('../../assets/images/pet-menu-4.png'),
    bgColor: Colors.surface,
  },
  {
    id: 'guide',
    label: '도움말',
    image: require('../../assets/images/pet-menu-5.png'),
    bgColor: Colors.surface,
  },
] as const

const CARE_ENERGY_GAIN = 8
const STOCK_MAX = 5

const FEED_THANKS = [
  '맛있어요!',
  '잘 먹을게요!',
  '우와, 고마워요!',
  '맘마 최고예요!',
] as const

const PLAY_THANKS = [
  '신나요!',
  '더 놀자!',
  '좋아!',
  '같이 놀아줘서 고마워!',
] as const

const CLAIM_FEED_LINES = [
  '우와! 좋아하는 맘마예요. 정말 기뻐할 거예요!',
  '잘 챙겼어요. 꼬리 흔들며 기다리고 있을게요!',
  '고마워요! 이제 맘마 줄 준비가 됐어요.',
] as const

const CLAIM_TOY_LINES = [
  '몽이와 놀아줄 시간이네요! 기운이 쑥쑥 차오르겠어요.',
  '장난감이다! 같이 놀면 더 신날 거예요.',
  '고마워요! 놀아 주기만 하면 돼요.',
] as const

const HELP_ITEMS = [
  {
    title: '받기 제한',
    body: '사료와 장난감은 하루에 최대 2번 받을 수 있어요. 제작된 건 23시 59분까지 받지 않으면 사라져요.',
  },
  {
    title: '보관 한도',
    body: '사료와 장난감은 최대 5개까지만 보관할 수 있어요.',
  },
  {
    title: '돌보기',
    body: '사료 주기·놀아 주기로 에너지를 채우고 몽이와 더 가까워질 수 있어요.',
  },
] as const

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

/** 케어 CTA — creamyBeige 면 + selected 테두리 (오렌지 절제) */
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

/** 충분(≥900)만 primary — 그 외는 accent로 완충 안내 */
function energyBarColor(energy: number) {
  return energy >= 900 ? Colors.energyFill : Colors.energyFillMid
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
  onPressStorage,
}: {
  energy: number
  energyMax: number
  onPressStorage: () => void
}) {
  const energyRatio = Math.min(100, Math.round((energy / energyMax) * 100))
  const fillColor = energyBarColor(energy)

  return (
    <View style={styles.energyBlock}>
      <View style={styles.levelRow}>
        <View style={styles.levelLeft}>
          <Lightning size={16} color={fillColor} weight="fill" />
          <Text style={styles.energyLabelInline}>에너지</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="내 보관함"
          hitSlop={8}
          onPress={onPressStorage}
          style={({ pressed }) => [
            styles.energyNumsBtn,
            pressed && styles.energyNumsPressed,
          ]}
        >
          <View style={styles.energyNums}>
            <Text style={styles.energyCurrent}>{energy.toLocaleString()}</Text>
            <Text style={styles.energyMax}> / {energyMax.toLocaleString()}</Text>
          </View>
          <View style={styles.energyCaret}>
            <CaretRight size={16} color={Colors.textSecondary} weight="bold" />
          </View>
        </Pressable>
      </View>
      <View style={styles.energyTrack}>
        <View
          style={[
            styles.energyFill,
            { width: `${energyRatio}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  )
}

export default function PetHomeScreen() {
  const { width: screenWidth, height: screenHeight } = useDesignWindow()
  const insets = useSafeAreaInsets()
  const [energy, setEnergy] = useState(PET.energy)
  const [foodCount, setFoodCount] = useState(PET.foodCount)
  const [toyCount, setToyCount] = useState(PET.toyCount)
  const [speech, setSpeech] = useState(PET.greetingBubble)
  const [fxLabel, setFxLabel] = useState<string | null>(null)
  const [fxAccent, setFxAccent] = useState(false)
  const [sheetH, setSheetH] = useState(280)
  const [headerH, setHeaderH] = useState(140)
  const [helpOpen, setHelpOpen] = useState(false)
  const [petId, setPetId] = useState<PetChoice>('mongi')
  const [petName, setPetNameState] = useState(PET.name)
  const [nameEditOpen, setNameEditOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(PET.name)
  const [nameSaving, setNameSaving] = useState(false)
  const [heartsOn, setHeartsOn] = useState(false)
  const [helpExpanded, setHelpExpanded] = useState<string | null>(null)
  /** 오늘 남은 사료 받기 횟수 — 0이면 뱃지 숨김 */
  const [feedClaimsLeft, setFeedClaimsLeft] = useState(1)
  const careBusyRef = useRef(false)

  // 폰에서 헤더·캐릭터가 하단 패널에 가리지 않도록 영역 고정
  const tabBarReserve = tabBarReserveHeight(insets.bottom)
  const sheetMaxHeight = Math.round(screenHeight * 0.55)
  const headerTopPad = insets.top + 8
  const petTop = headerH
  const petSheetGap = 12
  const petBottom = tabBarReserve + Math.min(sheetH, sheetMaxHeight) + petSheetGap
  const petAvailH = Math.max(screenHeight - petTop - petBottom, 180)
  const nameReserve = 40
  const petSize = Math.round(
    Math.min(190, Math.max(110, (petAvailH - nameReserve) * 0.78)),
  )
  const menuCircleSize = Math.min(46, Math.floor((screenWidth - 32) / 5) - 8)
  const menuIconSize = Math.min(32, menuCircleSize - 12)
  const menuLabelSize = screenWidth < 360 ? 9 : 10
  const actionGap = 14

  const speechOpacity = useRef(new Animated.Value(1)).current
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const petScale = useRef(new Animated.Value(1)).current
  const petNudgeY = useRef(new Animated.Value(0)).current
  const fxOpacity = useRef(new Animated.Value(0)).current
  const fxTranslateY = useRef(new Animated.Value(0)).current
  const heartOpacity = useRef(new Animated.Value(0)).current
  const heartLift = useRef(new Animated.Value(0)).current

  useEffect(() => {
    return () => {
      if (speechTimer.current) clearTimeout(speechTimer.current)
    }
  }, [])

  const openStorage = () => {
    router.push('/storage')
  }

  const playHearts = () => {
    setHeartsOn(true)
    heartOpacity.setValue(0)
    heartLift.setValue(0)
    Animated.parallel([
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(heartLift, {
        toValue: -28,
        duration: 580,
        useNativeDriver: true,
      }),
    ]).start(() => setHeartsOn(false))
  }

  const showSpeech = (message: string, holdMs = 2400) => {
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
          setSpeech(PET.greetingBubble)
          speechOpacity.setValue(1)
        }
      })
    }, holdMs)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const profile = await getOnboardingProfile()
      const id: PetChoice = profile?.petId ?? 'mongi'
      const name = await getPetName(id)
      if (cancelled) return
      setPetId(id)
      setPetNameState(name)
      setNameDraft(name)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const fromEnergy = await consumeEnergyCareNudge()
      if (cancelled) return
      if (fromEnergy) {
        showSpeech(
          `${petName}가 힘을 얻으려면 돌봐줄 시간이 필요해요. 사료 주기나 놀아 주기로 기운을 불어넣어 줄래요?`,
          4200,
        )
        return
      }
      const pending = await consumeWelcomePending()
      if (cancelled || !pending) return
      if (pending === 'resume') {
        showSpeech(getOnboardingCopy().resume.restored.homeBubble, 3600)
        return
      }
      showSpeech('반가워! 위에서 사료 받기부터 해볼래?', 3200)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 진입·에너지 복귀 환영만
  }, [])

  const openNameEdit = () => {
    setNameDraft(petName)
    setNameEditOpen(true)
  }

  const saveNameEdit = async () => {
    const trimmed = nameDraft.trim()
    if (trimmed.length < 1 || trimmed.length > PET_NAME_MAX || nameSaving) return
    setNameSaving(true)
    try {
      const next = await setPetName(trimmed)
      setPetNameState(next)
      setNameEditOpen(false)
      showToast('펫 이름을 저장했어요')
      showSpeech(`${next}! 이름이 마음에 들어`, 2400)
    } catch {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setNameSaving(false)
    }
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
        showSpeech(pickRandom(FEED_THANKS))
        playHearts()
        await playPetReact('eat')
      } else {
        setToyCount((c) => Math.max(0, c - 1))
        showSpeech(pickRandom(PLAY_THANKS))
        playHearts()
        await playPetReact('play')
      }

      setEnergy((e) => Math.min(PET.energyMax, e + CARE_ENERGY_GAIN))
      await playFx(`+${CARE_ENERGY_GAIN}`, true)
      await refillChatEnergy()
      showSpeech(
        `${petName}가 힘을 얻었어요! 이제 마음 편히 이야기해요.`,
        2800,
      )
    } finally {
      careBusyRef.current = false
    }
  }

  const claimFeed = () => {
    if (careBusyRef.current) return
    if (foodCount >= STOCK_MAX) {
      showSpeech('보관함이 가득해요. 먼저 맘마를 줄래요?')
      return
    }
    if (feedClaimsLeft <= 0) {
      showSpeech('오늘은 이미 받았어요. 내일 다시 와요!')
      return
    }
    setFoodCount((c) => Math.min(STOCK_MAX, c + 1))
    setFeedClaimsLeft((n) => Math.max(0, n - 1))
    playHearts()
    showSpeech(pickRandom(CLAIM_FEED_LINES), 3000)
    void playPetReact('eat')
  }

  const claimToy = () => {
    if (careBusyRef.current) return
    if (toyCount >= STOCK_MAX) {
      showSpeech('장난감이 충분해요. 먼저 놀아 줄래요?')
      return
    }
    setToyCount((c) => Math.min(STOCK_MAX, c + 1))
    playHearts()
    showSpeech(pickRandom(CLAIM_TOY_LINES), 3000)
    void playPetReact('play')
  }

  const handleAcquireFeed = () => {
    showSpeech('위에서 「사료 받기」를 눌러 받아와 줄래요?')
  }

  const handleAcquireToy = () => {
    showSpeech('위에서 「장난감 받기」를 눌러 받아와 줄래요?')
  }

  const handleFeedPress = () => {
    void runCareAction('feed')
  }

  const handlePlayPress = () => {
    void runCareAction('play')
  }

  const bubbleText = speech || PET.greetingBubble

  return (
    <ImageBackground
      source={require('../../assets/images/pet_bg.png')}
      style={styles.screen}
      resizeMode="cover"
      imageStyle={styles.petBgImage}
    >
      {/* 헤더 (닉네임 + 메뉴) — 항상 상단 고정 */}
      <View
        style={[styles.headerLayer, { paddingTop: headerTopPad }]}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height)
          if (h > 0 && Math.abs(h - headerH) > 2) setHeaderH(h)
        }}
      >
        <View style={styles.nicknameRow}>
          <Text style={styles.nicknameText} numberOfLines={1}>
            {USER.nickname}
          </Text>
          <Pressable
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
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
              badge={
                item.id === 'feed' && feedClaimsLeft > 0
                  ? feedClaimsLeft
                  : undefined
              }
              circleSize={menuCircleSize}
              iconSize={menuIconSize}
              labelSize={menuLabelSize}
              onPress={() => {
                if (item.id === 'storage') openStorage()
                else if (item.id === 'guide') setHelpOpen(true)
                else if (item.id === 'stamp') router.push('/attendance')
                else if (item.id === 'feed') claimFeed()
                else if (item.id === 'toy') claimToy()
              }}
            />
          ))}
        </View>
      </View>

      {/* 말풍선 + 캐릭터 — 감성 레이어만 */}
      <View
        style={[styles.petLayer, { top: petTop, bottom: petBottom }]}
        pointerEvents="box-none"
      >
        <View style={styles.petCluster}>
          <View style={[styles.petStage, { width: petSize, height: petSize }]}>
            <Animated.View
              style={[styles.greetingBubble, { opacity: speechOpacity }]}
              accessibilityRole="text"
              accessibilityLabel={bubbleText}
              pointerEvents="none"
            >
              <Text style={styles.greetingBubbleText}>{bubbleText}</Text>
              <View style={styles.greetingBubbleTail} />
            </Animated.View>
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
            {heartsOn ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heartFx,
                  {
                    opacity: heartOpacity,
                    transform: [{ translateY: heartLift }],
                  },
                ]}
              >
                <Heart size={22} color={Colors.primary} weight="fill" />
                <View style={styles.heartFxSide}>
                  <Heart size={16} color={Colors.secondary} weight="fill" />
                </View>
              </Animated.View>
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
          <View style={styles.petNameRow}>
            <Text style={styles.petName} numberOfLines={1}>
              {petName}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="펫 이름 수정"
              hitSlop={8}
              onPress={openNameEdit}
              style={({ pressed }) => [
                styles.petNameEditBtn,
                pressed && styles.headerIconPressed,
              ]}
            >
              <PencilSimple
                size={16}
                color={Colors.textSecondary}
                weight="bold"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* 하단 패널 — 고정 UI (모달/드래그 아님) */}
      <View
        style={[styles.sheet, { bottom: tabBarReserve, maxHeight: sheetMaxHeight }]}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height)
          if (h > 0 && Math.abs(h - sheetH) > 2) setSheetH(h)
        }}
      >
        <View style={styles.primaryBlock}>
          <LevelEnergyBlock
            energy={energy}
            energyMax={PET.energyMax}
            onPressStorage={openStorage}
          />
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
      </View>

      <Modal
        visible={helpOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpOpen(false)}
      >
        <Pressable
          style={styles.helpBackdrop}
          onPress={() => setHelpOpen(false)}
        >
          <Pressable
            style={[styles.helpSheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.helpHandle} />
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>도움말</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="닫기"
                hitSlop={8}
                onPress={() => setHelpOpen(false)}
                style={styles.helpCloseBtn}
              >
                <X size={20} color={Colors.textSecondary} weight="bold" />
              </Pressable>
            </View>
            <Text style={styles.helpLead}>
              필요할 때만 보면 돼요. 천천히 확인해 주세요.
            </Text>
            {HELP_ITEMS.map((item) => {
              const open = helpExpanded === item.title
              return (
                <View key={item.title} style={styles.helpItem}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={item.title}
                    onPress={() =>
                      setHelpExpanded((prev) =>
                        prev === item.title ? null : item.title,
                      )
                    }
                    style={({ pressed }) => [
                      styles.helpItemHeader,
                      pressed && styles.headerIconPressed,
                    ]}
                  >
                    <Text style={styles.helpItemTitle}>{item.title}</Text>
                    <View
                      style={{
                        transform: [{ rotate: open ? '180deg' : '0deg' }],
                      }}
                    >
                      <CaretDown
                        size={16}
                        color={Colors.textSecondary}
                        weight="bold"
                      />
                    </View>
                  </Pressable>
                  {open ? (
                    <Text style={styles.helpItemBody}>{item.body}</Text>
                  ) : null}
                </View>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={nameEditOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNameEditOpen(false)}
      >
        <View style={styles.nameModalBackdrop}>
          <Pressable
            style={styles.nameModalDismiss}
            onPress={() => setNameEditOpen(false)}
          />
          <View style={styles.nameModalCard}>
            <Text style={styles.nameModalTitle}>이름을 바꿔볼까요?</Text>
            <Text style={styles.nameModalLead}>
              펫에게 불러주고 싶은 이름을 적어 주세요. (최대 {PET_NAME_MAX}자)
            </Text>
            <TextInput
              style={styles.nameModalInput}
              value={nameDraft}
              onChangeText={(t) => setNameDraft(t.slice(0, PET_NAME_MAX))}
              maxLength={PET_NAME_MAX}
              placeholder={defaultPetName(petId)}
              placeholderTextColor={Colors.textDisabled}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                void saveNameEdit()
              }}
            />
            <Text style={styles.nameModalCount}>
              {nameDraft.trim().length}/{PET_NAME_MAX}
            </Text>
            <View style={styles.nameModalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setNameEditOpen(false)}
                style={({ pressed }) => [
                  styles.nameModalSecondary,
                  pressed && styles.headerIconPressed,
                ]}
              >
                <Text style={styles.nameModalSecondaryText}>나중에</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={
                  nameDraft.trim().length < 1 ||
                  nameDraft.trim() === petName ||
                  nameSaving
                }
                onPress={() => {
                  void saveNameEdit()
                }}
                style={({ pressed }) => [
                  styles.nameModalPrimary,
                  (nameDraft.trim().length < 1 ||
                    nameDraft.trim() === petName ||
                    nameSaving) &&
                    styles.nameModalPrimaryDisabled,
                  pressed && styles.headerIconPressed,
                ]}
              >
                <Text style={styles.nameModalPrimaryText}>저장할게요</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'visible',
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
    backgroundColor: 'transparent',
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
  helpBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(94, 64, 51, 0.28)',
  },
  helpSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Shadows.elevation,
  },
  helpHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  helpCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpLead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 18,
  },
  helpItem: {
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  helpItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  helpItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  helpItemBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingBottom: 14,
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
    backgroundColor: Colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  menuBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: Colors.surface,
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
    zIndex: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  petCluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petStage: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  petNameRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    maxWidth: 160,
  },
  petNameEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  headerIconPressed: {
    opacity: 0.88,
  },
  nameModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  nameModalDismiss: {
    ...StyleSheet.absoluteFill,
  },
  nameModalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    ...Shadows.elevation,
  },
  nameModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  nameModalLead: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  nameModalInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: Colors.background,
  },
  nameModalCount: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
    textAlign: 'right',
  },
  nameModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  nameModalSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  nameModalSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nameModalPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  nameModalPrimaryDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
  },
  nameModalPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
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
  heartFx: {
    position: 'absolute',
    top: 36,
    right: '18%',
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  heartFxSide: {
    marginBottom: 8,
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
    paddingTop: 14,
    paddingBottom: 10,
    overflow: 'visible',
    borderTopWidth: 0,
    ...Shadows.elevation,
    shadowOffset: { width: 0, height: -2 },
    alignItems: 'stretch',
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
  /** 레이아웃 공간 미점유 — 캐릭터 머리 위에 오버레이 */
  greetingBubble: {
    position: 'absolute',
    left: '50%',
    bottom: '100%',
    zIndex: 10,
    width: 260,
    marginLeft: -130,
    marginBottom: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  greetingBubbleText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  greetingBubbleTail: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    marginLeft: -7,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
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
  energyLabelInline: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  energyNumsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyNumsPressed: {
    opacity: 0.75,
  },
  energyNums: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  energyCaret: {
    marginLeft: 2,
    marginTop: 1,
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
    backgroundColor: Colors.energyFillMid,
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
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1,
    borderColor: Colors.selected,
    ...Shadows.elevation,
  },
  stockCardHovered: {
    backgroundColor: Colors.surface,
  },
  stockActionLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    tintColor: Colors.taupe,
    opacity: 0.55,
  },
  stockCount: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
})
