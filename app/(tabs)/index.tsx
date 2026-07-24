import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  Platform,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import {
  CaretRight,
  Bell,
  X,
  Heart,
  CaretDown,
  PencilSimple,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { TabSceneGate } from '../../components/TabSceneGate'
import { EnergyIcon } from '../../components/EnergyIcon'
import { AttendanceDoneDialog } from '../../components/AttendanceDoneDialog'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { TypeStyle } from '../../constants/Typography'
import { TextKeyboardProps } from '../../lib/inputKeyboard'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { useDesignWindow } from '../../components/AppViewport'
import {
  consumeWelcomePending,
  getOnboardingProfile,
  type PetChoice,
} from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import {
  CARE_USE_MAX_PER_DAY,
  ENERGY_FEED_GAIN,
  ENERGY_MAX,
  ENERGY_PLAY_GAIN,
  FOOD_MAX,
  TOY_MAX,
  addEnergy,
  addFood,
  addToy,
  energyBarColor as stockEnergyBarColor,
  energyCreditMessage,
  getCareUseGate,
  loadPetStock,
  recordCareUse,
  seedCareUseReadyForDev,
  useFood,
  useToy,
} from '../../lib/petStock'
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
import {
  ATTENDANCE_ENERGY_REWARD,
  dateKey,
  loadAttendanceKeys,
  stampToday,
} from '../../lib/attendance'
import { BottomSheet } from '../../components/ui'
import { CoachmarkWelcomeSheet } from '../../components/CoachmarkWelcomeSheet'
import { CoachmarkCompleteSheet } from '../../components/CoachmarkCompleteSheet'
import { CoachmarkTourCard } from '../../components/CoachmarkTourCard'
import {
  getCoachmarkWelcomeStatus,
  setCoachmarkWelcomeStatus,
} from '../../lib/coachmarkStorage'
import {
  dismissHomeStockTip,
  getHomeGuideTips,
} from '../../lib/homeGuideTipsStorage'
import {
  canClaimNow,
  getClaimMenuStatus,
  loadPetClaimState,
  recordPetClaim,
  recordPetItemUse,
  type PetClaimState,
} from '../../lib/petClaimCooldown'
import { PET_TOUR_STEPS, petTourHref } from '../../lib/coachmarkTour'
import {
  dismissPetTourComplete,
  finishPetTourDone,
  getPetTourCompletePending,
  getPetTourStepIndex,
  setPetTourStepIndex,
  startPetTourFromWelcome,
  subscribePetTour,
} from '../../lib/coachmarkTourState'

/** __DEV__: 홈 포커스당 세션 1회 — 주기 테스트용 재고·일일 카운트 */
let didDevCareUseSeed = false

const PET = {
  name: '하치',
  foodCount: 1,
  toyCount: 3,
}

const HEADER_MENU = [
  {
    id: 'feed',
    label: '사료 받기',
    image: require('../../assets/images/아이콘/사료.png'),
    bgColor: Colors.background,
  },
  {
    id: 'toy',
    label: '장난감 받기',
    image: require('../../assets/images/아이콘/공.png'),
    bgColor: Colors.background,
  },
  {
    id: 'stamp',
    label: '출석 도장',
    image: require('../../assets/images/아이콘/출석도장.png'),
    bgColor: Colors.background,
  },
  {
    id: 'storage',
    label: '내 보관함',
    image: require('../../assets/images/아이콘/보관함.png'),
    bgColor: Colors.background,
  },
  {
    id: 'guide',
    label: '안내',
    image: require('../../assets/images/아이콘/안내.png'),
    bgColor: Colors.background,
  },
] as const


/** 사료 주기 완료 — 시안 메인 카피 */
const FEED_DONE_SPEECH = {
  mongi: '밥 먹어서 에너지가 올랐다멍!',
  nami: '밥 먹어서 에너지가 올랐다냥!',
} as const

/** 놀아 주기 완료 — 시안 메인 카피 */
const PLAY_DONE_SPEECH = {
  mongi: '놀아줘서 에너지가 늘었다멍!',
  nami: '놀아줘서 에너지가 늘었다냥!',
} as const

/** 캐릭터 탭 — 말풍선 순환 (시안) */
const PET_TAP_LINES = [
  '오늘 뭐해요?',
  '배고파요',
  '같이 놀아요!',
  '신나요!',
  '심심해요',
] as const

/** 사료 주기 하트 버스트 위치 */
const HEART_BURST: {
  top: string
  left?: string
  right?: string
  size: number
}[] = [
  { top: '6%', left: '10%', size: 18 },
  { top: '14%', right: '8%', size: 24 },
  { top: '36%', left: '2%', size: 16 },
  { top: '32%', right: '4%', size: 20 },
  { top: '58%', left: '12%', size: 14 },
  { top: '54%', right: '10%', size: 18 },
]

/** 케어 아이템(밥통·장난감) 비행 오버레이 크기 */
const CARE_FLY_SIZE = 44
const BOWL_FLY_SIZE = CARE_FLY_SIZE
const TOY_FLY_SIZE = CARE_FLY_SIZE

const CLAIM_FEED_LINES = [
  '우와! 좋아하는 맘마예요. 정말 기뻐할 거예요!',
  '잘 챙겼어요. 꼬리 흔들며 기다리고 있을게요!',
  '고마워요! 이제 맘마 줄 준비가 됐어요.',
] as const

const CLAIM_TOY_LINES = (name: string) =>
  [
    `${name}와 놀아줄 시간이네요! 기운이 쑥쑥 차오르겠어요.`,
    '장난감이다! 같이 놀면 더 신날 거예요.',
    '고마워요! 놀아 주기만 하면 돼요.',
  ] as const

function helpItems(name: string) {
  return [
    {
      title: '받기 제한',
      body: '사료랑 장난감은 하루에 최대 2번 받을 수 있어요. 받은 뒤 4시간이 지나면 다시 받을 수 있고, 두 번째는 받은 걸 먼저 써 준 뒤에 열려요. 하루 횟수는 자정에 다시 시작돼요.',
    },
    {
      title: '보관 한도',
      body: '사료와 장난감은 최대 5개까지 소중히 보관해 둘 수 있어요.',
    },
    {
      title: '돌보기',
      body: `사료 주기·놀아 주기는 하루 각 ${CARE_USE_MAX_PER_DAY}번까지예요. 할 때마다 에너지가 오르고 ${name}와 마음이 더 가까워져요.`,
    },
  ] as const
}

const HOME_STOCK_TIP =
  '사료와 장난감은 최대 5개까지만 보관할 수 있어요.'

/** 펫 홈 헤더 — 시간대 상태 문구 (시안 콜라주) */
function homeStatusLine(now = new Date()): string {
  const h = now.getHours()
  if (h < 11) return '좋은 아침이에요!'
  if (h < 17) return '숨 한번 크게 고를까요?'
  if (h < 21) return '오늘 하루도 수고했어요.'
  return '편안한 밤 보내요.'
}

/** 기본 말풍선 — 헤더와 짝 */
function homeGreetingBubble(now = new Date()): string {
  const h = now.getHours()
  if (h < 11) return '오늘 하루도 같이 시작해요.'
  if (h < 17) return '잠깐 기지개도 켜봐요'
  if (h < 21) return '이제 나랑 편하게 쉬어요'
  return '오늘도 화이팅해요'
}

const TAB_WELCOME = {
  title: '다시 만나서 반가워요!',
  bubble: '오늘도 화이팅해요',
} as const

type CareStockCardProps = {
  count: number
  icon: number
  useLabel: string
  acquireLabel: string
  onUse: () => void
  onAcquire: () => void
  /** 0개일 때 아이콘 회색 처리 (장난감 등) */
  grayIconWhenEmpty?: boolean
  /** 코치마크 하이라이트 */
  tourHighlight?: boolean
  /** 사료 비행 애니메이션 측정용 */
  anchorRef?: RefObject<View | null>
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
  tourHighlight = false,
  anchorRef,
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
    <View ref={anchorRef} collapsable={false} style={styles.stockCardWrap}>
      <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
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
            tourHighlight && styles.stockCardTour,
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
    </View>
  )
}

