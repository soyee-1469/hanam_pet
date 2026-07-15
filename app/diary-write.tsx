import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CaretLeft, Heart } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { DIARY_MOODS, type DiaryMoodId } from '../constants/Moods'
import { MoodEmoji } from '../components/MoodEmoji'

const MOTION_MS = 200
const easeOut = Easing.out(Easing.cubic)
const NOTE_MIN_H = 132
const NOTE_MAX_H = 260

const TAGS = ['업무', '관계', '건강', '수면', '애정'] as const
const WEEKDAY_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const PET_IDLE = {
  image: require('../assets/images/dog-character_3.png'),
  main: '오늘 감정을 눌러줘.',
  sub: '천천히 골라도 괜찮아.',
}

const PET_BY_MOOD: Record<
  DiaryMoodId,
  { image: number; main: string; sub: string }
> = {
  great: {
    image: require('../assets/images/dog-character_3.png'),
    main: '와, 그렇게 좋았구나!',
    sub: '그 기분 더 들려줄래?',
  },
  good: {
    image: require('../assets/images/dog-character_3.png'),
    main: '좋은 하루였구나.',
    sub: '웃는 네 모습, 나도 기뻐.',
  },
  ok: {
    image: require('../assets/images/dog-character_2.png'),
    main: '잔잔한 하루였구나.',
    sub: '그냥 있어도 괜찮아.',
  },
  bad: {
    image: require('../assets/images/dog-character.png'),
    main: '조금 힘들었구나…',
    sub: '천천히 말해도 괜찮아.',
  },
  hard: {
    image: require('../assets/images/dog-character.png'),
    main: '많이 걱정됐구나.',
    sub: '여기 앉아 있을게. 혼자가 아니야.',
  },
}

