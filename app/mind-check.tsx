import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  BackHandler,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { CaretLeft, Check, Warning } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { getAssessment } from '../constants/MindAssessments'
import { showToast } from '../lib/toast'

export default function MindCheckScreen() {
  const navigation = useNavigation()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const assessmentId = typeof id === 'string' ? id : id?.[0]
  const assessment = getAssessment(assessmentId)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [exitOpen, setExitOpen] = useState(false)
  const allowLeaveRef = useRef(false)

  useEffect(() => {
    if (!assessment) return
    setIndex(0)
    setAnswers(assessment.questions.map(() => null))
    allowLeaveRef.current = false
  }, [assessment?.id])

  const hasProgress = index > 0 || answers.some((a) => a != null)

  const requestLeave = useCallback(() => {
    if (!hasProgress || allowLeaveRef.current) {
      allowLeaveRef.current = true
      router.back()
      return
    }
    setExitOpen(true)
  }, [hasProgress])

  const confirmLeave = () => {
    allowLeaveRef.current = true
    setExitOpen(false)
    router.back()
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (exitOpen) {
        setExitOpen(false)
        return true
      }
      if (hasProgress && !allowLeaveRef.current) {
        setExitOpen(true)
        return true
      }
      return false
    })
    return () => sub.remove()
  }, [exitOpen, hasProgress])

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current || !hasProgress) return
      e.preventDefault()
      setExitOpen(true)
    })
    return unsub
  }, [navigation, hasProgress])

  if (!assessment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.exploreTitle}>평가도구</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>검사를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const total = assessment.questions.length
  const ready = answers.length === total
  const current = ready ? answers[index] : null
  const progress = (index + 1) / total
  const canNext = current != null
  const isLast = index >= total - 1

  const setAnswer = (value: number) => {
    setAnswers((prev) => {
      const next =
        prev.length === total
          ? [...prev]
          : assessment.questions.map(() => null as number | null)
      next[index] = value
      return next
    })
  }

  const goPrev = () => {
    if (index <= 0) {
      requestLeave()
      return
    }
    setIndex((i) => i - 1)
  }

  const goNext = () => {
    if (!canNext || !ready) {
      showToast('보기 중 하나를 선택해 주세요.')
      return
    }
    if (isLast) {
      allowLeaveRef.current = true
      const finalAnswers = [...answers]
      if (current != null) finalAnswers[index] = current
      const score = finalAnswers.reduce<number>((sum, v) => sum + (v ?? 0), 0)
      const max = total * 3
      router.push({
        pathname: '/mind-check-result',
        params: {
          id: assessment.id,
          score: String(score),
          max: String(max),
          fresh: '1',
        },
      })
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={requestLeave}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.toolLabel} numberOfLines={1}>
              {assessment.title}
            </Text>
            <Text style={styles.exploreTitle} numberOfLines={1}>
              {assessment.exploreTitle}
            </Text>
          </View>
          <Text style={styles.counter}>
            {index + 1} / {total}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.instruction}>{assessment.instruction}</Text>
        <Text style={styles.question}>{assessment.questions[index]}</Text>

        <View style={styles.options}>
          {assessment.options.map((opt) => {
            const on = current === opt.value
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setAnswer(opt.value)}
                style={({ pressed }) => [
                  styles.option,
                  on && styles.optionOn,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on ? (
                    <Check size={12} color="#FFFFFF" weight="bold" />
                  ) : null}
                </View>
                <Text style={[styles.optionText, on && styles.optionTextOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전"
          onPress={goPrev}
          style={({ pressed }) => [styles.prevBtn, pressed && styles.pressed]}
        >
          <Text style={styles.prevText}>이전</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? '결과 보기' : '다음'}
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextBtn,
            !canNext && styles.nextBtnDisabled,
            pressed && canNext && styles.nextPressed,
          ]}
        >
          <Text style={[styles.nextText, !canNext && styles.nextTextDisabled]}>
            {isLast ? '결과 보기' : '다음'}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={exitOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setExitOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalDismiss}
            onPress={() => setExitOpen(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Warning size={28} color={Colors.accent} weight="regular" />
            </View>
            <Text style={styles.modalTitle}>검사가 아직 안 끝났어요!</Text>
            <Text style={styles.modalBody}>
              지금 나가면 진행한 응답이 초기화돼요.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="나가기"
                onPress={confirmLeave}
                style={({ pressed }) => [
                  styles.modalLeave,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalLeaveText}>나가기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="계속하기"
                onPress={() => setExitOpen(false)}
                style={({ pressed }) => [
                  styles.modalStay,
                  pressed && styles.nextPressed,
                ]}
              >
                <Text style={styles.modalStayText}>계속하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  top: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: 12,
    minHeight: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 2,
    marginRight: 8,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
    marginBottom: 2,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  counter: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    minWidth: 48,
    textAlign: 'right',
    marginRight: 4,
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  progressTrack: {
    marginHorizontal: Layout.screenPaddingH,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 28,
    paddingBottom: 20,
  },
  instruction: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  question: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 28,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionOn: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF3EE',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.taupe,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  radioOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTextOn: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 12,
    paddingBottom: 16,
  },
  prevBtn: {
    width: 100,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamyBeige,
  },
  prevText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nextBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
  },
  nextPressed: {
    opacity: 0.92,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(91, 57, 39, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalDismiss: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    ...Shadows.elevation,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  modalLeave: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalLeaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalStay: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  modalStayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
