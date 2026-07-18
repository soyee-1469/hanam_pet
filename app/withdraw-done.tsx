import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Check } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'

export default function WithdrawDoneScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Check size={36} color={Colors.selected} weight="bold" />
        </View>
        <Text style={styles.title}>탈퇴가 완료되었어요</Text>
        <Text style={styles.sub}>
          이용해 주셔서 감사했어요.{'\n'}언제든 다시 시작할 수 있어요.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="처음으로"
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
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
