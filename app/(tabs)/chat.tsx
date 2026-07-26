import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
  type TextInput as RNTextInput,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, List, PaperPlaneTilt, X } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, HeaderTitleStyle, tabBarReserveHeight } from '../../constants/Layout'
import { TypeStyle } from '../../constants/Typography'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { ChatAiNotice } from '../../components/ChatAiNotice'
import { HelpFloatingFab } from '../../components/HelpFloatingFab'
import { ExpandableBubbleText } from '../../components/ExpandableBubbleText'
import { EojeolText } from '../../components/EojeolText'
import { ChatBubble } from '../../components/ChatBubble'
import { TabSceneGate } from '../../components/TabSceneGate'
import { EnergyIcon } from '../../components/EnergyIcon'
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
import {
  CoachScrimHole,
  type CoachHoleRect,
} from '../../components/CoachScrimHole'
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
import { TextKeyboardProps } from '../../lib/inputKeyboard'
import { formatDateTime } from '../../lib/dateFormat'

const TYPING_MS = 1800

function petReplies(name: string) {
  return [
    `누군가에게 말하기 힘들만한 상황이었겠어요. 몸도 마음도 많이 지친게 느껴져요. 잠들기 전에 5분 만이라도 ${name}랑 같이 천천히 숨을 골라볼까요?`,
    `그 마음, 충분히 무거울 수 있어요. 지금 여기 앉아 있을게. 천천히 말해도 괜찮아.`,
    `오늘 하루 버티느라 고생 많았어. ${name}가 곁에서 들어줄게.`,
  ]
}

/** 질문 줄 수에 맞춰 답변 줄 수를 맞춤 (더보기 UI 테스트용) */
function replyMatchingLines(
  userText: string,
  petName: string,
  fallbacks: string[],
  replyIndex: number,
): string {
  const lines = userText.replace(/\r\n/g, '\n').split('\n').length
  if (lines <= 1) {
    return fallbacks[replyIndex % fallbacks.length]
  }
  return Array.from({ length: lines }, (_, i) => {
    if (i === 0) return `응, ${petName}가 네 이야기 ${lines}줄 모두 들었어.`
    if (i === 1) return `천천히 말해도 괜찮아. 여기 앉아 있을게.`
    return `${i + 1}번째 줄 — 네 마음, 같이 들어줄게.`
  }).join('\n')
}

type ChatMessage = {
  id: string
  role: 'user' | 'pet'
  text: string
  at: Date
}

export default function ChatScreen() {
  return (
    <TabSceneGate>
      <ChatScreenBody />
    </TabSceneGate>
  )
}

