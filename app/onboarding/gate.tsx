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
import { Layout } from '../../constants/Layout'
import { PrimaryButton, SecondaryButton } from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'
import { useDesignWindow } from '../../components/AppViewport'

const copy = getOnboardingCopy().gate
const goResume = () => router.push('/onboarding/resume')
const GATE_HERO = require('../../assets/images/healing-pet-gate.png')

export default function OnboardingGate() {
  const { height: screenH } = useDesignWindow()
  const coverSize = Math.min(220, Math.round(screenH * 0.28))

  const breath = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    )
    breathLoop.start()
    return () => {
      breathLoop.stop()
    }
  }, [breath])

  const coverScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Animated.View
          style={[styles.coverGlow, { transform: [{ scale: coverScale }] }]}
        >
          <Image
            source={GATE_HERO}
            style={{ width: coverSize, height: coverSize }}
            resizeMode="contain"
            accessibilityLabel="힐링펫"
          />
        </Animated.View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.sub}>{copy.sub}</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={copy.primary}
          emphasized
          onPress={() => router.push('/onboarding/welcome-prep')}
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
    backgroundColor: Colors.creamyBeige,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH + 4,
    paddingBottom: Layout.sectionGap,
  },
  coverGlow: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
    paddingTop: 8,
  },
  gap: {
    height: 10,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
})
