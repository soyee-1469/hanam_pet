import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Check, Lightning } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'

export default function DiaryDoneScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.checkWrap}>
          <Check size={32} color={Colors.primary} weight="bold" />
        </View>
        <Text style={styles.title}>마음을 담았어요</Text>

        <View style={styles.card}>
          <View style={styles.petCircle}>
            <Image
              source={DogExpr.wink}
              style={styles.petImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>곁에서 항상 응원하고 있어요.</Text>
          </View>
          <View style={styles.reward}>
            <Lightning size={14} color={Colors.primary} weight="fill" />
            <Text style={styles.rewardText}>에너지 +2 획득</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="마음일기로 돌아갈래요"
          emphasized
          onPress={() => router.replace('/(tabs)/diary')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대화로 마음을 더 나눌게요"
          onPress={() => router.replace('/(tabs)/chat')}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryText}>대화로 마음을 더 나눌게요</Text>
        </Pressable>
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
  checkWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 28,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: Colors.creamyBeige,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
  },
  petCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.elevation,
  },
  petImage: {
    width: 96,
    height: 96,
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    maxWidth: '100%',
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    ...onboardingFooterStyle,
    gap: 10,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
})
