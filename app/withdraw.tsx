import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, Check, Warning } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { onboardingFooterStyle } from '../components/ui'
import { resetOnboardingCompleted } from '../lib/onboardingStorage'
import { resetOnboardingDraft } from '../lib/onboardingDraft'

const DELETE_ITEMS = [
  '대화 기록이 모두 삭제돼요',
  '마음일기가 모두 삭제돼요',
  '자가검진 결과가 모두 삭제돼요',
  '익명 식별자가 초기화돼요',
] as const

export default function WithdrawScreen() {
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)

  const withdraw = async () => {
    if (!confirmed || busy) return
    setBusy(true)
    try {
      await resetOnboardingCompleted()
      resetOnboardingDraft()
      router.replace('/withdraw-done')
    } catch {
      Alert.alert('탈퇴 실패', '잠시 후 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>계정 탈퇴</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Warning size={32} color={Colors.error} weight="regular" />
          </View>
          <Text style={styles.headline}>정말 탈퇴하시겠어요?</Text>
          <Text style={styles.sub}>
            탈퇴하시면 아래 정보가 영구 삭제됩니다.
          </Text>
        </View>

        <View style={styles.card}>
          {DELETE_ITEMS.map((item) => (
            <View key={item} style={styles.itemRow}>
              <Check size={16} color={Colors.error} weight="bold" />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
          <Text style={styles.cardWarn}>이 작업은 철회할 수 없어요.</Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          onPress={() => setConfirmed((v) => !v)}
          style={({ pressed }) => [
            styles.confirmRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxOn]}>
            {confirmed ? (
              <Check size={12} color="#FFFFFF" weight="bold" />
            ) : null}
          </View>
          <Text style={styles.confirmLabel}>위 내용을 확인했습니다</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="탈퇴하기"
          disabled={!confirmed || busy}
          onPress={() => {
            void withdraw()
          }}
          style={({ pressed }) => [
            styles.withdrawBtn,
            (!confirmed || busy) && styles.withdrawBtnDisabled,
            pressed && confirmed && !busy && styles.btnPressed,
          ]}
        >
          <Text
            style={[
              styles.withdrawBtnText,
              (!confirmed || busy) && styles.withdrawBtnTextDisabled,
            ]}
          >
            탈퇴하기
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="돌아가기"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backOutline,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.backOutlineText}>돌아가기</Text>
        </Pressable>
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
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
  },
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 20,
    ...Shadows.elevation,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  cardWarn: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: Colors.selected,
    backgroundColor: Colors.selected,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 10,
  },
  withdrawBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
  },
  withdrawBtnDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
  },
  withdrawBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  withdrawBtnTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  backOutline: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },
  backOutlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  btnPressed: {
    opacity: 0.88,
  },
})
