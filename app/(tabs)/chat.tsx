import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, Lightning, PaperPlaneTilt, X } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, HeaderTitleStyle, tabBarReserveHeight } from '../../constants/Layout'
import { TypeStyle } from '../../constants/Typography'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { ChatAiNotice } from '../../components/ChatAiNotice'
import { HelpContactsBanner } from '../../components/HelpContactsBanner'
import type { PetChoice } from '../../lib/onboardingStorage'
import {
  CHAT_ENERGY_COST,
  CHAT_USE_MAX_PER_DAY,
  loadChatEnergy,
  loadChatUsesToday,
  spendChatEnergy,
} from '../../lib/chatEnergy'
import { setEnergyCareNudge } from '../../lib/careNudge'
import { getOnboardingProfile } from '../../lib/onboardingStorage'
import { getPetName } from '../../lib/petProfile'
import { CoachmarkTourCard } from '../../components/CoachmarkTourCard'
import { PET_TOUR_STEPS, petTourHref } from '../../lib/coachmarkTour'
import {
  finishPetTourWithComplete,
  getPetTourStepIndex,
  setPetTourStepIndex,
  subscribePetTour,
} from '../../lib/coachmarkTourState'
import { setCoachmarkWelcomeStatus } from '../../lib/coachmarkStorage'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../../lib/useKeyboardAvoidInset'
import { formatDateTime } from '../../lib/dateFormat'

const TYPING_MS = 1800

function petReplies(name: string) {
  return [
    `누군가에게 말하기 힘들만한 상황이었겠어요. 몸도 마음도 많이 지친게 느껴져요. 잠들기 전에 5분 만이라도 ${name}랑 같이 천천히 숨을 골라볼까요?`,
    `그 마음, 충분히 무거울 수 있어요. 지금 여기 앉아 있을게. 천천히 말해도 괜찮아.`,
    `오늘 하루 버티느라 고생 많았어. ${name}가 곁에서 들어줄게.`,
  ]
}

