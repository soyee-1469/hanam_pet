import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native'
import { Colors, Shadows } from '../constants/Colors'
import { TypeStyle } from '../constants/Typography'

type OnboardingTalkStageProps = {
  image: ImageSourcePropType
  bubble: string
  title: string
  body: string
  /** 합성 히어로(onboarding_1 등)일 때 더 크게 */
  heroLarge?: boolean
}

/**
 * 온보딩 공통: 상단 펫 대사 → 하단 간단 소개
 */
export function OnboardingTalkStage({
  image,
  bubble,
  title,
  body,
  heroLarge = false,
}: OnboardingTalkStageProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{bubble}</Text>
        </View>

        <Image
          source={image}
          style={heroLarge ? styles.petHero : styles.pet}
          resizeMode="contain"
        />
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  stage: {
    alignItems: 'center',
    marginBottom: 28,
  },
  bubble: {
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 2,
    ...Shadows.elevation,
  },
  bubbleText: {
    ...TypeStyle.bubble,
    color: Colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
  pet: {
    width: 160,
    height: 160,
  },
  petHero: {
    width: 280,
    height: 220,
  },
  intro: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    ...TypeStyle.modalTitle,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 10,
  },
  body: {
    ...TypeStyle.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
})
