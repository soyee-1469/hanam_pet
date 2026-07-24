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
import { Images } from 'phosphor-react-native'
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
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>내 기록 가져오기 번호</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="복사하기"
            hitSlop={8}
            onPress={() => {
              void copyCode()
            }}
            style={({ pressed }) => pressed && styles.btnPressed}
          >
            <Text style={styles.copyLink}>복사하기</Text>
          </Pressable>
        </View>

        <Text style={styles.description}>
          휴대폰을 바꾸거나 앱을 다시 설치할 때, 이 번호로 마음 기록을 불러올 수
          있어요.
        </Text>

        {/* 멤버십 카드 — 단색 크림 면 + 코코아 밴드 (그라데이션 없음) */}
        <View style={styles.cardShell}>
          <View ref={cardRef} collapsable={false} style={styles.cardCapture}>
            <View style={styles.stripe}>
              <View style={styles.stripeDot} />
              <View style={[styles.stripeDot, styles.stripeDotSoft]} />
            </View>

            <View style={styles.codePlate}>
              <Text style={styles.codeCaption}>기록 번호</Text>
              <Text style={styles.codeValue}>{CODE_DISPLAY}</Text>
            </View>

            <Text style={styles.brandName}>하남이네 힐링펫</Text>
            <Text style={styles.cardSub}>나의 기록 가져오기 번호</Text>

            <View style={styles.petRow}>
              <View style={styles.petSpacer} />
              <Image
                source={DogExpr.soft}
                style={styles.dog}
                resizeMode="contain"
                accessibilityLabel="힐링펫 강아지"
              />
            </View>
          </View>
        </View>

        <Text style={styles.tip}>{restoreCopy.tip}</Text>
      </ScrollView>

      <View style={styles.footer}>
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
    alignItems: 'stretch',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.cocoa,
  },
  copyLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cocoa,
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  cardShell: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    aspectRatio: 0.68,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.creamyBeige,
    ...Shadows.elevation,
  },
  cardCapture: {
    flex: 1,
    backgroundColor: Colors.creamyBeige,
    paddingTop: 0,
    paddingHorizontal: 22,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  stripe: {
    height: 40,
    marginHorizontal: -22,
    marginBottom: 22,
    backgroundColor: Colors.selected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 18,
    gap: 8,
  },
  stripeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  stripeDotSoft: {
    backgroundColor: Colors.accentSoft,
    opacity: 0.9,
  },
  codePlate: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.sand,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    gap: 6,
  },
  codeCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  codeValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.cocoa,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  petRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  petSpacer: {
    flex: 1,
  },
  dog: {
    width: 150,
    height: 150,
    marginRight: -10,
    marginBottom: -6,
  },
  tip: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    ...onboardingFooterStyle,
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
  saveBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
