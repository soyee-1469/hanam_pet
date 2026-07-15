import { useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'

const HOLD_MS = 1600

export default function OnboardingSplash() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/onboarding/gate')
    }, HOLD_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>마음챙김의 모든 것</Text>
        <Text style={styles.sub}>
          언제나 곁에 있는 나만의 펫과 함께{'\n'}매일 마음을 힐링해요
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.accentSoft,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: {
    width: 88,
    height: 88,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
})
