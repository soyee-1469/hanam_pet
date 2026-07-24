import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Heart } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { CatExpr } from '../../constants/OnboardingMascot'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().gate
const goResume = () => router.push('/onboarding/resume')

/**
 * 게이트 — 「우리 전에 만난 적이 있나요?」
 * 첫 만남 / 이미 함께 선택.
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
              <Heart size={16} color={Colors.primary} weight="fill" />
            </View>
          </View>
          <Text style={styles.brandName}>
            하남이네 힐링
            <Text style={styles.brandPet}>펫</Text>
          </Text>
        </View>

        <Text style={styles.headline}>{copy.title}</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.primary}. ${copy.primarySub ?? ''}`}
            onPress={() => router.push('/onboarding/welcome-prep')}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryTitle}>{copy.primary}</Text>
            {copy.primarySub ? (
              <Text style={styles.primarySub}>{copy.primarySub}</Text>
            ) : null}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${copy.secondary}. ${copy.secondarySub ?? ''}`}
            onPress={goResume}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryTitle}>{copy.secondary}</Text>
            {copy.secondarySub ? (
              <Text style={styles.secondarySub}>{copy.secondarySub}</Text>
            ) : null}
          </Pressable>
        </View>
      </View>

      {copy.hint ? <Text style={styles.hint}>{copy.hint}</Text> : null}
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
    paddingHorizontal: Layout.screenPaddingH,
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
    marginBottom: 28,
    lineHeight: 32,
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
    fontSize: 17,
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
    borderColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  secondarySub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.9,
  },
  hint: {
    paddingHorizontal: Layout.screenPaddingH + 8,
    paddingBottom: Layout.sectionGapLg,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
  },
})
