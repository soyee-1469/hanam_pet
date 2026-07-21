import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Layout } from '../../constants/Layout'
import { Colors, Shadows } from '../../constants/Colors'
import { DogExpr } from '../../constants/DogExpr'
import { PrimaryButton, ProgressDots, ScreenHeader, onboardingFooterStyle } from '../../components/ui'
import {
  ONBOARDING_STEPS,
  getOnboardingDraft,
  setOnboardingDraft,
  type AgeGroup,
  type GenderChoice,
} from '../../lib/onboardingDraft'
import { type PetChoice, NICKNAME_MAX } from '../../lib/onboardingStorage'
import { getOnboardingCopy } from '../../lib/onboarding'
import { defaultPetName } from '../../lib/petProfile'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../../lib/useKeyboardAvoidInset'
import { TextKeyboardProps } from '../../lib/inputKeyboard'

const copy = getOnboardingCopy().profile

const PET_IMAGES: Record<PetChoice, ImageSourcePropType> = {
  mongi: DogExpr.wink,
  nami: require('../../assets/images/cat-character_1.png'),
}

export default function OnboardingProfile() {
  const draft = getOnboardingDraft()
  const petId: PetChoice = draft.petId ?? 'mongi'
  const petName = draft.petName.trim() || defaultPetName(petId)

  const [nickname, setNickname] = useState(draft.nickname)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(draft.ageGroup)
  const [gender, setGender] = useState<GenderChoice | null>(draft.gender)
  const [focused, setFocused] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollFieldIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80)
  }, [])

  const { webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollFieldIntoView,
  })

  const trimmed = nickname.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 2
  const atMax = trimmed.length >= NICKNAME_MAX
  const showCounter = atMax || tooShort
  const valid =
    trimmed.length >= 2 &&
    trimmed.length <= NICKNAME_MAX &&
    ageGroup != null &&
    gender != null

  const cheerText =
    trimmed.length === 0 ? copy.cheerEmpty : copy.cheerWith(trimmed)

  const goNext = () => {
    if (!valid || !ageGroup || !gender) return
    setOnboardingDraft({ nickname: trimmed, ageGroup, gender })
    // 프로필은 다음 온보딩 단계(펫 선택)로만 이동 — 탭(나의 펫)으로 점프하지 않음
    router.push('/onboarding/pet-select')
  }

  const borderColor = tooShort
    ? Colors.error
    : focused
      ? Colors.primary
      : trimmed.length > 0
        ? Colors.beige
        : Colors.border

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={() => router.back()} />

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

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{copy.label}</Text>
            <View style={[styles.inputShell, { borderColor }]}>
              <TextInput
                {...TextKeyboardProps}
                value={nickname}
                onChangeText={(t) => setNickname(t.slice(0, NICKNAME_MAX))}
                placeholder={copy.placeholder}
                placeholderTextColor={Colors.textDisabled}
                maxLength={NICKNAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => {
                  setFocused(true)
                  scrollFieldIntoView()
                }}
                onBlur={() => setFocused(false)}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={goNext}
              />
              {showCounter ? (
                <Text
                  style={[
                    styles.counter,
                    atMax && styles.counterMax,
                    tooShort && styles.counterError,
                  ]}
                >
                  {trimmed.length} / {NICKNAME_MAX}
                </Text>
              ) : null}
            </View>
            {tooShort ? (
              <Text style={styles.hintError}>{copy.hintInvalid}</Text>
            ) : atMax ? (
              <Text style={styles.hintMax}>{copy.maxHint}</Text>
            ) : null}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{copy.ageLabel}</Text>
            <View style={[styles.chipRow, styles.ageRow]}>
              {copy.ageOptions.map((opt) => {
                const on = ageGroup === opt.id
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setAgeGroup(opt.id)}
                    style={[
                      styles.chip,
                      styles.ageChip,
                      on ? styles.chipOn : styles.chipOff,
                    ]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>{copy.genderLabel}</Text>
            <View style={styles.chipRow}>
              {copy.genderOptions.map((opt) => {
                const on = gender === opt.id
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setGender(opt.id)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </ScrollView>

        {/* 스크롤 밖에 두어 캐릭터가 잘리지 않게 — 펫 선택 전이면 숨김 */}
        {draft.petId ? (
          <View style={styles.cheer} pointerEvents="none">
            <Image
              source={PET_IMAGES[petId]}
              style={styles.cheerPet}
              resizeMode="contain"
            />
            <View style={styles.cheerBubble}>
              <Text style={styles.cheerText}>{cheerText}</Text>
            </View>
            <Text style={styles.cheerName} numberOfLines={1}>
              {petName}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <ProgressDots total={ONBOARDING_STEPS} index={1} />
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
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
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
    marginBottom: 24,
  },
  fieldBlock: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
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
    paddingLeft: 14,
    paddingRight: 14,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ageRow: {
    flexWrap: 'nowrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageChip: {
    flex: 1,
    marginRight: 6,
    marginBottom: 0,
    paddingHorizontal: 6,
  },
  chipOff: {
    backgroundColor: Colors.creamyBeige,
  },
  chipOn: {
    backgroundColor: Colors.selected,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipTextOn: {
    color: Colors.surface,
  },
  cheer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: Layout.cardPaddingH,
    overflow: 'visible',
  },
  cheerPet: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  cheerBubble: {
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Shadows.elevation,
  },
  cheerText: {
    fontWeight: '600',
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cheerName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDisabled,
    maxWidth: '88%',
    textAlign: 'center',
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
