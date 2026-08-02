import { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../components/ui'
import { getOnboardingCopy } from '../lib/onboarding'
import { showToast } from '../lib/toast'

const restoreCopy = getOnboardingCopy().restoreCode
const RECOVERY_CODE = restoreCopy.dummyCode.replace(/\D/g, '').slice(0, 8)
const CODE_DISPLAY =
  RECOVERY_CODE.length === 8
    ? `${RECOVERY_CODE.slice(0, 4)}-${RECOVERY_CODE.slice(4)}`
    : RECOVERY_CODE

/**
 * 설정 > 내 기록 가져오기 번호
 * 세로형 안내 카드 + 복사하기 (사진첩 저장 없음)
 */
export default function RecoveryCodeScreen() {
  const [copying, setCopying] = useState(false)

  const copyCode = async () => {
    if (copying) return
    setCopying(true)
    try {
      await Clipboard.setStringAsync(RECOVERY_CODE)
      showToast('클립보드에 복사되었어요')
    } catch {
      Alert.alert('복사 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setCopying(false)
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
        <Text style={styles.description}>
          휴대폰을 바꾸거나 앱을 다시 설치할 때, 이 번호로 마음 기록을 불러올 수
          있어요.
        </Text>

        <View style={styles.cardShell}>
          <View style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <Text style={styles.brandName}>하남이네 힐링펫</Text>
              <Text style={styles.cardSub}>나의 기록 가져오기 번호</Text>
            </View>

            <View style={styles.codeBlock}>
              <Text style={styles.codeValue}>{CODE_DISPLAY}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.cardTip}>
                메모장에 적어두거나{'\n'}스크린샷으로 보관해 주세요.
              </Text>
              <Image
                source={DogExpr.soft}
                style={styles.dog}
                resizeMode="contain"
                accessibilityLabel="힐링펫 강아지"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="복사하기"
          emphasized
          disabled={copying}
          onPress={() => {
            void copyCode()
          }}
        />
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
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 12,
    paddingBottom: Layout.contentPaddingBottom,
    alignItems: 'stretch',
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 22,
  },
  cardShell: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
    aspectRatio: 0.72,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.creamyBeige,
    ...Shadows.elevation,
  },
  cardInner: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  cardHeader: {
    marginBottom: 28,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  codeBlock: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.cocoa,
    letterSpacing: 2,
  },
  cardFooter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTip: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingBottom: 8,
  },
  dog: {
    width: 120,
    height: 120,
    marginRight: -8,
    marginBottom: -4,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