function ChatScreenBody() {
  const insets = useSafeAreaInsets()
  const { height: windowH } = useWindowDimensions()
  const [stageH, setStageH] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const inputRef = useRef<RNTextInput>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyIndex = useRef(0)
  const [message, setMessage] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  /** multiline 빈 칸이 두 줄로 커지지 않게 — 내용 높이만 반영 */
  const [inputH, setInputH] = useState(22)
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
  const screenRootRef = useRef<View>(null)
  const composerRef = useRef<View>(null)
  const [tourHole, setTourHole] = useState<CoachHoleRect | null>(null)
  const [rootH, setRootH] = useState(0)

  useEffect(() => {
    return subscribePetTour(() => {
      setTourIndex(getPetTourStepIndex())
    })
  }, [])

  useEffect(() => {
    if (showChatTour) setNoticeDone(true)
  }, [showChatTour])

  useEffect(() => {
    if (!tourHighlightComposer) {
      setTourHole(null)
      return
    }
    let alive = true
    const measure = () => {
      const target = composerRef.current
      const root = screenRootRef.current
      if (!target || !root) return
      root.measureInWindow((cx, cy, _cw, ch) => {
        target.measureInWindow((x, y, w, h) => {
          if (!alive || w <= 0 || h <= 0) return
          if (ch > 0) setRootH(Math.round(ch))
          setTourHole({ x: x - cx, y: y - cy, w, h })
        })
      })
    }
    const t = requestAnimationFrame(measure)
    const t2 = setTimeout(measure, 80)
    const t3 = setTimeout(measure, 200)
    const t4 = setTimeout(measure, 400)
    return () => {
      alive = false
      cancelAnimationFrame(t)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [tourHighlightComposer, depleted, inputH, windowH, showChatTour])

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
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') return formatDateTime(messages[i].at)
    }
    return ''
  }, [messages])

  /** 강아지 답변 위 — 유저 질문 (전체) */
  const userMessages = useMemo(
    () => messages.filter((m) => m.role === 'user'),
    [messages],
  )
  /** 무대에는 최신 유저 말풍선 1개만 */
  const latestUserMessage = useMemo(
    () => userMessages[userMessages.length - 1] ?? null,
    [userMessages],
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

  /**
   * 무대 반반:
   * - 위 50% = 질문+답변 (질문은 상한, 답변이 나머지)
   * - 아래 50% = 캐릭터
   */
  const stampBandH = stamp ? 28 : 0
  const usableStageH = Math.max(0, stageH - stampBandH)
  const dialogueH =
    usableStageH > 0 ? Math.round(usableStageH * 0.5) : Math.round(windowH * 0.28)
  const characterH =
    usableStageH > 0 ? usableStageH - dialogueH : Math.round(windowH * 0.28)
  /** 질문 최대 — 2줄 본문 + 「더보기」가 잘리지 않게 여유 */
  const userMaxH = Math.max(88, Math.min(120, Math.round(dialogueH * 0.4)))
  const answerMaxH = Math.max(
    64,
    dialogueH - (latestUserMessage ? userMaxH : 0) - 8,
  )
  const petDisplaySize = Math.min(
    keyboardOpen ? 140 : 200,
    Math.max(96, characterH - 20),
  )

  const composerBottomPad = keyboardOpen ? 0 : tabBarSpace + 8
  const petIdleStyle = keyboardOpen ? styles.petIdleKeyboard : styles.petIdle
  const petChatStyle = {
    width: petDisplaySize,
    height: petDisplaySize,
  }
  /** 입력창 위 우측 고정 — 긴박 시 바로 누를 수 있게 키보드·타이핑 중에도 노출 */
  const showHelpFab = !depleted && !showChatTour && noticeDone

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
    setInputH(22)
    setInputFocused(false)
    inputRef.current?.blur()
    Keyboard.dismiss()
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
      const reply = replyMatchingLines(
        trimmed,
        petName,
        replies,
        replyIndex.current,
      )
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
          <EnergyIcon size={18} />
          <Text style={styles.depletedTitle}>에너지를 다 썼어요</Text>
        </View>
        <EojeolText style={styles.depletedBody}>
          {chatUsesToday >= CHAT_USE_MAX_PER_DAY
            ? '오늘은 대화를 50번 모두 나눴어요. 내일 다시 이야기해요.'
            : '사료를 주거나 놀아 주면 에너지가 다시 차올라요.'}
        </EojeolText>
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
      <View
        ref={screenRootRef}
        style={styles.flex}
        collapsable={false}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height)
          if (h > 0 && Math.abs(h - rootH) > 2) setRootH(h)
        }}
      >
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="대화 기록"
            hitSlop={8}
            onPress={() => router.push('/chat-list')}
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
          >
            <List size={24} color={Colors.textPrimary} weight="regular" />
          </Pressable>
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
                  <EojeolText style={styles.greetText}>
                    {'오늘 마음은 어떤가요?\n편하게 이야기를 들려주세요.'}
                  </EojeolText>
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
          <View
            style={styles.stageChat}
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height)
              if (h > 0 && Math.abs(h - stageH) > 2) setStageH(h)
            }}
          >
            {stamp ? <Text style={styles.stamp}>{stamp}</Text> : null}

            {/* 위 50% — 질문+답변 (질문은 상한, 답변이 나머지) */}
            <View style={[styles.dialogueBand, { height: dialogueH }]}>
              {latestUserMessage ? (
                <View style={[styles.userStack, { maxHeight: userMaxH }]}>
                  <View style={styles.userStackItem}>
                    <ChatBubble
                      variant="user"
                      style={styles.userBubbleWrap}
                    >
                      <ExpandableBubbleText
                        text={latestUserMessage.text}
                        textStyle={styles.userText}
                        align="left"
                        collapsedLines={2}
                        expandPlacement="below"
                        expandMode="popup"
                      />
                    </ChatBubble>
                  </View>
                </View>
              ) : null}

              <View style={[styles.answerBand, { maxHeight: answerMaxH }]}>
                {typing ? (
                  <View style={styles.petBubbleContainer}>
                    <ChatBubble
                      variant="pet"
                      style={styles.typingBubbleWrap}
                      contentStyle={styles.typingBubble}
                    >
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
                    </ChatBubble>
                  </View>
                ) : depleted ? (
                  depletedBubble
                ) : showComposeTip && userMessages.length === 0 ? (
                  <View style={styles.tipWrap}>
                    <View style={styles.tipBubble}>
                      <EojeolText style={styles.tipText}>
                        내가 마음을 보낼 때마다 대답 내용이 바뀌어요
                      </EojeolText>
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
                    <ChatBubble
                      variant="pet"
                      style={styles.petAnswerWrap}
                      contentStyle={styles.petAnswerBubble}
                      tailColor={Colors.cardRecessed}
                    >
                      <ExpandableBubbleText
                        text={latestPetReply.text}
                        textStyle={styles.petAnswerText}
                        align="left"
                        collapsedLines={2}
                        expandPlacement="below"
                        expandMode="popup"
                      />
                    </ChatBubble>
                  </View>
                ) : null}
              </View>
            </View>

            {/* 아래 50% — 캐릭터 고정 대역 */}
            <View style={[styles.characterBand, { height: characterH }]}>
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
          </View>
        )}

        <View
          style={[
            styles.composerWrap,
            { paddingBottom: composerBottomPad },
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
            <View
              ref={composerRef}
              collapsable={false}
              style={styles.composerMeasure}
            >
            <View
              collapsable={false}
              style={[
                styles.composer,
                inputFocused && styles.composerFocused,
                tourHighlightComposer && styles.composerTour,
                typing && styles.composerLocked,
              ]}
              pointerEvents={typing ? 'none' : 'auto'}
            >
              <TextInput
                {...TextKeyboardProps}
                ref={inputRef}
                style={[styles.input, { height: inputH }]}
                value={message}
                onChangeText={(t) => {
                  setMessage(t)
                  if (!t.trim()) setInputH(22)
                }}
                onContentSizeChange={(e) => {
                  const h = Math.ceil(e.nativeEvent.contentSize.height)
                  setInputH(Math.min(88, Math.max(22, h)))
                }}
                onFocus={() => {
                  if (typing) return
                  setInputFocused(true)
                  scrollToEnd()
                }}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  typing ? '대답을 듣고 있어요…' : '마음을 들려주세요.'
                }
                placeholderTextColor={Colors.textDisabled}
                editable={!typing && !depleted}
                multiline
                textAlignVertical="center"
                scrollEnabled
                blurOnSubmit={false}
                returnKeyType="default"
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
            </View>
          )}

          {!showChatTour ? (
            <Text style={styles.aiDisclaimer}>
              {`${petName}의 대화는 AI가 생성해요.\n전문 치료는 아니어도 포근한 마음으로 함께 할게요.`}
            </Text>
          ) : null}
        </View>

        <HelpFloatingFab
          visible={showHelpFab}
          bottom={composerBottomPad + 108}
        />
      </KeyboardAvoidingView>

      {showChatTour && tourStep ? (
        <>
          <CoachScrimHole hole={tourHole} radius={26} pad={4} />
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={
              tourHole
                ? Math.max(
                    tabBarSpace + 12,
                    (rootH || windowH) - tourHole.y + 20,
                  )
                : Math.max(insets.bottom, 12) + tabBarSpace + 72
            }
          />
        </>
      ) : null}
      </View>
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
    paddingHorizontal: Layout.headerPaddingH,
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
    paddingTop: Layout.sectionGap,
    paddingBottom: Layout.contentPaddingBottom,
  },
  stageKeyboard: {
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: Layout.sectionGap,
  },
  depletedStage: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: Layout.contentPaddingBottom,
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
    paddingBottom: Layout.blockGap,
    flexGrow: 1,
  },
  stageChat: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingH,
    minHeight: 0,
    overflow: 'hidden',
  },
  dialogueBand: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    gap: 6,
  },
  answerBand: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  characterBand: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userStackScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
    overflow: 'hidden',
  },
  userStack: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'flex-end',
    paddingLeft: '14%',
    paddingRight: 4,
  },
  userStackContent: {
    paddingBottom: 4,
    gap: 8,
    alignItems: 'flex-end',
  },
  userStackItem: {
    maxWidth: '100%',
    alignSelf: 'flex-end',
  },
  userStackItemPrev: {
    opacity: 0.55,
  },
  stamp: {
    alignSelf: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    marginBottom: 6,
    height: 22,
  },
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  userBubbleWrap: {
    maxWidth: '100%',
    alignSelf: 'flex-end',
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  petStageFixed: {
    flex: 1,
    minHeight: 180,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  petStageInner: {
    maxHeight: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  petBlock: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  petBubbleContainer: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    paddingLeft: 4,
    paddingRight: '12%',
    paddingBottom: 2,
    flexShrink: 1,
    minHeight: 0,
  },
  petAnswerWrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  petAnswerBubble: {
    backgroundColor: Colors.cardRecessed,
    borderRadius: 24,
    paddingHorizontal: Layout.screenPaddingH,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  petAnswerText: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  typingBubbleWrap: {
    alignSelf: 'flex-start',
  },
  typingBubble: {
    minWidth: 88,
    backgroundColor: Colors.surface,
    borderRadius: 24,
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
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  statusPillDepleted: {
    borderColor: Colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.selected,
    flexShrink: 0,
  },
  statusDotDepleted: {
    backgroundColor: Colors.textDisabled,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cocoa,
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
  aiDisclaimer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
    letterSpacing: -0.2,
    paddingHorizontal: 4,
  },
  depletedBubble: {
    alignSelf: 'stretch',
    backgroundColor: Colors.cardRecessed,
    borderRadius: 22,
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.sectionGapLg,
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
    paddingHorizontal: Layout.cardPaddingH,
  },
  energyInsufficientText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  composerMeasure: {
    alignSelf: 'stretch',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(94, 64, 51, 0.1)',
  },
  composerFocused: {
    borderColor: Colors.selected,
  },
  /** 투어 3단계 — 구멍·코코아 라인은 CoachScrimHole이 담당 */
  composerTour: {
    backgroundColor: Colors.surface,
  },
  composerLocked: {
    opacity: 0.72,
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxHeight: 88,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 15,
    lineHeight: 22,
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
    backgroundColor: Colors.inactive,
    borderWidth: 0,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
})