type ChatMessage = {
  id: string
  role: 'user' | 'pet'
  text: string
  at: Date
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyIndex = useRef(0)
  const [message, setMessage] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [noticeDone, setNoticeDone] = useState(false)
  const [tourIndex, setTourIndex] = useState<number | null>(
    getPetTourStepIndex(),
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [tipVisible, setTipVisible] = useState(true)
  const [typing, setTyping] = useState(false)
  const [dotCount, setDotCount] = useState(3)
  const [energy, setEnergy] = useState(20)
  const [chatUsesToday, setChatUsesToday] = useState(0)
  const [energyReady, setEnergyReady] = useState(false)
  const [petName, setPetName] = useState('하치')
  const [petId, setPetId] = useState<PetChoice>('mongi')
  const greetOpacity = useRef(new Animated.Value(0)).current
  const greetLift = useRef(new Animated.Value(12)).current
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const depleted =
    energyReady &&
    (energy < CHAT_ENERGY_COST || chatUsesToday >= CHAT_USE_MAX_PER_DAY)
  const canSend = message.trim().length > 0 && !typing && !depleted
  const chatting = messages.length > 0
  const composing = message.trim().length > 0
  const showComposeTip = tipVisible && composing && !typing && !depleted
  const replies = useMemo(() => petReplies(petName), [petName])
  const petImage = petId === 'nami' ? CatExpr.wink : DogExpr.wink

  const tourStep =
    tourIndex != null ? PET_TOUR_STEPS[tourIndex] : undefined
  const showChatTour = tourStep?.route === 'chat'
  const tourHighlightComposer =
    showChatTour && tourStep?.highlight === 'composer'

  useEffect(() => {
    return subscribePetTour(() => {
      setTourIndex(getPetTourStepIndex())
    })
  }, [])

  useEffect(() => {
    if (showChatTour) setNoticeDone(true)
  }, [showChatTour])

  const finishPetTour = async () => {
    finishPetTourWithComplete()
    await setCoachmarkWelcomeStatus('accepted')
    router.replace('/(tabs)')
  }

  const onPetTourNext = () => {
    if (tourIndex == null) return
    const next = tourIndex + 1
    if (next < PET_TOUR_STEPS.length) {
      const step = PET_TOUR_STEPS[next]
      setPetTourStepIndex(next)
      if (step.route !== 'chat') {
        router.push(petTourHref(step.route) as never)
      }
      return
    }
    void finishPetTour()
  }

  /** 유의사항 통과 직후 — 첫인사 페이드·살짝 올라옴 */
  useEffect(() => {
    if (!noticeDone || chatting || depleted) return
    greetOpacity.setValue(0)
    greetLift.setValue(12)
    Animated.parallel([
      Animated.timing(greetOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(greetLift, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [noticeDone, chatting, depleted, greetOpacity, greetLift])

  const stamp = useMemo(() => {
    const first = messages.find((m) => m.role === 'user')
    return first ? formatDateTime(first.at) : ''
  }, [messages])

  const userMessages = useMemo(
    () => messages.filter((m) => m.role === 'user'),
    [messages],
  )

  const latestPetReply = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'pet') return messages[i]
    }
    return null
  }, [messages])

  useFocusEffect(
    useCallback(() => {
      let alive = true
      void Promise.all([loadChatEnergy(), loadChatUsesToday()]).then(
        ([n, uses]) => {
          if (!alive) return
          setEnergy(n)
          setChatUsesToday(uses)
          setEnergyReady(true)
        },
      )
      void (async () => {
        const profile = await getOnboardingProfile()
        const id: PetChoice = profile?.petId ?? 'mongi'
        const name = await getPetName(id)
        if (!alive) return
        setPetId(id)
        setPetName(name)
      })()
      return () => {
        alive = false
      }
    }, []),
  )

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!typing) {
      setDotCount(6)
      return
    }
    const id = setInterval(() => {
      setDotCount((n) => (n >= 6 ? 2 : n + 1))
    }, 320)
    return () => clearInterval(id)
  }, [typing])

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }, [])

  /** 키보드 열림 → 펫·말풍선이 가려지지 않도록 레이아웃/스크롤 조정 */
  const { keyboardOpen, webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollToEnd,
  })

  const composerBottomPad = keyboardOpen
    ? Math.max(insets.bottom, 8)
    : tabBarSpace + 8
  const petIdleStyle = keyboardOpen ? styles.petIdleKeyboard : styles.petIdle
  const petChatStyle = keyboardOpen ? styles.petChatKeyboard : styles.petChat

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed || typing || depleted) return

    const remaining = await spendChatEnergy()
    if (remaining == null) {
      const uses = await loadChatUsesToday()
      setChatUsesToday(uses)
      setEnergy(await loadChatEnergy())
      return
    }
    setEnergy(remaining)
    setChatUsesToday((u) => Math.min(CHAT_USE_MAX_PER_DAY, u + 1))

    const next: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      at: new Date(),
    }
    setMessages((prev) => [...prev, next])
    setMessage('')
    scrollToEnd()

    // 이번 질문으로 소진 → 답변 없이 에너지 안내
    if (remaining < CHAT_ENERGY_COST) {
      setTyping(false)
      scrollToEnd()
      return
    }

    setTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      const reply = replies[replyIndex.current % replies.length]
      replyIndex.current += 1
      setMessages((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          role: 'pet',
          text: reply,
          at: new Date(),
        },
      ])
      setTyping(false)
      scrollToEnd()
    }, TYPING_MS)
  }

  const goRefillEnergy = () => {
    void (async () => {
      await setEnergyCareNudge()
      router.replace('/(tabs)')
    })()
  }

  const depletedBubble = (
    <View style={styles.petBubbleContainer}>
      <View style={styles.depletedBubble}>
        <View style={styles.depletedTitleRow}>
          <Lightning size={18} color={Colors.accent} weight="fill" />
          <Text style={styles.depletedTitle}>에너지를 다 썼어요</Text>
        </View>
        <Text style={styles.depletedBody}>
          {chatUsesToday >= CHAT_USE_MAX_PER_DAY
            ? '오늘은 대화를 50번 모두 나눴어요. 내일 다시 이야기해요.'
            : '사료를 주거나 놀아 주면 에너지가 다시 차올라요.'}
        </Text>
        {chatUsesToday < CHAT_USE_MAX_PER_DAY ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="에너지 채우기"
            onPress={goRefillEnergy}
            style={({ pressed }) => [
              styles.depletedCta,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.depletedCtaText}>에너지 채우기</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.depletedTail} />
    </View>
  )

  if (!noticeDone) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChatAiNotice
          bottomInset={tabBarSpace}
          petName={petName}
          onBack={() => router.replace('/(tabs)')}
          onConfirm={() => setNoticeDone(true)}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={[
          styles.flex,
          Platform.OS === 'web' &&
            webKeyboardInset > 0 && { paddingBottom: webKeyboardInset },
        ]}
        behavior={keyboardAvoidingBehavior()}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.title}>대화</Text>
          <View style={styles.sideBtn} />
        </View>

        {!chatting && !depleted ? (
          <Animated.View
            style={[
              styles.flex,
              {
                opacity: greetOpacity,
                transform: [{ translateY: greetLift }],
              },
            ]}
          >
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[
                styles.stage,
                keyboardOpen && styles.stageKeyboard,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.greetWrap}>
                <View style={styles.greetBubble}>
                  <Text style={styles.greetText}>
                    {'오늘 마음은 어떤가요?\n편하게 이야기를 들려주세요.'}
                  </Text>
                </View>
                <View style={styles.greetTail} />
              </View>
              <Image
                source={petImage}
                style={petIdleStyle}
                resizeMode="contain"
                accessibilityLabel={petName}
              />
            </ScrollView>
          </Animated.View>
        ) : !chatting && depleted ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.depletedStage,
              keyboardOpen && styles.stageKeyboard,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.stamp}>{formatDateTime(new Date())}</Text>
            {depletedBubble}
            <Image
              source={petImage}
              style={petIdleStyle}
              resizeMode="contain"
              accessibilityLabel={petName}
            />
            <View style={[styles.statusPill, styles.statusPillDepleted]}>
              <View style={[styles.statusDot, styles.statusDotDepleted]} />
              <Text
                style={[styles.statusText, styles.statusTextDepleted]}
                numberOfLines={1}
              >
                {petName} 에너지 소진
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <Text style={styles.stamp}>{stamp}</Text>

            {userMessages.map((m) => (
              <View key={m.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{m.text}</Text>
                </View>
              </View>
            ))}

            <View style={styles.petBlock}>
              {typing ? (
                <View style={styles.petBubbleContainer}>
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDotsRow}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.typingDot,
                            i >= dotCount && styles.typingDotDim,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.petBubbleTail} />
                </View>
              ) : depleted ? (
                depletedBubble
              ) : showComposeTip ? (
                <View style={styles.tipWrap}>
                  <View style={styles.tipBubble}>
                    <Text style={styles.tipText}>
                      내가 마음을 보낼 때마다 대답 내용이 바뀌어요
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="안내 닫기"
                      hitSlop={8}
                      onPress={() => setTipVisible(false)}
                      style={styles.tipClose}
                    >
                      <X size={14} color={Colors.surface} weight="bold" />
                    </Pressable>
                  </View>
                  <View style={styles.tipTail} />
                </View>
              ) : latestPetReply ? (
                <View style={styles.petBubbleContainer}>
                  <View style={styles.petAnswerBubble}>
                    <Text style={styles.petAnswerText}>
                      {latestPetReply.text}
                    </Text>
                  </View>
                  <View style={styles.petBubbleTail} />
                </View>
              ) : null}

              <Image
                source={petImage}
                style={petChatStyle}
                resizeMode="contain"
                accessibilityLabel={petName}
              />

              {depleted ? (
                <View style={[styles.statusPill, styles.statusPillDepleted]}>
                  <View style={[styles.statusDot, styles.statusDotDepleted]} />
                  <Text
                    style={[styles.statusText, styles.statusTextDepleted]}
                    numberOfLines={1}
                  >
                    {petName} 에너지 소진
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}

        <View
          style={[
            styles.composerWrap,
            { paddingBottom: composerBottomPad },
            tourHighlightComposer && styles.composerWrapTour,
          ]}
        >
          {depleted ? (
            <View style={styles.energyInsufficient}>
              <Text style={styles.energyInsufficientText}>
                {chatUsesToday >= CHAT_USE_MAX_PER_DAY
                  ? '오늘 대화 횟수를 모두 사용했어요'
                  : '에너지가 부족해요'}
              </Text>
            </View>
          ) : (
            <>
              {chatting && !keyboardOpen ? <HelpContactsBanner /> : null}

              <View
                style={[
                  styles.composer,
                  inputFocused && styles.composerFocused,
                  tourHighlightComposer && styles.composerTour,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => {
                    setInputFocused(true)
                    scrollToEnd()
                  }}
                  onBlur={() => setInputFocused(false)}
                  placeholder="마음을 들려주세요."
                  placeholderTextColor={Colors.textDisabled}
                  editable={!typing}
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    void sendMessage()
                  }}
                  blurOnSubmit={false}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="보내기"
                  disabled={!canSend}
                  onPress={() => {
                    void sendMessage()
                  }}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    canSend && styles.sendBtnActive,
                    pressed && canSend && styles.pressed,
                  ]}
                >
                  <PaperPlaneTilt
                    size={16}
                    color={Colors.buttonPrimaryText}
                    weight="fill"
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {showChatTour && tourStep ? (
        <View style={styles.coachOverlay} pointerEvents="box-none">
          <View style={styles.coachScrim} />
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={Math.max(insets.bottom, 12) + 80}
          />
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    ...HeaderTitleStyle.screen,
  },
  stage: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 12,
    paddingBottom: 24,
  },
  stageKeyboard: {
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: 12,
  },
  depletedStage: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: 24,
  },
  greetWrap: {
    alignItems: 'center',
    marginBottom: 4,
    maxWidth: 280,
  },
  greetBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetTail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  greetText: {
    ...TypeStyle.bubble,
    lineHeight: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  petIdle: {
    width: 240,
    height: 240,
  },
  petIdleKeyboard: {
    width: 160,
    height: 160,
  },
  chatContent: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
    flexGrow: 1,
  },
  stamp: {
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    marginBottom: 16,
  },
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: Colors.accentSoft,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  petBlock: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 8,
  },
  petBubbleContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  petAnswerBubble: {
    alignSelf: 'stretch',
    backgroundColor: Colors.cardRecessed,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  petAnswerText: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  petBubbleTail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.cardRecessed,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  typingBubble: {
    minWidth: 88,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textPrimary,
  },
  typingDotDim: {
    opacity: 0.22,
  },
  tipWrap: {
    alignItems: 'center',
    maxWidth: 260,
    marginBottom: 8,
  },
  tipBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Colors.surface,
  },
  tipClose: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.textPrimary,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
  },
  petChat: {
    width: 200,
    height: 200,
  },
  petChatKeyboard: {
    width: 140,
    height: 140,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    maxWidth: '92%',
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    ...Shadows.elevation,
  },
  statusPillDepleted: {
    borderColor: Colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  statusDotDepleted: {
    backgroundColor: Colors.textDisabled,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    flexShrink: 1,
  },
  statusTextDepleted: {
    color: Colors.textSecondary,
  },
  composerWrap: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    backgroundColor: Colors.background,
    gap: 10,
  },
  composerWrapTour: {
    zIndex: 30,
  },
  coachOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 28,
  },
  coachScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  depletedBubble: {
    alignSelf: 'stretch',
    backgroundColor: Colors.cardRecessed,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 12,
    ...Shadows.elevation,
  },
  depletedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  depletedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  depletedBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  depletedCta: {
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  depletedCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.buttonPrimaryText,
  },
  depletedTail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.cardRecessed,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  energyInsufficient: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  energyInsufficientText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(94, 64, 51, 0.1)',
  },
  composerFocused: {
    borderColor: Colors.selected,
  },
  composerTour: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textPrimary,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.beige,
    borderWidth: 0,
    overflow: 'hidden',
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
})
