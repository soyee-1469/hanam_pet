import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'

const HERO = require('../assets/images/healing-pet-gate.png')

/**
 * 회원탈퇴 완료 — 하남이네와 인사하며 다시 만날 수 있음을 안내
 */
export default function WithdrawDoneScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <Image
          source={HERO}
          style={styles.hero}
          resizeMode="contain"
          accessibilityLabel="하남이네 하치"
        />
        <Text style={styles.title}>
          그동안 마음을{'\n'}나눌 수 있어 좋았어요!
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="만나러 갈래요"
          emphasized
          onPress={() => router.replace('/onboarding/gate')}
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
    paddingBottom: 12,
  },
  hero: {
    width: '100%',
    maxWidth: 320,
    height: 280,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.cocoa,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 36,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
