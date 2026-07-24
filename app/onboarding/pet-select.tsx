import { useCallback, useEffect, useRef, useState } from 'react'
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
import { Check, Plus } from 'phosphor-react-native'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../../components/ui'
import {
  getOnboardingDraft,
  setOnboardingDraft,
} from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { PET_NAME_MAX, defaultPetName } from '../../lib/petProfile'
import { DogExpr } from '../../constants/DogExpr'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../../lib/useKeyboardAvoidInset'
import { TextKeyboardProps } from '../../lib/inputKeyboard'

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

        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <Image
            source={PET_IMAGES[pet.id]}
            style={styles.petImg}
            resizeMode="contain"
          />
        </Animated.View>

        {selected ? (
          <View style={styles.speciesBadge}>
            <View style={styles.checkDot}>
              <Check size={11} color={Colors.surface} weight="bold" />
            </View>
            <Text style={styles.speciesNameOn}>{pet.species}</Text>
          </View>
        ) : (
          <Text style={styles.speciesName}>{pet.species}</Text>
        )}
      </View>
    </Pressable>
  )
}

/**
 * 온보딩 — 펫 친구 선택 (종류 필수, 이름 선택)
 */
export default function OnboardingPetSelect() {
  const draft = getOnboardingDraft()
  const [petId, setPetId] = useState<PetChoice | null>(draft.petId)
  const [petName, setPetName] = useState(draft.petName)
  const [nameFocused, setNameFocused] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollNameIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }, [])

  const { webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollNameIntoView,
  })

  const trimmedName = petName.trim()
  const tooShort = trimmedName.length > 0 && trimmedName.length < 2
  /** 이름 비워도 OK → 하치/나미 */
  const nameOk = !tooShort && trimmedName.length <= PET_NAME_MAX
  const valid = petId != null && nameOk

  const selectPet = (id: PetChoice) => {
    setPetId(id)
    const defaults = copy.pets.map((p) => p.name)
    if (!trimmedName || defaults.includes(trimmedName)) {
      setPetName(copy.pets.find((p) => p.id === id)?.name ?? '')
    }
  }

  const borderColor = tooShort
    ? Colors.error
    : nameFocused || trimmedName.length > 0
      ? Colors.primary
      : Colors.border

  const goNext = () => {
    if (!valid || !petId) return
    const nextName =
      trimmedName.length >= 2 ? trimmedName : defaultPetName(petId)
    setOnboardingDraft({ petId, petName: nextName })
    setPetName(nextName)
    router.push('/onboarding/restore-code')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={[
          styles.flex,
          Platform.OS === 'web' &&
            webKeyboardInset > 0 && { paddingBottom: webKeyboardInset },
        ]}
        behavior={keyboardAvoidingBehavior()}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          ref={scrollRef}
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
                {...TextKeyboardProps}
                value={petName}
                onChangeText={(t) => setPetName(t.slice(0, PET_NAME_MAX))}
                placeholder={
                  petId ? defaultPetName(petId) : copy.namePlaceholder
                }
                placeholderTextColor={Colors.textDisabled}
                maxLength={PET_NAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                editable={petId != null}
                onFocus={() => {
                  setNameFocused(true)
                  scrollNameIntoView()
                }}
                onBlur={() => setNameFocused(false)}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={goNext}
                selectionColor={Colors.primary}
              />
              <Text
                style={[styles.counter, tooShort && styles.counterError]}
              >
                {petName.length} / {PET_NAME_MAX}
              </Text>
            </View>
            {tooShort ? (
              <Text style={styles.hintError}>{copy.nameHintInvalid}</Text>
            ) : (
              <View style={styles.hintRow}>
                <Plus size={12} color={Colors.textSecondary} weight="bold" />
                <Text style={styles.nameHint}>{copy.nameHint}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
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
    backgroundColor: Colors.creamyBeige,
  },
  flex: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  speciesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  fieldBlock: {
    marginTop: 28,
    width: '100%',
  },
  nameLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputShell: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  counterError: {
    color: Colors.error,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
  },
  nameHint: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  hintError: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    overflow: 'visible',
  },
  cardOff: {
    borderWidth: 1.5,
    borderColor: Colors.divider,
  },
  cardOn: {
    borderWidth: 2,
    borderColor: Colors.primary,
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
  petImg: {
    width: 118,
    height: 118,
    marginBottom: 12,
  },
  speciesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDisabled,
    paddingVertical: 2,
  },
  speciesNameOn: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
