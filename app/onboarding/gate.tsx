import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { PrimaryButton, SecondaryButton } from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'
import { nextGateMascot } from '../../constants/OnboardingMascot'
import { useDesignWindow } from '../../components/AppViewport'

const copy = getOnboardingCopy().gate
const RADIUS = 16

const goResume = () => router.push('/onboarding/resume')

export default function OnboardingGate() {
  const { height: screenH } = useDesignWindow()
  /** 캐릭터 존재감 ↑ — 화면 대비 커버를 조금 더 크게 */
  const coverSize = Math.min(240, Math.round(screenH * 0.28))
  const coverSource = useRef(nextGateMascot('fun')).current

  const breath = useRef(new Animated.Value(0)).current
  const bubbleFloat = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleFloat, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleFloat, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    breathLoop.start()
    floatLoop.start()
    return () => {
      breathLoop.stop()
      floatLoop.stop()
    }
  }, [breath, bubbleFloat])

  const coverScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  })
  const bubbleY = bubbleFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.View
          style={[styles.bubbleBlock, { transform: [{ translateY: bubbleY }] }]}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{copy.bubble}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>

        <Animated.View
          style={[styles.coverWrap, { transform: [{ scale: coverScale }] }]}
        >
          <Image
            source={coverSource}
            style={{ width: coverSize, height: coverSize }}
            resizeMode="contain"
            accessibilityLabel="힐링펫 캐릭터"
          />
        </Animated.View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.sub}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={copy.primary}
          emphasized
          onPress={() => router.push('/onboarding/intro')}
        />
        <View style={styles.gap} />
        <SecondaryButton label={copy.secondary} onPress={goResume} />
        {copy.hint ? <Text style={styles.hint}>{copy.hint}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'visible',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 12,
    overflow: 'visible',
  },
  bubbleBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  coverWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: 280,
    backgroundColor: Colors.surface,
    borderRadius: RADIUS,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#5E4033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  bubbleTail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  gap: {
    height: 12,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
})
