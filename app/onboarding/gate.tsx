import { View, Text, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../../constants/Colors'
import { PrimaryButton, SecondaryButton } from '../../components/ui'

export default function OnboardingGate() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>안녕! 기다리고 있었어.</Text>
        </View>
        <Image
          source={require('../../assets/images/dog-character_3.png')}
          style={styles.pet}
          resizeMode="contain"
        />
        <Text style={styles.title}>몽이 & 나미</Text>
        <Text style={styles.sub}>마음을 돌보는 나의 펫</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="처음 방문했어요"
          onPress={() => router.push('/onboarding/intro')}
        />
        <View style={styles.gap} />
        <SecondaryButton
          label="이미 함께 하고 있어요"
          onPress={() => router.push('/onboarding/resume')}
        />
        <Text style={styles.hint}>
          이전부터 이용했다면 이어보기 번호로 계속해 보세요
        </Text>
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
  bubble: {
    maxWidth: 240,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pet: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  gap: {
    height: 10,
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
  },
})