/** Progress ring stroke for claim cooldown (main orange). */
const MENU_RING_STROKE = 2.5

/** 미션 퀵 바 — 원형 + 수령 가능/쿨다운 링 */
type MenuQuickItemProps = {
  label: string
  image: number
  bgColor: string
  /** 받기 가능(제작 완료) — 사료/장난감 */
  ready?: boolean
  /** 오늘 출석 등 — 완료 띠 */
  done?: boolean
  /** 쿨다운 남은 시간 HH:MM:SS */
  cooldownLabel?: string
  /**
   * 쿨다운 진행도 0→1 (대기 경과에 따라 링이 채워짐 → 수령 가능).
   * ready일 때는 링 숨김.
   */
  cooldownProgress?: number
  highlighted?: boolean
  circleSize: number
  iconSize: number
  labelSize: number
  onPress: () => void
}

function MenuCooldownRing({
  size,
  progress,
}: {
  size: number
  progress: number
}) {
  // Stroke sits just outside the opaque circle so it isn't covered.
  const outset = MENU_RING_STROKE
  const ringSize = size + outset * 2
  const r = (ringSize - MENU_RING_STROKE) / 2
  const c = 2 * Math.PI * r
  const ratio = Math.min(1, Math.max(0, progress))
  const offset = c * (1 - ratio)
  const cx = ringSize / 2

  return (
    <Svg
      width={ringSize}
      height={ringSize}
      style={[
        styles.menuRingSvg,
        {
          width: ringSize,
          height: ringSize,
          left: -outset,
          top: -outset,
        },
      ]}
      pointerEvents="none"
    >
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={Colors.energyTrack}
        strokeWidth={MENU_RING_STROKE}
        fill="none"
      />
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={Colors.primary}
        strokeWidth={MENU_RING_STROKE}
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </Svg>
  )
}

