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
const goResume = () => router.push('/onboarding/resume')

export default function OnboardingGate() {
  const { height: screenH } = useDesignWindow()
  const coverSize = Math.min(200, Math.round(screenH * 0.24))
  const coverSource = useRef(nextGateMascot('fun')).current

  const breath = useRef(new Animated.Value(0)).current

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
    breathLoop.start()
    return () => {
      breathLoop.stop()
    }
  }, [breath])

  const coverScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
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
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  coverWrap: {
    marginBottom: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.9,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  gap: {
    height: 12,
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
})
