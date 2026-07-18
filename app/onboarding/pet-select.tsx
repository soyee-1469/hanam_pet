import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { PrimaryButton, ProgressDots, ScreenHeader, onboardingFooterStyle } from '../../components/ui'
import {
  ONBOARDING_STEPS,
  getOnboardingDraft,
  setOnboardingDraft,
} from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { DogExpr } from '../../constants/DogExpr'
import { Heart } from 'phosphor-react-native'

const copy = getOnboardingCopy().petSelect

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.wink,
  nami: require('../../assets/images/cat-character_1.png'),
}

function PetCard({
  pet,
  selected,
  onSelect,
}: {
  pet: (typeof copy.pets)[number]
  selected: boolean
  onSelect: () => void
}) {
  const bounce = useRef(new Animated.Value(1)).current
  const bubbleOpacity = useRef(new Animated.Value(0)).current
  const bubbleY = useRef(new Animated.Value(6)).current
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, [])

  const showGreeting = () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleOpacity.setValue(0)
    bubbleY.setValue(8)
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bubbleY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
    bubbleTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bubbleY, {
          toValue: -4,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    }, 800)
  }

  const handlePress = () => {
    onSelect()
    bounce.setValue(0.92)
    Animated.sequence([
      Animated.spring(bounce, {
        toValue: 1.06,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.timing(bounce, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
    showGreeting()
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      android_ripple={{ color: 'transparent' }}
      style={styles.cardWrap}
    >
      <View
        style={[styles.card, selected ? styles.cardOn : styles.cardOff]}
        collapsable={false}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bubble,
            {
              opacity: bubbleOpacity,
              transform: [{ translateY: bubbleY }],
            },
          ]}
        >
          <Text style={styles.bubbleText}>{pet.greeting}</Text>
          <View style={styles.bubbleTail} />
        </Animated.View>

        {selected ? (
          <View style={styles.heart}>
            <Heart size={14} color={Colors.taupe} weight="fill" />
          </View>
        ) : null}

        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <Image
            source={PET_IMAGES[pet.id]}
            style={styles.petImg}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={[styles.petName, selected && styles.petNameOn]}>
          {pet.name}
        </Text>
        <Text style={styles.petTag}>{pet.tag}</Text>

        <View style={styles.traits}>
          {pet.traits.map((trait) => (
            <View key={trait.label} style={styles.traitChip}>
              <Text style={styles.traitText}>
                {trait.emoji} {trait.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  )
}

export default function OnboardingPetSelect() {
  const [petId, setPetId] = useState<PetChoice | null>(
    getOnboardingDraft().petId,
  )

  const selectedPet = copy.pets.find((p) => p.id === petId)
  const ctaLabel = selectedPet
    ? copy.ctaWith(selectedPet.name)
    : copy.cta

  const goNext = () => {
    if (!petId) return
    setOnboardingDraft({ petId })
    router.push('/onboarding/profile')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={styles.headline}>{copy.headline}</Text>
        <Text style={styles.sub}>{copy.sub}</Text>

        <View style={styles.row}>
          {copy.pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              selected={petId === pet.id}
              onSelect={() => setPetId(pet.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <ProgressDots total={ONBOARDING_STEPS} index={1} />
        <PrimaryButton
          label={ctaLabel}
          disabled={!petId}
          emphasized={!!petId}
          onPress={goNext}
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
    paddingHorizontal: 20,
    paddingTop: 0,
    justifyContent: 'flex-start',
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 30,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  cardWrap: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 14,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: 'visible',
  },
  cardOff: {
    backgroundColor: Colors.surface,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 30,
    elevation: 2,
  },
  cardOn: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    shadowColor: '#7A5B45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  bubble: {
    position: 'absolute',
    top: -6,
    zIndex: 2,
    maxWidth: '92%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.surface,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -5,
    width: 10,
    height: 10,
    backgroundColor: Colors.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
  heart: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  petImg: {
    width: 118,
    height: 118,
    marginBottom: 8,
    overflow: 'visible',
  },
  petName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  petNameOn: {
    color: Colors.textPrimary,
  },
  petTag: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  traits: {
    width: '100%',
    gap: 6,
  },
  traitChip: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.cardRecessed,
  },
  traitText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