function MenuQuickItem({
  label,
  image,
  bgColor,
  ready = false,
  done = false,
  cooldownLabel,
  cooldownProgress,
  highlighted,
  circleSize,
  iconSize,
  labelSize,
  onPress,
}: MenuQuickItemProps) {
  const cooling = Boolean(cooldownLabel)
  const [hovered, setHovered] = useState(false)
  const showDoneBadge = ready || done
  const lift = (showDoneBadge && hovered) || highlighted
  const showRing = cooling && cooldownProgress != null
  const timerFontSize = Math.max(7, Math.min(9, Math.round(circleSize * 0.18)))

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        done
          ? `${label}, 완료`
          : ready
            ? `${label}, 완료`
            : cooling
              ? `${label}, 남은 시간 ${cooldownLabel}`
              : label
      }
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
          style={{
            width: circleSize,
            height: circleSize,
            overflow: 'visible',
          }}
        >
          {showRing ? (
            <MenuCooldownRing
              size={circleSize}
              progress={cooldownProgress ?? 0}
            />
          ) : null}
          <View
            style={[
              styles.menuCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                backgroundColor: bgColor,
              },
              ready && styles.menuCircleReady,
              done && !ready && styles.menuCircleDone,
              showRing && styles.menuCircleCooldown,
              highlighted && !showDoneBadge && !cooling && styles.menuCircleNudge,
            ]}
          >
            <Image
              source={image}
              style={[
                { width: iconSize, height: iconSize },
                cooling && styles.menuIconDimmed,
              ]}
              resizeMode="contain"
            />
            {cooling && cooldownLabel ? (
              <View style={styles.menuCooldownTimerWrap} pointerEvents="none">
                <Text
                  style={[
                    styles.menuCooldownTimer,
                    { fontSize: timerFontSize },
                  ]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {cooldownLabel}
                </Text>
              </View>
            ) : null}
          </View>
          {showDoneBadge ? (
            <View style={styles.menuReadyBadge} pointerEvents="none">
              <Text style={styles.menuReadyBadgeText} allowFontScaling={false}>
                완료
              </Text>
            </View>
          ) : null}
        </View>
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
  const fillColor = stockEnergyBarColor(energy)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`에너지 ${energy} / ${energyMax}, 보관함 보기`}
      onPress={onPressStorage}
      style={({ pressed }) => [
        styles.energyBlock,
        pressed && styles.energyBlockPressed,
      ]}
    >
      <View style={styles.levelRow}>
        <View style={styles.levelLeft}>
          <EnergyIcon size={16} />
          <Text style={styles.energyLabelInline}>에너지</Text>
        </View>
        <View style={styles.energyNums}>
          <Text style={styles.energyCurrent}>{energy.toLocaleString()}</Text>
          <Text style={styles.energyMax}> / {energyMax.toLocaleString()}</Text>
          <View style={styles.energyChevron}>
            <CaretRight size={14} color={Colors.textDisabled} weight="bold" />
          </View>
        </View>
      </View>
      <View style={styles.energyTrack}>
        <View
          style={[
            styles.energyFill,
            { width: `${energyRatio}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </Pressable>
  )
}

export default function PetHomeScreen() {
  return (
    <TabSceneGate>
      <PetHomeScreenBody />
    </TabSceneGate>
  )
}

function PetHomeScreenBody() {
  const { width: screenWidth, height: screenHeight } = useDesignWindow()
  const insets = useSafeAreaInsets()
  const [energy, setEnergy] = useState(20)
  const [foodCount, setFoodCount] = useState(PET.foodCount)
  const [toyCount, setToyCount] = useState(PET.toyCount)
  const [speech, setSpeech] = useState(() => homeGreetingBubble())
  const [fxLabel, setFxLabel] = useState<string | null>(null)
  const [fxAccent, setFxAccent] = useState(false)
  const [sheetH, setSheetH] = useState(280)
  /** 헤더↔하단 케어바 사이 중간 영역 높이 (펫 사이즈 산출용) */
  const [petZoneH, setPetZoneH] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [attendOpen, setAttendOpen] = useState(false)
  const [attendCredited, setAttendCredited] = useState(0)
  const [attendAlready, setAttendAlready] = useState(false)
  const [attendBusy, setAttendBusy] = useState(false)
  const [stampedToday, setStampedToday] = useState(false)
  const [coachWelcomeOpen, setCoachWelcomeOpen] = useState(false)
  /** false until this tab actually focuses — avoids deep-link to other tabs showing home Modals */
  const [homeFocused, setHomeFocused] = useState(false)
  const [coachCompleteOpen, setCoachCompleteOpen] = useState(
    getPetTourCompletePending(),
  )
  const [coachTourStep, setCoachTourStep] = useState<number | null>(
    getPetTourStepIndex(),
  )
  const [petId, setPetId] = useState<PetChoice>('mongi')
  const [petName, setPetNameState] = useState(PET.name)
  const [statusLine, setStatusLine] = useState(() => homeStatusLine())
  const [tabWelcome, setTabWelcome] = useState(false)
  const tabHadBlurRef = useRef(false)
  const [nameEditOpen, setNameEditOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(PET.name)
  const [nameSaving, setNameSaving] = useState(false)
  const [heartsOn, setHeartsOn] = useState(false)
  const [helpExpanded, setHelpExpanded] = useState<string | null>(null)
  const [stockTipOn, setStockTipOn] = useState(false)
  const [tipsReady, setTipsReady] = useState(false)
  const [claimState, setClaimState] = useState<PetClaimState | null>(null)
  const [claimNow, setClaimNow] = useState(() => Date.now())
  /** 빈 재고일 때 상단 받기 메뉴 강조 */
  const [menuNudge, setMenuNudge] = useState<'feed' | 'toy' | null>(null)
  const careBusyRef = useRef(false)
  const menuNudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tapLineIndex = useRef(0)
  const feedCardRef = useRef<View>(null)
  const toyCardRef = useRef<View>(null)
  const petStageRef = useRef<View>(null)

  // 상단 헤더 · 중간 펫존(flex:1) · 하단 케어바 · 탭바 예약
  const tabBarReserve = tabBarReserveHeight(insets.bottom)
  const sheetMaxHeight = Math.round(screenHeight * 0.55)
  const headerTopPad = insets.top + 8
  const nameReserve = 40
  const bubbleReserve = 72
  const petAvailH = Math.max(petZoneH > 0 ? petZoneH : 220, 160)
  const petSize = Math.round(
    Math.min(
      190,
      Math.max(110, (petAvailH - nameReserve - bubbleReserve) * 0.85),
    ),
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
  const bowlFlyTX = useRef(new Animated.Value(0)).current
  const bowlFlyTY = useRef(new Animated.Value(0)).current
  const bowlFlyOpacity = useRef(new Animated.Value(0)).current
  const bowlFlyScale = useRef(new Animated.Value(1)).current
  const toyFlyTX = useRef(new Animated.Value(0)).current
  const toyFlyTY = useRef(new Animated.Value(0)).current
  const toyFlyOpacity = useRef(new Animated.Value(0)).current
  const toyFlyScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    return () => {
      if (speechTimer.current) clearTimeout(speechTimer.current)
      if (menuNudgeTimer.current) clearTimeout(menuNudgeTimer.current)
    }
  }, [])

  const nudgeMenu = (kind: 'feed' | 'toy') => {
    setMenuNudge(kind)
    if (menuNudgeTimer.current) clearTimeout(menuNudgeTimer.current)
    menuNudgeTimer.current = setTimeout(() => setMenuNudge(null), 3200)
  }

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
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(heartLift, {
        toValue: -36,
        duration: 980,
        useNativeDriver: true,
      }),
    ]).start(() => setHeartsOn(false))
  }

  /** 사료 밥통이 케어 버튼 → 캐릭터로 날아감 (~0.65s) */
  const playBowlFly = () =>
    new Promise<void>((resolve) => {
      const fromNode = feedCardRef.current
      const toNode = petStageRef.current
      if (!fromNode || !toNode) {
        resolve()
        return
      }

      fromNode.measureInWindow((fx, fy, fw, fh) => {
        toNode.measureInWindow((tx, ty, tw, th) => {
          if (fw <= 0 || fh <= 0 || tw <= 0 || th <= 0) {
            resolve()
            return
          }
          const startX = fx + fw / 2 - BOWL_FLY_SIZE / 2
          const startY = fy + fh / 2 - BOWL_FLY_SIZE / 2
          const endX = tx + tw / 2 - BOWL_FLY_SIZE / 2
          const endY = ty + th * 0.52 - BOWL_FLY_SIZE / 2
          const ease = Easing.out(Easing.cubic)

          bowlFlyTX.setValue(startX)
          bowlFlyTY.setValue(startY)
          bowlFlyOpacity.setValue(1)
          bowlFlyScale.setValue(0.92)

          Animated.parallel([
            Animated.timing(bowlFlyTX, {
              toValue: endX,
              duration: 640,
              easing: ease,
              useNativeDriver: true,
            }),
            Animated.timing(bowlFlyTY, {
              toValue: endY,
              duration: 640,
              easing: ease,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(bowlFlyScale, {
                toValue: 1.06,
                duration: 180,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(bowlFlyScale, {
                toValue: 0.78,
                duration: 460,
                easing: ease,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(420),
              Animated.timing(bowlFlyOpacity, {
                toValue: 0,
                duration: 220,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => resolve())
        })
      })
    })

  /** 장난감이 케어 버튼 → 캐릭터로 날아감 (~0.65s) */
  const playToyFly = () =>
    new Promise<void>((resolve) => {
      const fromNode = toyCardRef.current
      const toNode = petStageRef.current
      if (!fromNode || !toNode) {
        resolve()
        return
      }

      fromNode.measureInWindow((fx, fy, fw, fh) => {
        toNode.measureInWindow((tx, ty, tw, th) => {
          if (fw <= 0 || fh <= 0 || tw <= 0 || th <= 0) {
            resolve()
            return
          }
          const startX = fx + fw / 2 - TOY_FLY_SIZE / 2
          const startY = fy + fh / 2 - TOY_FLY_SIZE / 2
          const endX = tx + tw / 2 - TOY_FLY_SIZE / 2
          const endY = ty + th * 0.52 - TOY_FLY_SIZE / 2
          const ease = Easing.out(Easing.cubic)

          toyFlyTX.setValue(startX)
          toyFlyTY.setValue(startY)
          toyFlyOpacity.setValue(1)
          toyFlyScale.setValue(0.92)

          Animated.parallel([
            Animated.timing(toyFlyTX, {
              toValue: endX,
              duration: 640,
              easing: ease,
              useNativeDriver: true,
            }),
            Animated.timing(toyFlyTY, {
              toValue: endY,
              duration: 640,
              easing: ease,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(toyFlyScale, {
                toValue: 1.06,
                duration: 180,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(toyFlyScale, {
                toValue: 0.78,
                duration: 460,
                easing: ease,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.delay(420),
              Animated.timing(toyFlyOpacity, {
                toValue: 0,
                duration: 220,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => resolve())
        })
      })
    })

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
          setSpeech(homeGreetingBubble())
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

  // __DEV__: Fast Refresh 직후에도 주기·받기 버튼이 바로 켜지도록 재고·일일·쿨다운 시드
  useEffect(() => {
    if (!__DEV__) return
    let cancelled = false
    void (async () => {
      if (didDevCareUseSeed) return
      didDevCareUseSeed = true
      const stock = await seedCareUseReadyForDev()
      const claims = await loadPetClaimState()
      if (cancelled) return
      setEnergy(stock.energy)
      setFoodCount(stock.food)
      setToyCount(stock.toy)
      setClaimState(claims)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setHomeFocused(true)
      let cancelled = false
      let cheerTimer: ReturnType<typeof setTimeout> | null = null
      let coachTimer: ReturnType<typeof setTimeout> | null = null

      void (async () => {
        if (__DEV__ && !didDevCareUseSeed) {
          didDevCareUseSeed = true
          await seedCareUseReadyForDev()
          const claims = await loadPetClaimState()
          if (!cancelled) setClaimState(claims)
        }
        const stock = await loadPetStock()
        if (cancelled) return
        setEnergy(stock.energy)
        setFoodCount(stock.food)
        setToyCount(stock.toy)

        const attendKeys = await loadAttendanceKeys()
        if (cancelled) return
        setStampedToday(attendKeys.includes(dateKey(new Date())))

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
        if (cancelled) return
        if (pending === 'resume') {
          showSpeech(getOnboardingCopy().resume.restored.homeBubble, 3600)
          return
        }
        // cm-01-welcome: 홈 탭 포커스일 때만
        const coach = await getCoachmarkWelcomeStatus()
        if (cancelled) return
        if (coach === 'pending') {
          coachTimer = setTimeout(() => {
            if (!cancelled) setCoachWelcomeOpen(true)
          }, 450)
          return
        }
        if (pending === 'fresh') {
          showSpeech('반가워! 위에서 사료 받기부터 해볼래?', 3200)
        }
      })()

      // 다른 탭에서 돌아올 때 — 환영 헤더 + 말풍선
      let welcomeClear: ReturnType<typeof setTimeout> | null = null
      if (tabHadBlurRef.current) {
        setTabWelcome(true)
        cheerTimer = setTimeout(() => {
          if (cancelled) return
          if (getPetTourStepIndex() != null) return
          showSpeech(TAB_WELCOME.bubble, 2800)
        }, 220)
        // 잠시 후 시간대 헤더로 복귀
        welcomeClear = setTimeout(() => {
          if (!cancelled) {
            setTabWelcome(false)
            setStatusLine(homeStatusLine())
          }
        }, 4200)
      } else {
        setStatusLine(homeStatusLine())
        setSpeech(homeGreetingBubble())
      }

      return () => {
        cancelled = true
        setHomeFocused(false)
        if (cheerTimer) clearTimeout(cheerTimer)
        if (coachTimer) clearTimeout(coachTimer)
        if (welcomeClear) clearTimeout(welcomeClear)
        tabHadBlurRef.current = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- 탭 포커스 시 재고·환영만
    }, [petName]),
  )
  useEffect(() => {
    return subscribePetTour(() => {
      setCoachTourStep(getPetTourStepIndex())
      setCoachCompleteOpen(getPetTourCompletePending())
    })
  }, [])

  const dismissCoachWelcome = async (status: 'skipped' | 'accepted') => {
    setCoachWelcomeOpen(false)
    await setCoachmarkWelcomeStatus(status)
  }

  const startPetTour = () => {
    setCoachWelcomeOpen(false)
    startPetTourFromWelcome()
  }

  const finishPetTour = async () => {
    finishPetTourDone()
    await setCoachmarkWelcomeStatus('accepted')
  }

  const onPetTourNext = () => {
    if (coachTourStep == null) return
    const next = coachTourStep + 1
    if (next < PET_TOUR_STEPS.length) {
      const step = PET_TOUR_STEPS[next]
      setPetTourStepIndex(next)
      if (step.route !== 'pet') {
        router.push(petTourHref(step.route) as never)
      }
      return
    }
    void finishPetTour()
  }

  const tourStep =
    coachTourStep != null ? PET_TOUR_STEPS[coachTourStep] : null
  const showPetTour = tourStep?.route === 'pet'
  const tourHighlightCare = showPetTour && tourStep?.highlight === 'care'
  const tourHighlightMenu = showPetTour && tourStep?.highlight === 'menu'
  const tourHighlightTabs = showPetTour && tourStep?.highlight === 'tabs'
  const showGuideTips =
    tipsReady && !coachWelcomeOpen && !showPetTour && !coachCompleteOpen
  const showStockTip = showGuideTips && stockTipOn

  useEffect(() => {
    let cancelled = false
    void getHomeGuideTips().then((tips) => {
      if (cancelled) return
      setStockTipOn(!tips.stockDismissed)
      setTipsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadPetClaimState().then((s) => {
      if (!cancelled) setClaimState(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const feedClaimStatus = claimState
    ? getClaimMenuStatus(claimState.feed, claimNow, 'feed')
    : { kind: 'idle' as const }
  const toyClaimStatus = claimState
    ? getClaimMenuStatus(claimState.toy, claimNow, 'toy')
    : { kind: 'idle' as const }
  const claimTickerOn =
    feedClaimStatus.kind === 'cooldown' ||
    toyClaimStatus.kind === 'cooldown'

  useEffect(() => {
    if (!claimTickerOn) return
    const id = setInterval(() => setClaimNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [claimTickerOn])

  const openNameEdit = () => {
    setNameDraft(petName)
    setNameEditOpen(true)
  }

  const saveNameEdit = async () => {
    const trimmed = nameDraft.trim()
    if (trimmed.length < 1 || trimmed.length > PET_NAME_MAX || nameSaving) return
    if (trimmed === petName) {
      setNameEditOpen(false)
      return
    }
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

  const applyEnergyCredit = async (
    result: Awaited<ReturnType<typeof addEnergy>>,
  ) => {
    setEnergy(result.stock.energy)
    const msg = energyCreditMessage(result)
    if (msg) {
      showToast(msg)
      if (result.credited > 0) {
        await playFx(`+${result.credited} 에너지`, true)
      }
      return
    }
    if (result.credited > 0) {
      await playFx(`+${result.credited} 에너지`, true)
    }
  }

  const runCareAction = async (kind: 'feed' | 'play') => {
    if (careBusyRef.current) return

    if (kind === 'feed' && foodCount <= 0) return
    if (kind === 'play' && toyCount <= 0) return

    const gate = await getCareUseGate(kind)
    if (!gate.ok) {
      const label = kind === 'feed' ? '사료 주기' : '놀아 주기'
      showSpeech(
        `오늘은 ${label}를 ${CARE_USE_MAX_PER_DAY}번 모두 했어요. 내일 다시 와요!`,
        3200,
      )
      showToast(`오늘 ${label} 한도에 도달했어요`)
      return
    }

    careBusyRef.current = true
    try {
      const gain = kind === 'feed' ? ENERGY_FEED_GAIN : ENERGY_PLAY_GAIN
      if (kind === 'feed') {
        const next = await useFood(1)
        if (!next) return
        setFoodCount(next.food)
        await recordCareUse('feed')
        const claims = await recordPetItemUse('feed')
        setClaimState(claims)
        playHearts()
        await playBowlFly()
        await playPetReact('eat')
        const after = await addEnergy(gain)
        await applyEnergyCredit(after)
        showSpeech(FEED_DONE_SPEECH[petId], 3400)
      } else {
        const next = await useToy(1)
        if (!next) return
        setToyCount(next.toy)
        await recordCareUse('play')
        const claims = await recordPetItemUse('toy')
        setClaimState(claims)
        playHearts()
        await playToyFly()
        await playPetReact('play')
        const after = await addEnergy(gain)
        await applyEnergyCredit(after)
        showSpeech(PLAY_DONE_SPEECH[petId], 3400)
      }
    } finally {
      careBusyRef.current = false
    }
  }

  const claimBlockedSpeech = (
    st: ReturnType<typeof getClaimMenuStatus> | null,
    kind: 'feed' | 'toy',
  ) => {
    if (st?.kind === 'cooldown') {
      showSpeech(`아직 제작 중이에요. ${st.label} 뒤에 다시 와요!`)
      return
    }
    if (st?.kind === 'need_use') {
      const tip =
        kind === 'feed'
          ? '두 번째 사료는 받은 맘마를 먼저 준 뒤에 받을 수 있어요.'
          : '두 번째 장난감은 먼저 놀아 준 뒤에 받을 수 있어요.'
      showSpeech(tip, 3400)
      showToast(tip)
      return
    }
    showSpeech('오늘은 이미 받았어요. 내일 다시 와요!')
  }

  const claimFeed = () => {
    if (careBusyRef.current) return
    if (foodCount >= FOOD_MAX) {
      showSpeech('보관함이 가득해요. 먼저 맘마를 줄래요?')
      return
    }
    if (!claimState || !canClaimNow(claimState.feed, claimNow)) {
      const st = claimState
        ? getClaimMenuStatus(claimState.feed, claimNow, 'feed')
        : null
      claimBlockedSpeech(st, 'feed')
      return
    }
    void (async () => {
      const next = await addFood(1)
      if (!next) {
        showSpeech('보관함이 가득해요. 먼저 맘마를 줄래요?')
        return
      }
      setFoodCount(next.food)
      const claims = await recordPetClaim('feed')
      setClaimState(claims)
      setClaimNow(Date.now())
      setMenuNudge(null)
      showToast('사료를 받았어요')
      showSpeech(pickRandom(CLAIM_FEED_LINES), 3000)
      await playFx('+1 사료', false)
    })()
  }

  const claimToy = () => {
    if (careBusyRef.current) return
    if (toyCount >= TOY_MAX) {
      showSpeech('장난감이 충분해요. 먼저 놀아 줄래요?')
      return
    }
    if (!claimState || !canClaimNow(claimState.toy, claimNow)) {
      const st = claimState
        ? getClaimMenuStatus(claimState.toy, claimNow, 'toy')
        : null
      claimBlockedSpeech(st, 'toy')
      return
    }
    void (async () => {
      const next = await addToy(1)
      if (!next) {
        showSpeech('장난감이 충분해요. 먼저 놀아 줄래요?')
        return
      }
      setToyCount(next.toy)
      const claims = await recordPetClaim('toy')
      setClaimState(claims)
      setClaimNow(Date.now())
      setMenuNudge(null)
      showToast('장난감을 받았어요')
      showSpeech(pickRandom(CLAIM_TOY_LINES(petName)), 3000)
      await playFx('+1 장난감', false)
    })()
  }

  const handleAcquireFeed = () => {
    nudgeMenu('feed')
    showSpeech('위에서 「사료 받기」를 눌러 받아와 줄래요?')
  }

  const handleAcquireToy = () => {
    nudgeMenu('toy')
    showSpeech('위에서 「장난감 받기」를 눌러 받아와 줄래요?')
  }

  /** 출석 메뉴 — 캘린더 대신 완료 팝업 */
  const openAttendance = () => {
    if (attendBusy) return
    setAttendBusy(true)
    void (async () => {
      try {
        const next = await stampToday()
        if (!next) {
          setAttendCredited(0)
          setAttendAlready(true)
          setStampedToday(true)
          setAttendOpen(true)
          return
        }
        setStampedToday(true)
        const result = await addEnergy(ATTENDANCE_ENERGY_REWARD)
        setEnergy(result.stock.energy)
        setAttendCredited(result.credited)
        setAttendAlready(false)
        setAttendOpen(true)
      } finally {
        setAttendBusy(false)
      }
    })()
  }

  const handleFeedPress = () => {
    void runCareAction('feed')
  }

  const handlePlayPress = () => {
    void runCareAction('play')
  }

  /** 캐릭터 탭 — 말풍선 순환 */
  const onPetTap = () => {
    if (showPetTour || coachWelcomeOpen || coachCompleteOpen) return
    const next = (tapLineIndex.current + 1) % PET_TAP_LINES.length
    tapLineIndex.current = next
    const line = PET_TAP_LINES[next]
    if (speechTimer.current) clearTimeout(speechTimer.current)
    setSpeech(line)
    speechOpacity.setValue(0)
    Animated.timing(speechOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start()
    Animated.sequence([
      Animated.timing(petScale, {
        toValue: 0.96,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(petScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const bubbleText = speech || homeGreetingBubble()
  const petImage = petId === 'nami' ? CatExpr.soft : DogExpr.soft

  return (
    <ImageBackground
      source={require('../../assets/images/pet_bg.png')}
      style={styles.screen}
      resizeMode="cover"
      imageStyle={styles.petBgImage}
    >
      <View style={[styles.body, { paddingBottom: tabBarReserve }]}>
        {/* 헤더 (상태 문구 + 메뉴) */}
        <View
          style={[
            styles.headerLayer,
            { paddingTop: headerTopPad },
            tourHighlightMenu && styles.headerLayerTour,
          ]}
        >
          <View style={tourHighlightMenu ? styles.headerTourMuted : null}>
            <View style={styles.nicknameRow}>
              {tabWelcome ? (
                <View style={styles.headerCopy}>
                  <Text style={styles.nicknameText} numberOfLines={1}>
                    {TAB_WELCOME.title}
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`나의 펫 ${petName}, 이름 수정`}
                  accessibilityHint="탭하면 펫 이름을 바꿀 수 있어요"
                  hitSlop={8}
                  onPress={openNameEdit}
                  style={({ pressed }) => [
                    styles.petTitleBtn,
                    pressed && styles.headerIconPressed,
                  ]}
                >
                  <Text style={styles.nicknameText} numberOfLines={1}>
                    {`나의 펫 ${petName}`}
                  </Text>
                  <PencilSimple
                    size={18}
                    color={Colors.textPrimary}
                    weight="regular"
                  />
                </Pressable>
              )}
              <View style={styles.headerActions}>
                <Pressable
                  style={styles.bellBtn}
                  onPress={() => router.push('/notifications')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="알림"
                >
                  <View>
                    <Bell size={24} color={Colors.textPrimary} weight="light" />
                    <View style={styles.notifDot} />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.menuRow}>
            <View
              style={[
                styles.claimMenuGroup,
                tourHighlightMenu && styles.claimMenuTour,
              ]}
              collapsable={false}
            >
              {HEADER_MENU.filter(
                (item) => item.id === 'feed' || item.id === 'toy',
              ).map((item) => (
                <MenuQuickItem
                  key={item.id}
                  label={item.label}
                  image={item.image}
                  bgColor={item.bgColor}
                  ready={
                    item.id === 'feed'
                      ? feedClaimStatus.kind === 'ready'
                      : toyClaimStatus.kind === 'ready'
                  }
                  cooldownLabel={
                    item.id === 'feed' && feedClaimStatus.kind === 'cooldown'
                      ? feedClaimStatus.label
                      : item.id === 'toy' && toyClaimStatus.kind === 'cooldown'
                        ? toyClaimStatus.label
                        : undefined
                  }
                  cooldownProgress={
                    item.id === 'feed' && feedClaimStatus.kind === 'cooldown'
                      ? feedClaimStatus.progress
                      : item.id === 'toy' && toyClaimStatus.kind === 'cooldown'
                        ? toyClaimStatus.progress
                        : undefined
                  }
                  highlighted={menuNudge === item.id}
                  circleSize={menuCircleSize}
                  iconSize={menuIconSize}
                  labelSize={menuLabelSize}
                  onPress={() => {
                    if (item.id === 'feed') claimFeed()
                    else claimToy()
                  }}
                />
              ))}
            </View>
            <View
              style={[
                styles.menuRestGroup,
                tourHighlightMenu && styles.headerTourMuted,
              ]}
            >
              {HEADER_MENU.filter(
                (item) => item.id !== 'feed' && item.id !== 'toy',
              ).map((item) => (
                <MenuQuickItem
                  key={item.id}
                  label={item.label}
                  image={item.image}
                  bgColor={item.bgColor}
                  ready={false}
                  done={item.id === 'stamp' ? stampedToday : false}
                  highlighted={false}
                  circleSize={menuCircleSize}
                  iconSize={menuIconSize}
                  labelSize={menuLabelSize}
                  onPress={() => {
                    if (item.id === 'storage') openStorage()
                    else if (item.id === 'guide') setHelpOpen(true)
                    else if (item.id === 'stamp') openAttendance()
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 말풍선 + 캐릭터 — 헤더와 하단 케어바 사이 flex 중간 영역 */}
        <View
          style={styles.petLayer}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height)
            if (h > 0 && Math.abs(h - petZoneH) > 2) setPetZoneH(h)
          }}
          pointerEvents="box-none"
        >
          <View style={styles.petCluster}>
            <Animated.View
              style={[styles.greetingBubble, { opacity: speechOpacity }]}
              accessibilityRole="text"
              accessibilityLabel={bubbleText}
              pointerEvents="none"
            >
              <Text style={styles.greetingBubbleText}>{bubbleText}</Text>
              <View style={styles.greetingBubbleTail} />
            </Animated.View>
            <View
              ref={petStageRef}
              collapsable={false}
              style={[styles.petStage, { width: petSize, height: petSize }]}
            >
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
                    styles.heartFxLayer,
                    {
                      opacity: heartOpacity,
                      transform: [{ translateY: heartLift }],
                    },
                  ]}
                >
                  {HEART_BURST.map((h, i) => (
                    <View
                      key={i}
                      style={[
                        styles.heartFxItem,
                        {
                          top: h.top,
                          ...(h.left != null ? { left: h.left } : null),
                          ...(h.right != null ? { right: h.right } : null),
                        },
                      ]}
                    >
                      <Heart
                        size={h.size}
                        color={Colors.primary}
                        weight="fill"
                      />
                    </View>
                  ))}
                </Animated.View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${petName}와 인사하기`}
                onPress={onPetTap}
                style={({ pressed }) => [
                  pressed && styles.petPressablePressed,
                ]}
              >
                <Animated.Image
                  source={petImage}
                  style={{
                    width: petSize,
                    height: petSize,
                    transform: [{ scale: petScale }, { translateY: petNudgeY }],
                  }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* 하단 케어 패널 — 에너지 + 사료/장난감 CTA */}
        <View
          style={[
            styles.sheet,
            { maxHeight: sheetMaxHeight },
            tourHighlightCare && styles.sheetTour,
          ]}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height)
            if (h > 0 && Math.abs(h - sheetH) > 2) setSheetH(h)
          }}
        >
          <View style={styles.primaryBlock}>
            <View style={tourHighlightCare ? styles.energyTourMuted : null}>
              <LevelEnergyBlock
                energy={energy}
                energyMax={ENERGY_MAX}
                onPressStorage={openStorage}
              />
            </View>
            {showStockTip ? (
              <View style={styles.stockTip}>
                <Text style={styles.stockTipText}>{HOME_STOCK_TIP}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="보관 안내 닫기"
                  hitSlop={8}
                  onPress={() => {
                    setStockTipOn(false)
                    void dismissHomeStockTip()
                  }}
                  style={styles.tipCloseBtn}
                >
                  <X size={14} color={Colors.textSecondary} weight="bold" />
                </Pressable>
              </View>
            ) : null}
            <View
              style={[
                styles.actionRow,
                tourHighlightCare && styles.actionRowTour,
              ]}
              collapsable={false}
            >
              <CareStockCard
                count={foodCount}
                icon={
                  foodCount <= 0
                    ? require('../../assets/images/아이콘/빈사료.png')
                    : require('../../assets/images/아이콘/사료.png')
                }
                useLabel="사료 주기"
                acquireLabel="사료 받기"
                onUse={handleFeedPress}
                onAcquire={handleAcquireFeed}
                anchorRef={feedCardRef}
              />
              <View style={{ width: actionGap }} />
              <CareStockCard
                count={toyCount}
                icon={require('../../assets/images/아이콘/공.png')}
                useLabel="놀아 주기"
                acquireLabel="장난감 받기"
                grayIconWhenEmpty
                onUse={handlePlayPress}
                onAcquire={handleAcquireToy}
                anchorRef={toyCardRef}
              />
            </View>
          </View>
        </View>
      </View>

      {showPetTour && homeFocused && tourStep ? (
        <>
          <View style={styles.coachScrimLayer} pointerEvents="auto">
            <View style={styles.coachScrim} />
          </View>
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={coachTourStep ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            {...(tourHighlightTabs
              ? { center: true as const }
              : tourHighlightMenu
                ? {
                    top: headerTopPad + 118,
                    tailAlign: 'start' as const,
                  }
                : {
                    bottom:
                      tabBarReserve + Math.min(sheetH, sheetMaxHeight) * 0.38,
                  })}
          />
        </>
      ) : null}

      <CoachmarkWelcomeSheet
        visible={coachWelcomeOpen && homeFocused}
        onSkip={() => {
          void dismissCoachWelcome('skipped')
        }}
        onAccept={startPetTour}
      />

      <CoachmarkCompleteSheet
        visible={coachCompleteOpen && homeFocused}
        petName={petName}
        onMeet={dismissPetTourComplete}
      />

      <AttendanceDoneDialog
        visible={attendOpen && homeFocused}
        credited={attendCredited}
        alreadyStamped={attendAlready}
        onClose={() => setAttendOpen(false)}
      />

      <BottomSheet
        visible={helpOpen}
        onRequestClose={() => setHelpOpen(false)}
        sheetStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <View style={styles.helpHeader}>
          <Text style={styles.helpTitle}>안내</Text>
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
        <View style={styles.helpIconRow} accessibilityElementsHidden>
          <View style={styles.helpIconChip}>
            <Image
              source={require('../../assets/images/아이콘/사료.png')}
              style={styles.helpIconImg}
              resizeMode="contain"
            />
            <Text style={styles.helpIconLabel}>사료</Text>
          </View>
          <View style={styles.helpIconChip}>
            <Image
              source={require('../../assets/images/아이콘/공.png')}
              style={styles.helpIconImg}
              resizeMode="contain"
            />
            <Text style={styles.helpIconLabel}>장난감</Text>
          </View>
        </View>
        <Text style={styles.helpLead}>
          사료랑 장난감으로 돌보는 방법이에요. 천천히 읽어 주세요.
        </Text>
        {helpItems(petName).map((item) => {
          const open = helpExpanded === item.title
          return (
            <View
              key={item.title}
              style={[styles.helpItem, open && styles.helpItemOpen]}
            >
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
      </BottomSheet>

      <BottomSheet
        visible={nameEditOpen}
        onRequestClose={() => setNameEditOpen(false)}
        sheetStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <Text style={styles.nameModalTitle}>새 이름 지어주기</Text>
        <Text style={styles.nameModalLead}>
          가장 어울리는 이름을 만들어 주세요.
        </Text>
        <View
          style={[
            styles.nameModalInputWrap,
            nameDraft.length > 0 && styles.nameModalInputWrapOn,
          ]}
        >
          <TextInput
            {...TextKeyboardProps}
            style={styles.nameModalInput}
            value={nameDraft}
            onChangeText={(t) => setNameDraft(t.slice(0, PET_NAME_MAX))}
            maxLength={PET_NAME_MAX}
            placeholder={defaultPetName(petId)}
            placeholderTextColor={Colors.textDisabled}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => {
              void saveNameEdit()
            }}
          />
          <Text style={styles.nameModalCountIn}>
            {nameDraft.length} / {PET_NAME_MAX}
          </Text>
        </View>
        <Text style={styles.nameModalHint}>
          최대 {PET_NAME_MAX}글자 이내로 만들 수 있어요.
        </Text>
        <View style={styles.nameModalActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="나중에 할래요"
            onPress={() => setNameEditOpen(false)}
            style={({ pressed }) => [
              styles.nameModalSecondary,
              pressed && styles.headerIconPressed,
            ]}
          >
            <Text style={styles.nameModalSecondaryText}>나중에 할래요</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이렇게 부를게요"
            disabled={nameDraft.trim().length < 1 || nameSaving}
            onPress={() => {
              void saveNameEdit()
            }}
            style={({ pressed }) => [
              styles.nameModalPrimary,
              (nameDraft.trim().length < 1 || nameSaving) &&
                styles.nameModalPrimaryDisabled,
              pressed && styles.headerIconPressed,
            ]}
          >
            <Text style={styles.nameModalPrimaryText}>이렇게 부를게요</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <Animated.Image
        pointerEvents="none"
        source={require('../../assets/images/아이콘/사료.png')}
        style={[
          styles.bowlFly,
          {
            opacity: bowlFlyOpacity,
            transform: [
              { translateX: bowlFlyTX },
              { translateY: bowlFlyTY },
              { scale: bowlFlyScale },
            ],
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Image
        pointerEvents="none"
        source={require('../../assets/images/아이콘/공.png')}
        style={[
          styles.toyFly,
          {
            opacity: toyFlyOpacity,
            transform: [
              { translateX: toyFlyTX },
              { translateY: toyFlyTY },
              { scale: toyFlyScale },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'visible',
  },
  body: {
    flex: 1,
  },
  petBgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerLayer: {
    zIndex: 3,
    paddingHorizontal: Layout.cardPaddingH,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  nicknameRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  petTitleBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    paddingVertical: 4,
  },
  tipCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockTip: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 34,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.creamyBeige,
  },
  stockTipText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nicknameText: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  claimMenuGroup: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuRestGroup: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerLayerTour: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
  },
  headerTourMuted: {
    opacity: 0.45,
  },
  claimMenuTour: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 2,
    backgroundColor: Colors.surface,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  helpCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  helpIconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: Layout.headerPaddingH,
    borderRadius: 16,
    backgroundColor: Colors.creamyBeige,
  },
  helpIconImg: {
    width: 28,
    height: 28,
  },
  helpIconLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  helpLead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  helpItem: {
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    overflow: 'hidden',
  },
  helpItemOpen: {
    backgroundColor: Colors.surfaceSecondary,
  },
  helpItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  helpItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  helpItemBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: 14,
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
    marginBottom: 8,
    overflow: 'visible',
  },
  menuCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    zIndex: 2,
  },
  menuRingSvg: {
    position: 'absolute',
    zIndex: 3,
  },
  menuIconDimmed: {
    opacity: 0.28,
  },
  menuCooldownTimerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  menuCooldownTimer: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: Colors.cocoa,
    letterSpacing: -0.4,
    includeFontPadding: false,
  },
  menuReadyBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    zIndex: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  menuReadyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: -0.2,
  },
  menuCircleReady: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  /** 출석 완료 — 띠만 강조, 받기용 테두리와 구분 */
  menuCircleDone: {
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.background,
  },
  menuCircleCooldown: {
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: Colors.background,
  },
  menuCircleNudge: {
    borderWidth: 2,
    borderColor: Colors.selected,
    backgroundColor: Colors.background,
  },
  menuLabel: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  petLayer: {
    flex: 1,
    minHeight: 0,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.cardPaddingH,
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
  petPressablePressed: {
    opacity: 0.96,
  },
  headerIconPressed: {
    opacity: 0.88,
  },
  nameModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  nameModalLead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  nameModalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingLeft: 16,
    paddingRight: 14,
    backgroundColor: Colors.surface,
  },
  nameModalInputWrapOn: {
    borderColor: Colors.primary,
  },
  nameModalInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  nameModalCountIn: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
    fontVariant: ['tabular-nums'],
  },
  nameModalHint: {
    marginTop: 10,
    marginBottom: 22,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nameModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  nameModalSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 16,
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
    height: 52,
    borderRadius: 16,
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
  heartFxLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
  },
  heartFxItem: {
    position: 'absolute',
  },
  bowlFly: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: BOWL_FLY_SIZE,
    height: BOWL_FLY_SIZE,
    zIndex: 50,
  },
  toyFly: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: TOY_FLY_SIZE,
    height: TOY_FLY_SIZE,
    zIndex: 50,
  },
  sheet: {
    zIndex: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.surface,
    paddingHorizontal: Layout.cardPaddingH,
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
  greetingBubble: {
    zIndex: 10,
    alignSelf: 'center',
    alignItems: 'center',
    maxWidth: 280,
    marginBottom: 10,
    paddingHorizontal: Layout.cardPaddingH,
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
    ...TypeStyle.bubble,
    lineHeight: 22,
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
  energyNums: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyChevron: {
    marginLeft: 2,
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
  energyBlockPressed: {
    opacity: 0.88,
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
  sheetTour: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
  },
  energyTourMuted: {
    opacity: 0.45,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  /** Above scrim (spotlight); below CoachmarkTourCard (zIndex 40). */
  actionRowTour: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    padding: 4,
    backgroundColor: Colors.surface,
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
    paddingHorizontal: Layout.headerPaddingH,
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1,
    borderColor: 'rgba(94, 64, 51, 0.1)',
    ...Shadows.elevation,
  },
  stockCardHovered: {
    backgroundColor: Colors.creamyBeige,
  },
  stockCardTour: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  coachScrimLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  coachScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
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
    gap: 6,
  },
  stockIcon: {
    width: 32,
    height: 32,
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
