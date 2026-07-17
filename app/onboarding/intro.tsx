import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  PawPrint,
  ChatCircle,
  Notebook,
  Sun,
  Coffee,
} from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { onboardingMascot } from '../../constants/OnboardingMascot'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().intro

const SLIDES = copy.slides.map((s, i) => ({
  ...s,
  imageSrc: onboardingMascot(i, s.image),
}))

/** intro 슬라이드 + 기록 + 힐링 + 마음체크 */
const PAGER_TOTAL = SLIDES.length + 3

const SWIPE_THRESHOLD = 56

const FEATURE_ICONS = {
  paw: PawPrint,
  chat: ChatCircle,
  notebook: Notebook,
  sun: Sun,
  coffee: Coffee,
} as const

type FeatureIconKey = keyof typeof FEATURE_ICONS

export default function OnboardingIntro() {
  const [index, setIndex] = useState(0)
  const item = SLIDES[index]
  const isOverview = item.key === 'overview'
  const isChat = item.key === 'chat'
  const sway = useRef(new Animated.Value(0)).current
  const canSwipeNext = index < SLIDES.length - 1
  const canSwipePrev = index > 0

  useEffect(() => {
    if (!canSwipeNext || isOverview || isChat) {
      sway.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [canSwipeNext, sway, index, isOverview, isChat])

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)))
  }

  const goNext = () => {
    if (canSwipeNext) {
      goTo(index + 1)
      return
    }
    router.push('/onboarding/diary-record')
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -SWIPE_THRESHOLD && canSwipeNext) goTo(index + 1)
          else if (g.dx > SWIPE_THRESHOLD && canSwipePrev) goTo(index - 1)
        },
      }),
    [canSwipeNext, canSwipePrev, index],
  )

  const petX = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  })

  const features =
    'features' in item && item.features ? item.features : null

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        onBack={() => router.back()}
        onSkip={() => router.push('/onboarding/terms')}
        skipLabel={copy.skip}
      />

      {isOverview ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.overviewBody}
          showsVerticalScrollIndicator={false}
          {...panResponder.panHandlers}
        >
          <Text style={styles.overviewTitle}>{item.title}</Text>
          <Text style={styles.overviewSub}>{item.body}</Text>

          {features ? (
            <View style={styles.featureList}>
              {features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon as FeatureIconKey]
                return (
                  <View key={feature.key} style={styles.featureCard}>
                    <View style={styles.featureIcon}>
                      <Icon
                        size={20}
                        color={Colors.textSecondary}
                        weight="duotone"
                      />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureBody}>{feature.body}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : null}
        </ScrollView>
      ) : isChat ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.chatBody}
          showsVerticalScrollIndicator={false}
          {...panResponder.panHandlers}
        >
          {/* 채팅 프리뷰를 텍스트보다 먼저·크게 */}
          <View style={styles.chatStage}>
            <View style={styles.chatBubble}>
              <Text style={styles.chatBubbleText}>{item.bubble}</Text>
            </View>
            <Image
              source={item.imageSrc}
              style={styles.chatPet}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.chatTitle}>{item.title}</Text>

          {features ? (
            <View style={styles.featureList}>
              {features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon as FeatureIconKey]
                return (
                  <View key={feature.key} style={styles.featureCardCompact}>
                    <View style={styles.featureIconSm}>
                      <Icon
                        size={18}
                        color={Colors.textSecondary}
                        weight="duotone"
                      />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureBody}>{feature.body}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.mid} {...panResponder.panHandlers}>
          <View style={styles.slideInner}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{item.bubble}</Text>
            </View>

            <Animated.View style={{ transform: [{ translateX: petX }] }}>
              <Image
                source={item.imageSrc}
                style={styles.pet}
                resizeMode="contain"
              />
            </Animated.View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>

          <Text
            style={[styles.swipeHint, !canSwipeNext && styles.swipeHintHidden]}
          >
            살짝 밀어 넘겨도 돼요
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TourDots total={PAGER_TOTAL} index={index} />
        <PrimaryButton label={copy.ctaNext} onPress={goNext} />
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
  overviewBody: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  overviewTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 12,
  },
  overviewSub: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  chatBody: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  chatStage: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
    minHeight: 280,
  },
  chatBubble: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: 12,
    ...Shadows.elevation,
  },
  chatBubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  chatPet: {
    width: 168,
    height: 168,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 14,
    lineHeight: 30,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 12,
  },
  featureCardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconSm: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureBody: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  mid: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 28,
  },
  slideInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  bubble: {
    maxWidth: 220,
    minHeight: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    ...Shadows.elevation,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pet: {
    width: 148,
    height: 148,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
    lineHeight: 30,
    minHeight: 60,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 4,
    minHeight: 66,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textDisabled,
    height: 16,
    marginBottom: 4,
  },
  swipeHintHidden: {
    opacity: 0,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
