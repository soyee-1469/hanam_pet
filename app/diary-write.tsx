import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { CaretDown, CaretLeft, CaretUp, Heart } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import { DIARY_MOODS, type DiaryMoodId } from '../constants/Moods'
import { DIARY_MOOD_LABEL_COLOR } from '../constants/diaryDemo'
import { TypeStyle } from '../constants/Typography'
import { findDiaryEntry } from '../lib/diaryRecords'
import { MoodEmoji } from '../components/MoodEmoji'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { showToast } from '../lib/toast'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../lib/useKeyboardAvoidInset'
import { formatDateFromYmd } from '../lib/dateFormat'

const MOTION_MS = 200
const easeOut = Easing.out(Easing.cubic)
const NOTE_MIN_H = 132
const NOTE_MAX_H = 260

const TAGS = ['업무', '건강', '수면', '운동', '취미', '관계', '가족', '기타'] as const
const TAGS_COLLAPSED = 5
const NOTE_MAX_LEN = 500

const PET_IDLE = {
  image: DogExpr.soft,
  main: '어떤 하루를 보냈어요?',
  sub: '오늘 있었던 일, 마음 편하게 적어봐요.',
}

const PET_EDIT = {
  image: DogExpr.soft,
  main: '다시 적어볼까?',
  sub: '마음에 남는 부분을 고쳐도 좋아요.',
}

const PET_BY_MOOD: Record<
  DiaryMoodId,
  { image: (typeof DogExpr)[keyof typeof DogExpr]; main: string; sub: string }
> = {
  great: {
    image: DogExpr.fun,
    main: '기쁜 하루였구나!',
    sub: '그 순간을 더 남겨볼래?',
  },
  good: {
    image: DogExpr.soft,
    main: '슬픈 마음이 있었구나…',
    sub: '천천히 적어봐도 괜찮아.',
  },
  ok: {
    image: DogExpr.tired,
    main: '화가 났던 일이 있었구나.',
    sub: '여기 앉아 있을게.',
  },
  bad: {
    image: DogExpr.soft,
    main: '걱정되는 일이 있었구나.',
    sub: '조금만 나눠줘도 좋아.',
  },
  hard: {
    image: DogExpr.tired,
    main: '불편한 마음이 있었구나.',
    sub: '편하게 적어봐.',
  },
}

