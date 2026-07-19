import { useEffect, useRef, useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Lightning } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Fonts } from '../constants/Typography'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import {
  PrimaryButton,
  GhostButton,
  onboardingFooterStyle,
} from '../components/ui'
import {
  ENERGY_DIARY_GAIN,
  energyCreditMessage,
  tryGrantDiaryEnergy,
} from '../lib/petStock'

export default function DiaryDoneScreen() {
  const granted = useRef(false)
  const [rewardText, setRewardText] = useState(
    `에너지 +${ENERGY_DIARY_GAIN} 받았어요`,
  )
  const [showReward, setShowReward] = useState(true)

  useEffect(() => {
    if (granted.current) return
    granted.current = true
    void (async () => {
      const result = await tryGrantDiaryEnergy()
      if (result.alreadyGranted) {
        setShowReward(false)
        return
      }
      if (result.credited <= 0) {
        setRewardText(
          energyCreditMessage(result) ?? '에너지를 적립하지 못했어요',
        )
        return
      }
      if (result.credited < ENERGY_DIARY_GAIN) {
        setRewardText(
          energyCreditMessage(result) ??
            `에너지 +${result.credited}만 적립됐어요`,
        )
        return
      }
      setRewardText(`에너지 +${result.credited} 받았어요`)
    })()
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <View style={styles.body}>
        <View style={styles.hero}>
          <View style={styles.fireworksWrap} accessibilityElementsHidden>
            <Image
              source={require('../assets/images/fireworks.png')}
              style={styles.fireworks}
              resizeMode="contain"
              importantForAccessibility="no"
            />
          </View>
          <Text style={styles.title}>마음을 담았어요</Text>
          <Text style={styles.subtitle}>오늘도 잘 기록했어요</Text>
        </View>

        <View style={styles.stage}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>곁에서 항상 응원하고 있어요.</Text>
          </View>

          <View style={styles.petWash}>
            <Image
              source={DogExpr.fun}
              style={styles.petImage}
              resizeMode="contain"
              accessibilityLabel="펫"
            />
          </View>
        </View>

        {showReward ? (
          <View style={styles.reward}>
            <View style={styles.rewardIcon}>
              <Lightning size={16} color={Colors.accent} weight="fill" />
            </View>
            <Text style={styles.rewardText}>{rewardText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="마음일기로 돌아갈래요"
          emphasized
          onPress={() => router.replace('/(tabs)/diary')}
        />
        <GhostButton
          label="대화로 마음을 더 나눌게요"
          onPress={() => router.replace('/(tabs)/chat')}
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
  glowTop: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.accentSoft,
    opacity: 0.45,
  },
  glowBottom: {
    position: 'absolute',
    bottom: 120,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.creamyBeige,
    opacity: 0.9,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 28,
  },
  hero: {
    alignItems: 'center',
  },
  fireworksWrap: {
    width: 72,
    height: 84,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireworks: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: Fonts.uiBold,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: Fonts.uiMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stage: {
    alignItems: 'center',
  },
  bubble: {
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 2,
    ...Shadows.elevation,
  },
  bubbleText: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  petWash: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 148,
    height: 148,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentSoft,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
  },
  rewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 8,
  },
})
