import { useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Copy, Images } from 'phosphor-react-native'
import * as Clipboard from 'expo-clipboard'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import { ScreenHeader, onboardingFooterStyle } from '../components/ui'
import { PhotoPermissionDeniedDialog } from '../components/PhotoPermissionDeniedDialog'
import { getOnboardingCopy } from '../lib/onboarding'
import { saveRecoveryCodeImage } from '../lib/saveRecoveryCodeImage'
import { showToast } from '../lib/toast'

const restoreCopy = getOnboardingCopy().restoreCode
const RECOVERY_CODE = restoreCopy.dummyCode.replace(/\D/g, '').slice(0, 8)
const CODE_DISPLAY =
  RECOVERY_CODE.length === 8
    ? `${RECOVERY_CODE.slice(0, 4)} ${RECOVERY_CODE.slice(4)}`
    : RECOVERY_CODE

export default function RecoveryCodeScreen() {
  const cardRef = useRef<View>(null)
  const [saving, setSaving] = useState(false)
  const [deniedOpen, setDeniedOpen] = useState(false)

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(RECOVERY_CODE)
      showToast('클립보드에 복사되었어요')
    } catch {
      Alert.alert('복사 실패', '잠시 후 다시 시도해 주세요.')
    }
  }

  const saveToGallery = async () => {
    if (saving) return
    setSaving(true)
    try {
      const result = await saveRecoveryCodeImage(cardRef)
      if (result === 'saved') {
        showToast('사진첩에 저장했어요')
        return
      }
      if (result === 'denied') {
        setDeniedOpen(true)
        return
      }
      if (result === 'unsupported') {
        try {
          await Clipboard.setStringAsync(RECOVERY_CODE)
        } catch {
          // ignore
        }
        showToast('웹에서는 스크린샷으로 보관해 주세요')
        return
      }
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="내 기록 가져오기 번호"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>내 기록 가져오기 번호</Text>

        <Text style={styles.description}>
          휴대폰을 변경하거나 앱을 재설치할 때, 이 번호로 기존의 소중한 마음
          기록을 안전하게 불러올 수 있어요.
        </Text>

        {/* 세로형 멤버십 카드 — 저장 캡처 영역 */}
        <View style={styles.cardShell}>
          <View ref={cardRef} collapsable={false} style={styles.cardCapture}>
            <View style={styles.cardStripe} />

            <View style={styles.cardTop}>
              <Text style={styles.brandName}>하남이네 힐링펫</Text>
              <Text style={styles.cardSub}>나의 기록 가져오기 번호</Text>
            </View>

            <View style={styles.petWell}>
              <Image
                source={DogExpr.soft}
                style={styles.dog}
                resizeMode="contain"
                accessibilityLabel="힐링펫 강아지"
              />
            </View>

            <View style={styles.codePanel}>
              <Text style={styles.codeHint}>가져오기 번호</Text>
              <Text style={styles.codeValue}>{CODE_DISPLAY}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.tip}>{restoreCopy.tip}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="복사하기"
          onPress={() => {
            void copyCode()
          }}
          style={({ pressed }) => [
            styles.copyBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <View style={styles.btnInner}>
            <Copy size={18} color={Colors.cocoa} weight="bold" />
            <Text style={styles.copyBtnText}>복사하기</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="사진첩에 저장하기"
          disabled={saving}
          onPress={() => {
            void saveToGallery()
          }}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && !saving && styles.btnPressed,
            saving && styles.saveBtnDisabled,
          ]}
        >
          <View style={styles.btnInner}>
            {saving ? (
              <ActivityIndicator
                size="small"
                color={Colors.buttonPrimaryText}
              />
            ) : (
              <Images
                size={18}
                color={Colors.buttonPrimaryText}
                weight="bold"
              />
            )}
            <Text style={styles.saveBtnText}>사진첩에 저장하기</Text>
          </View>
        </Pressable>
      </View>

      <PhotoPermissionDeniedDialog
        visible={deniedOpen}
        onClose={() => setDeniedOpen(false)}
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: Layout.contentPaddingBottom,
    alignItems: 'center',
  },
  sectionLabel: {
    alignSelf: 'stretch',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cocoa,
    marginBottom: 10,
  },
  description: {
    alignSelf: 'stretch',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  cardShell: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 0.68,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.creamyBeige,
    ...Shadows.elevation,
  },
  cardCapture: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  /** 멤버십 상단 띠 */
  cardStripe: {
    height: 10,
    marginHorizontal: -20,
    marginBottom: 22,
    backgroundColor: Colors.selected,
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.cocoa,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  petWell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  dog: {
    width: 150,
    height: 150,
  },
  codePanel: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 6,
  },
  codeHint: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDisabled,
    letterSpacing: -0.1,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: 3.5,
    textAlign: 'center',
  },
  tip: {
    alignSelf: 'stretch',
    marginTop: 16,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    ...onboardingFooterStyle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  copyBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1.5,
    borderColor: Colors.selected,
  },
  copyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  saveBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: Colors.primary,
    ...Shadows.elevation,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.buttonPrimaryText,
  },
})