export default function DiaryWriteScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const params = useLocalSearchParams<{
    id?: string
    year?: string
    month?: string
    day?: string
  }>()
  const existing = params.id ? findDiaryEntry(String(params.id)) : undefined
  const isEdit = !!existing

  const now = new Date()
  const year = existing?.year ?? (Number(params.year) || now.getFullYear())
  const month = existing?.month ?? (Number(params.month) || now.getMonth() + 1)
  const day = existing?.day ?? (Number(params.day) || now.getDate())

  const [moodId, setMoodId] = useState<DiaryMoodId | null>(
    existing?.moodId ?? null,
  )
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])
  const [note, setNote] = useState(existing?.body ?? '')
  const [noteHeight, setNoteHeight] = useState(
    existing?.body ? Math.min(NOTE_MAX_H, NOTE_MIN_H + 40) : NOTE_MIN_H,
  )
  const [saved, setSaved] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const allowLeave = useRef(false)
  const scrollRef = useRef<ScrollView>(null)
  const noteSectionY = useRef(0)
  const visibleTags = tagsExpanded ? TAGS : TAGS.slice(0, TAGS_COLLAPSED)

  const scrollNoteIntoView = useCallback(() => {
    const y = Math.max(0, noteSectionY.current - 4)
    // 키보드·KeyboardAvoidingView 레이아웃이 잡힌 뒤 스크롤
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true })
    }, 120)
  }, [])

  const { webKeyboardInset, keyboardOpen } = useKeyboardAvoidInset({
    onOpen: scrollNoteIntoView,
  })

  // 키보드 패딩이 잡힌 뒤 한 번 더 — 제목이 잘리지 않게
  useEffect(() => {
    if (!keyboardOpen) return
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, noteSectionY.current - 4),
        animated: true,
      })
    }, 200)
    return () => clearTimeout(t)
  }, [keyboardOpen])

  const petOpacity = useRef(new Animated.Value(1)).current
  const petScale = useRef(new Animated.Value(1)).current
  const wag = useRef(new Animated.Value(0)).current
  const heartY = useRef(new Animated.Value(0)).current
  const heartOpacity = useRef(new Animated.Value(0)).current
  const moodScales = useRef(
    DIARY_MOODS.reduce(
      (acc, m) => {
        acc[m.id] = new Animated.Value(
          existing?.moodId === m.id ? 1.25 : 1,
        )
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
  const skipPetAnim = useRef(isEdit)

  const pet = moodId
    ? PET_BY_MOOD[moodId]
    : isEdit
      ? PET_EDIT
      : PET_IDLE
  const dateLabel = formatDateFromYmd(year, month, day)

  const isDirty = useMemo(() => {
    if (saved) return false
    if (isEdit && existing) {
      const sameMood = moodId === existing.moodId
      const sameNote = note === existing.body
      const sameTags =
        tags.length === existing.tags.length &&
        tags.every((t) => existing.tags.includes(t))
      return !(sameMood && sameNote && sameTags)
    }
    return moodId != null || note.trim().length > 0 || tags.length > 0
  }, [saved, isEdit, existing, moodId, note, tags])

  const requestLeave = () => {
    if (!isDirty || allowLeave.current) {
      router.back()
      return
    }
    setExitOpen(true)
  }

  const confirmLeave = () => {
    allowLeave.current = true
    setExitOpen(false)
    router.back()
  }

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty || allowLeave.current || saved) return
      e.preventDefault()
      setExitOpen(true)
    })
    return unsub
  }, [navigation, isDirty, saved])

  useEffect(() => {
    if (!moodId) return
    if (skipPetAnim.current) {
      skipPetAnim.current = false
      return
    }
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
      setTimeout(() => {
        if (isEdit) {
          showToast('일기 내용을 고쳤어요')
          allowLeave.current = true
          // 토스트가 그려진 뒤 이동 (바로 back 하면 안 보이는 경우 방지)
          setTimeout(() => {
            router.back()
          }, 80)
        } else {
          allowLeave.current = true
          router.replace('/diary-done')
        }
      }, 400)
    })
  }

  const wagRotate = wag.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  })

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
            onPress={requestLeave}
            style={({ pressed }) => [
              styles.backBtn,
              { cursor: 'pointer' } as object,
              pressed && styles.pressedSoft,
            ]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.title}>{isEdit ? '마음 수정' : '마음 기록'}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            // 키보드 때 제목이 맨 위로 올라갈 스크롤 여유
            keyboardOpen && { paddingBottom: 280 },
          ]}
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
                {saved
                  ? isEdit
                    ? '잘 고쳐줬어. 고마워.'
                    : '오늘도 이야기해줘서 고마워.'
                  : pet.main}
              </Text>
              {!saved ? <Text style={styles.speechSub}>{pet.sub}</Text> : null}
            </View>
          </View>

          <Text style={styles.sectionTitle}>오늘 마음은 어땠나요?</Text>
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
                      selected && {
                        borderColor: DIARY_MOOD_LABEL_COLOR[m.id],
                      },
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
                  <Text
                    style={[
                      styles.moodLabel,
                      selected && styles.moodLabelOn,
                      selected && { color: DIARY_MOOD_LABEL_COLOR[m.id] },
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.sectionTitle}>무엇 때문에 그런 마음이 들었나요?</Text>
          <View style={styles.tagSection}>
            <View style={styles.tagRow}>
              <View style={styles.tagWrap}>
                {visibleTags.map((t) => {
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
                        <Text
                          style={[styles.tagText, selected && styles.tagTextOn]}
                          numberOfLines={1}
                        >
                          {t}
                        </Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
              {TAGS.length > TAGS_COLLAPSED ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    tagsExpanded ? '태그 접기' : '태그 더보기'
                  }
                  onPress={() => setTagsExpanded((v) => !v)}
                  style={({ pressed }) => [
                    styles.tagExpand,
                    pressed && styles.pressedSoft,
                  ]}
                >
                  {tagsExpanded ? (
                    <CaretUp
                      size={18}
                      color={Colors.textSecondary}
                      weight="bold"
                    />
                  ) : (
                    <CaretDown
                      size={18}
                      color={Colors.textSecondary}
                      weight="bold"
                    />
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>

          <View
            onLayout={(e) => {
              noteSectionY.current = e.nativeEvent.layout.y
            }}
          >
            <Text style={styles.sectionTitle}>오늘의 마음을 적어 보세요.</Text>
            <View style={styles.noteWrap}>
              <TextInput
                style={[
                  styles.note,
                  { height: Math.max(NOTE_MIN_H, noteHeight) },
                ]}
                value={note}
                onChangeText={(t) => setNote(t.slice(0, NOTE_MAX_LEN))}
                multiline
                maxLength={NOTE_MAX_LEN}
                textAlignVertical="top"
                placeholder="이 감정이나 순간을 기억하도록 무슨 일이 있었는지 편하게 기록해 보세요."
                placeholderTextColor={Colors.textDisabled}
                onFocus={scrollNoteIntoView}
                onContentSizeChange={(e) => {
                  const h = e.nativeEvent.contentSize.height
                  setNoteHeight(
                    Math.min(Math.max(NOTE_MIN_H, h + 28), NOTE_MAX_H)
                  )
                }}
              />
              <Text style={styles.noteCount}>
                {note.length}/{NOTE_MAX_LEN}자
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}
          collapsable={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isEdit ? '이대로 수정할게요' : '이대로 기록할게요'}
            disabled={!moodId || saved}
            onPress={save}
            style={({ pressed }) => [
              pressed && moodId && !saved && styles.saveBtnPressed,
              (!moodId || saved) && styles.saveBtnDisabled,
            ]}
          >
            <View style={styles.saveBtn} collapsable={false}>
              <Text style={styles.saveText}>
                {saved
                  ? isEdit
                    ? '수정되었어요'
                    : '저장되었어요'
                  : isEdit
                    ? '이대로 수정할게요'
                    : '이대로 기록할게요'}
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={exitOpen}
        tone="warning"
        title="작성 중인 일기가 있어요"
        body="지금 나가면 이제까지 적은 마음의 기록이 사라져요."
        cancelLabel="나갈래요"
        confirmLabel="계속 쓸게요"
        onCancel={confirmLeave}
        onConfirm={() => setExitOpen(false)}
        onBackdropPress={() => setExitOpen(false)}
      />
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
    paddingHorizontal: Layout.headerPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
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
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.contentPaddingBottom,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
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
    alignSelf: 'center',
    flexShrink: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  speechMain: {
    ...TypeStyle.bubble,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  speechSub: {
    ...TypeStyle.bubbleSub,
    marginTop: 4,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 2,
    paddingTop: 4,
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
  moodLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  moodLabelOn: {
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
    ...TypeStyle.sectionTitle,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  tagSection: {
    marginBottom: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tagWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    height: 36,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagOn: {
    backgroundColor: Colors.selected,
    borderColor: Colors.selected,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tagTextOn: {
    color: '#FFFFFF',
  },
  tagExpand: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteWrap: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.beige,
  },
  note: {
    width: '100%',
    minHeight: NOTE_MIN_H,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 14,
    paddingBottom: 28,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  noteCount: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: Layout.screenPaddingH,
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
