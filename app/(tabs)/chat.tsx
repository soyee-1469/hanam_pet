import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { CaretLeft, CaretRight, CaretUp, Handshake, List, PaperPlaneTilt, X } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { ChatAiNotice } from '../../components/ChatAiNotice'
import {
  CHAT_ENERGY_COST,
  loadChatEnergy,
  spendChatEnergy,
} from '../../lib/chatEnergy'
import { setEnergyCareNudge } from '../../lib/careNudge'
import { getOnboardingProfile } from '../../lib/onboardingStorage'
import { getPetName } from '../../lib/petProfile'

const TYPING_MS = 1800
const DEPLETED_BUBBLE =
  '에너지가 다 떨어졌어… 조금 채워오면 다시 이야기할 수 있어.'

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

function formatStamp(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${y}-${m}-${day} ${period} ${hour12}:${min}`
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyIndex = useRef(0)
  const [message, setMessage] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [noticeDone, setNoticeDone] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [tipVisible, setTipVisible] = useState(true)
  const [typing, setTyping] = useState(false)
  const [dotCount, setDotCount] = useState(3)
  const [energy, setEnergy] = useState(20)
  const [energyReady, setEnergyReady] = useState(false)
  const [petName, setPetName] = useState('몽이')
  const greetOpacity = useRef(new Animated.Value(0)).current
  const greetLift = useRef(new Animated.Value(12)).current
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const depleted = energyReady && energy < CHAT_ENERGY_COST
  const canSend = message.trim().length > 0 && !typing && !depleted
  const chatting = messages.length > 0
  const composing = message.trim().length > 0
  const showComposeTip = tipVisible && composing && !typing && !depleted
  const replies = useMemo(() => petReplies(petName), [petName])

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
    return first ? formatStamp(first.at) : ''
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
      void loadChatEnergy().then((n) => {
        if (!alive) return
        setEnergy(n)
        setEnergyReady(true)
      })
      void (async () => {
        const profile = await getOnboardingProfile()
        const name = await getPetName(profile?.petId ?? 'mongi')
        if (!alive) return
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

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed || typing || depleted) return

    const remaining = await spendChatEnergy()
    if (remaining == null) {
      setEnergy(0)
      return
    }
    setEnergy(remaining)

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

  const openMenu = () => {
    Alert.alert('대화', undefined, [
      { text: '닫기', style: 'cancel' },
      {
        text: '도움 받기',
        onPress: () => router.push('/chat-help'),
      },
    ])
  }

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
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
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
          {chatting || depleted ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="메뉴"
              hitSlop={8}
              onPress={openMenu}
              style={({ pressed }) => [
                styles.sideBtn,
                pressed && styles.pressed,
              ]}
            >
              <List size={22} color={Colors.textPrimary} weight="regular" />
            </Pressable>
          ) : (
            <View style={styles.sideBtn} />
          )}
        </View>

        {!chatting && !depleted ? (
          <Animated.View
            style={[
              styles.stage,
              {
                opacity: greetOpacity,
                transform: [{ translateY: greetLift }],
              },
            ]}
          >
            <View style={styles.greetWrap}>
              <View style={styles.greetBubble}>
                <Text style={styles.greetMain}>오늘 마음은 어떤가요?</Text>
                <Text style={styles.greetSub}>
                  {petName}에게 편하게 이야기를 들려주세요.
                </Text>
              </View>
              <View style={styles.greetTail} />
            </View>
            <Image
              source={DogExpr.soft}
              style={styles.petIdle}
              resizeMode="contain"
              accessibilityLabel={petName}
            />
          </Animated.View>
        ) : !chatting && depleted ? (
          <View style={styles.stage}>
            <View style={styles.petBubbleContainer}>
              <View style={styles.petAnswerBubble}>
                <Text style={styles.petAnswerText}>{DEPLETED_BUBBLE}</Text>
              </View>
              <View style={styles.petBubbleTail} />
            </View>
            <Image
              source={DogExpr.soft}
              style={styles.petIdle}
              resizeMode="contain"
              accessibilityLabel={petName}
            />
            <View style={[styles.statusPill, styles.statusPillDepleted]}>
              <View style={[styles.statusDot, styles.statusDotDepleted]} />
              <Text style={styles.statusText}>{petName} 에너지 소진</Text>
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    <Text style={styles.typingDots}>
                      {'.'.repeat(dotCount)}
                    </Text>
                  </View>
                  <View style={styles.petBubbleTail} />
                </View>
              ) : depleted ? (
                <View style={styles.petBubbleContainer}>
                  <View style={styles.petAnswerBubble}>
                    <Text style={styles.petAnswerText}>{DEPLETED_BUBBLE}</Text>
                  </View>
                  <View style={styles.petBubbleTail} />
                </View>
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
                source={DogExpr.soft}
                style={styles.petChat}
                resizeMode="contain"
                accessibilityLabel={petName}
              />

              <View
                style={[
                  styles.statusPill,
                  depleted && styles.statusPillDepleted,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    depleted && styles.statusDotDepleted,
                  ]}
                />
                <Text style={styles.statusText}>
                  {depleted
                    ? `${petName} 에너지 소진`
                    : `${petName} 실시간 공감 중`}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={[styles.composerWrap, { paddingBottom: tabBarSpace + 8 }]}>
          {depleted ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="몽이와 놀아주기"
              onPress={() => {
                void (async () => {
                  await setEnergyCareNudge()
                  router.replace('/(tabs)')
                })()
              }}
              style={({ pressed }) => [
                styles.energyBar,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.energyBarLabel}>
                {petName}가 잠시 쉬고 싶대요
              </Text>
              <View style={styles.energyBarCta}>
                <Text style={styles.energyBarCtaText}>몽이와 놀아주기</Text>
                <CaretRight size={16} color={Colors.primary} weight="bold" />
              </View>
            </Pressable>
          ) : (
            <>
              {chatting ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="도움 받을 곳 보기"
                  onPress={() => router.push('/chat-help')}
                  style={({ pressed }) => [
                    styles.helpCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.helpIcon}>
                    <Handshake
                      size={20}
                      color={Colors.textPrimary}
                      weight="regular"
                    />
                  </View>
                  <View style={styles.helpCopy}>
                    <Text style={styles.helpTitle}>
                      혼자 견디지 않아도 괜찮아요
                    </Text>
                    <Text style={styles.helpSub}>
                      도움 받을 곳을 알려 드릴게요
                    </Text>
                  </View>
                  <CaretUp
                    size={16}
                    color={Colors.textDisabled}
                    weight="bold"
                  />
                </Pressable>
              ) : null}

              <View
                style={[
                  styles.composer,
                  inputFocused && styles.composerFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setInputFocused(true)}
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 36,
    paddingBottom: 12,
  },
  greetWrap: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
    maxWidth: 300,
  },
  greetBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  greetTail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  greetMain: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  greetSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  petIdle: {
    width: 220,
    height: 220,
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
    backgroundColor: Colors.creamyBeige,
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
    marginTop: 12,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  petAnswerText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  petBubbleTail: {
    width: 14,
    height: 14,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  typingBubble: {
    minWidth: 72,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
  },
  typingDots: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  tipWrap: {
    alignItems: 'center',
    maxWidth: 280,
    marginBottom: 4,
  },
  tipBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 10,
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
    width: 160,
    height: 160,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
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
  },
  statusDotDepleted: {
    backgroundColor: Colors.textDisabled,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  composerWrap: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    backgroundColor: Colors.background,
    gap: 10,
  },
  energyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Colors.surfaceSecondary,
  },
  energyBarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  energyBarCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  energyBarCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCopy: {
    flex: 1,
    gap: 2,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  helpSub: {
    fontSize: 12,
    fontWeight: '500',
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
