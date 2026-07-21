import { useEffect, useRef, useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { TypeStyle } from '../constants/Typography'
import { DogExpr } from '../constants/DogExpr'
import {
  PrimaryButton,
  GhostButton,
  onboardingFooterStyle,
} from '../components/ui'
import { EnergyIcon } from '../components/EnergyIcon'
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
      <View style={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.title}>마음을 담았어요</Text>
        </View>

        <View style={styles.stage}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>곁에서 항상 응원하고 있어요.</Text>
          </View>

          <Image
            source={DogExpr.fun}
            style={styles.petImage}
            resizeMode="contain"
            accessibilityLabel="펫"
          />
        </View>

        {showReward ? (
          <View style={styles.reward}>
            <View style={styles.rewardIcon}>
              <EnergyIcon size={16} />
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
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TypeStyle.hero,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  stage: {
    alignItems: 'center',
    gap: 12,
  },
  bubble: {
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  bubbleText: {
    ...TypeStyle.bubble,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  petImage: {
    width: 156,
    height: 156,
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
    fontWeight: '600',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 8,
  },
})