export default function DiaryWriteScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ year?: string; month?: string; day?: string }>()
  const now = new Date()
  const year = Number(params.year) || now.getFullYear()
  const month = Number(params.month) || now.getMonth() + 1
  const day = Number(params.day) || now.getDate()
  const date = useMemo(() => new Date(year, month - 1, day), [year, month, day])

  const [moodId, setMoodId] = useState<DiaryMoodId | null>(null)
  const [tags, setTags] = useState<string[]>(['업무'])
  const [note, setNote] = useState('')
  const [noteHeight, setNoteHeight] = useState(NOTE_MIN_H)
  const [saved, setSaved] = useState(false)

  const petOpacity = useRef(new Animated.Value(1)).current
  const petScale = useRef(new Animated.Value(1)).current
  const wag = useRef(new Animated.Value(0)).current
  const heartY = useRef(new Animated.Value(0)).current
  const heartOpacity = useRef(new Animated.Value(0)).current
  const moodScales = useRef(
    DIARY_MOODS.reduce(
      (acc, m) => {
        acc[m.id] = new Animated.Value(1)
        return acc
      },
      {} as Record<DiaryMoodId, Animated.Value>
    )
  ).current
  const moodLifts = useRef(
    DIARY_MOODS.reduce(
      (acc, m) => {
        acc[m.id] = new Animated.Value(0)
        return acc
      },
      {} as Record<DiaryMoodId, Animated.Value>
    )
  ).current

  const pet = moodId ? PET_BY_MOOD[moodId] : PET_IDLE
  const dateLabel = `${year}년 ${month}월 ${day}일 ${WEEKDAY_KO[date.getDay()]}`

  useEffect(() => {
    if (!moodId) return
    petOpacity.setValue(0.35)
    petScale.setValue(0.92)
    Animated.parallel([
      Animated.timing(petOpacity, {
        toValue: 1,
        duration: MOTION_MS,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.spring(petScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start()
  }, [moodId, petOpacity, petScale])

  const selectMood = (id: DiaryMoodId) => {
    setMoodId(id)
    DIARY_MOODS.forEach((m) => {
      const selected = m.id === id
      if (selected) {
        moodLifts[m.id].setValue(0)
        Animated.parallel([
          Animated.spring(moodScales[m.id], {
            toValue: 1.25,
            friction: 5,
            tension: 220,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(moodLifts[m.id], {
              toValue: -10,
              duration: 140,
              easing: easeOut,
              useNativeDriver: true,
            }),
            Animated.spring(moodLifts[m.id], {
              toValue: 0,
              friction: 4,
              tension: 180,
              useNativeDriver: true,
            }),
          ]),
        ]).start()
      } else {
        Animated.parallel([
          Animated.timing(moodScales[m.id], {
            toValue: 1,
            duration: MOTION_MS,
            easing: easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(moodLifts[m.id], {
            toValue: 0,
            duration: MOTION_MS,
            easing: easeOut,
            useNativeDriver: true,
          }),
        ]).start()
      }
    })
  }

  const toggleTag = (t: string) => {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )
  }

  const save = () => {
    if (!moodId || saved) return
    setSaved(true)
    wag.setValue(0)
    heartY.setValue(0)
    heartOpacity.setValue(0)

    Animated.parallel([
      Animated.sequence([
        Animated.timing(wag, {
          toValue: 1,
          duration: 120,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(wag, {
          toValue: -1,
          duration: 120,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(wag, {
          toValue: 0.6,
          duration: 100,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(wag, {
          toValue: 0,
          duration: 100,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: MOTION_MS,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.timing(heartY, {
          toValue: -28,
          duration: 500,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => router.back(), 900)
    })
  }

  const wagRotate = wag.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { cursor: 'pointer' } as object,
              pressed && styles.pressedSoft,
            ]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.title}>감정 기록</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dateText}>{dateLabel}</Text>

          <View style={styles.petAsk}>
            <View style={styles.petStage}>
              <Animated.View
                style={{
                  opacity: petOpacity,
                  transform: [{ scale: petScale }, { rotate: wagRotate }],
                }}
              >
                <Image source={pet.image} style={styles.petImage} resizeMode="contain" />
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heartWrap,
                  { opacity: heartOpacity, transform: [{ translateY: heartY }] },
                ]}
              >
                <Heart size={18} color={Colors.primary} weight="fill" />
              </Animated.View>
            </View>
            <View style={styles.speech}>
              <Text style={styles.speechMain}>
                {saved ? '오늘도 이야기해줘서 고마워.' : pet.main}
              </Text>
              {!saved ? <Text style={styles.speechSub}>{pet.sub}</Text> : null}
            </View>
          </View>

          <View style={styles.moodRow}>
            {DIARY_MOODS.map((m) => {
              const selected = moodId === m.id
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="button"
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => selectMood(m.id)}
                  style={({ pressed }) => [
                    styles.moodItem,
                    pressed && styles.pressedSoft,
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.moodCircle,
                      selected && styles.moodCircleOn,
                      {
                        transform: [
                          { translateY: moodLifts[m.id] },
                          { scale: moodScales[m.id] },
                        ],
                      },
                    ]}
                  >
                    <MoodEmoji index={m.emojiIndex} size={40} />
                  </Animated.View>
                  <Text style={[styles.moodLabel, selected && styles.moodLabelOn]}>
                    {m.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>무슨 일이 있었나요?</Text>
            <Text style={styles.sectionHint}>(중복 선택 가능)</Text>
          </View>
          <View style={styles.tagWrap}>
            {TAGS.map((t) => {
              const selected = tags.includes(t)
              return (
                <Pressable
                  key={t}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  android_ripple={{ color: 'transparent' }}
                  onPress={() => toggleTag(t)}
                  style={({ pressed }) => [pressed && styles.pressedSoft]}
                >
                  <View
                    style={[styles.tag, selected && styles.tagOn]}
                    collapsable={false}
                  >
                    <Text style={[styles.tagText, selected && styles.tagTextOn]}>
                      {t}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </View>

          <TextInput
            style={[
              styles.note,
              { height: Math.max(NOTE_MIN_H, noteHeight) },
            ]}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            placeholder={
              '오늘 있었던 일을 편하게 적어보세요.\n한 줄만 적어도 몽이는 전부 다 들어줄게요.'
            }
            placeholderTextColor={Colors.textDisabled}
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height
              setNoteHeight(
                Math.min(Math.max(NOTE_MIN_H, h + 28), NOTE_MAX_H)
              )
            }}
          />
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}
          collapsable={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="기록 저장하기"
            disabled={!moodId || saved}
            onPress={save}
            style={({ pressed }) => [
              pressed && moodId && !saved && styles.saveBtnPressed,
              (!moodId || saved) && styles.saveBtnDisabled,
            ]}
          >
            <View style={styles.saveBtn} collapsable={false}>
              <Text style={styles.saveText}>
                {saved ? '저장되었어요' : '기록 저장하기'}
              </Text>
            </View>
          </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pressedSoft: {
    opacity: 0.88,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  petAsk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  petStage: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 72,
    height: 72,
  },
  heartWrap: {
    position: 'absolute',
    top: 4,
    right: 0,
  },
  speech: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  speechMain: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  speechSub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 2,
    paddingTop: 12,
    overflow: 'visible',
  },
  moodItem: {
    alignItems: 'center',
    width: 62,
    overflow: 'visible',
  },
  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  moodCircleOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  moodLabelOn: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagTextOn: {
    color: Colors.buttonPrimaryText,
  },
  note: {
    width: '100%',
    minHeight: NOTE_MIN_H,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    height: 54,
    width: '100%',
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.elevation,
  },
  saveBtnPressed: {
    opacity: 0.92,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
})
