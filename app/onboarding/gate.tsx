import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Heart } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { onboardingFooterStyle } from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().gate
const goResume = () => router.push('/onboarding/resume-intro')

/**
 * 게이트 — 「우리 전에 만난 적이 있나요?」
 * 첫 만남 / 이미 함께 선택.
 *
 * 웹: Pressable은 <button>으로 렌더되므로 배경색은 안쪽 View에 둔다.
 * (global.css / Tailwind preflight가 button 배경을 지울 수 있음)
 */
export default function OnboardingGate() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.brand} accessibilityLabel="하남이네 힐링펫">
          <View style={styles.duo}>
            <Image
              source={DogExpr.soft}
              style={styles.dog}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Image
              source={CatExpr.soft}
              style={styles.cat}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
          <View style={styles.ground}>
            <View style={styles.groundLine} />
            <View style={styles.heart}>
              <Heart size={16} color={Colors.cocoa} weight="fill" />
            </View>
          </View>
          <Text style={styles.brandName}>
            하남이네 힐링
            <Text style={styles.brandPet}>펫</Text>
          </Text>
        </View>

        <Text style={styles.headline}>{copy.title}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.primary}. ${copy.primarySub ?? ''}`}
            onPress={() => router.push('/onboarding/welcome-prep')}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View style={styles.primaryBtn} collapsable={false}>
              <Text style={styles.primaryTitle}>{copy.primary}</Text>
              {copy.primarySub ? (
                <Text style={styles.primarySub}>{copy.primarySub}</Text>
              ) : null}
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.secondary}. ${copy.secondarySub ?? ''}`}
            onPress={goResume}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View style={styles.secondaryBtn} collapsable={false}>
              <Text style={styles.secondaryTitle}>{copy.secondary}</Text>
              {copy.secondarySub ? (
                <Text style={styles.secondarySub}>{copy.secondarySub}</Text>
              ) : null}
            </View>
          </Pressable>
        </View>

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
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  duo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dog: {
    width: 108,
    height: 108,
    marginRight: -18,
    zIndex: 1,
  },
  cat: {
    width: 88,
    height: 88,
    marginBottom: 2,
    zIndex: 2,
  },
  ground: {
    marginTop: -4,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  groundLine: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.beige,
  },
  heart: {
    position: 'absolute',
    right: 10,
    top: -9,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandPet: {
    color: Colors.selected,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
    lineHeight: 32,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Shadows.elevation,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 4,
  },
  primarySub: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  secondaryBtn: {
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.cocoa,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.cocoa,
    marginBottom: 4,
  },
  secondarySub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.9,
  },
  hint: {
    marginTop: 14,
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
})
