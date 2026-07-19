import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { PET_NAME_MAX } from '../../lib/petProfile'
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

        <Text style={[styles.speciesName, selected && styles.speciesNameOn]}>
          {pet.species}
        </Text>
      </View>
    </Pressable>
  )
}

export default function OnboardingPetSelect() {
  const draft = getOnboardingDraft()
  const [petId, setPetId] = useState<PetChoice | null>(draft.petId)
  const [petName, setPetName] = useState(draft.petName)
  const [nameFocused, setNameFocused] = useState(false)

  const selectedPet = copy.pets.find((p) => p.id === petId)
  const trimmedName = petName.trim()
  const tooShort = trimmedName.length > 0 && trimmedName.length < 2
  const atMax = trimmedName.length >= PET_NAME_MAX
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= PET_NAME_MAX
  const valid = petId != null && nameValid

  const selectPet = (id: PetChoice) => {
    setPetId(id)
    const defaults = copy.pets.find((p) => p.id === id)?.name ?? ''
    // 아직 비어 있거나 기본값(이전 선택 디폴트)만 있을 때 새 디폴트로 채움
    const otherDefaults = copy.pets.map((p) => p.name)
    if (!trimmedName || otherDefaults.includes(trimmedName)) {
      setPetName(defaults)
    }
  }

  const borderColor = tooShort
    ? Colors.error
    : nameFocused
      ? Colors.primary
      : trimmedName.length > 0
        ? Colors.beige
        : Colors.border

  const goNext = () => {
    if (!valid || !petId) return
    setOnboardingDraft({ petId, petName: trimmedName })
    router.push('/onboarding/restore-code')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headline}>{copy.headline}</Text>
          <Text style={styles.sub}>{copy.sub}</Text>

          <Text style={styles.speciesLabel}>{copy.speciesLabel}</Text>
          <View style={styles.row}>
            {copy.pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                selected={petId === pet.id}
                onSelect={() => selectPet(pet.id)}
              />
            ))}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.nameLabel}>{copy.nameLabel}</Text>
            <View style={[styles.inputShell, { borderColor }]}>
              <TextInput
                value={petName}
                onChangeText={(t) => setPetName(t.slice(0, PET_NAME_MAX))}
                placeholder={copy.namePlaceholder}
                placeholderTextColor={Colors.textDisabled}
                maxLength={PET_NAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                editable={petId != null}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={goNext}
              />
              {atMax || tooShort ? (
                <Text
                  style={[
                    styles.counter,
                    atMax && styles.counterMax,
                    tooShort && styles.counterError,
                  ]}
                >
                  {trimmedName.length} / {PET_NAME_MAX}
                </Text>
              ) : null}
            </View>
            {tooShort ? (
              <Text style={styles.hintError}>{copy.nameHintInvalid}</Text>
            ) : atMax ? (
              <Text style={styles.hintMax}>{copy.nameMaxHint}</Text>
            ) : (
              <Text style={styles.nameHint}>{copy.nameHint}</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <ProgressDots total={ONBOARDING_STEPS} index={2} />
          <PrimaryButton
            label={copy.cta}
            disabled={!valid}
            emphasized={valid}
            onPress={goNext}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  speciesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDisabled,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  fieldBlock: {
    marginTop: 22,
    width: '100%',
  },
  nameLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputShell: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  counter: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  counterMax: {
    color: Colors.textSecondary,
  },
  counterError: {
    color: Colors.error,
  },
  nameHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  hintError: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.error,
  },
  hintMax: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
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
    borderColor: Colors.primary,
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
    alignSelf: 'center',
    maxWidth: '85%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
  },
  bubbleText: {
    fontWeight: '600',
    fontSize: 11,
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
  speciesName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  speciesNameOn: {
    color: Colors.primary,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
