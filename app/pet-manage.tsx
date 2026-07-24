import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  type ImageSourcePropType,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Check } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { DogExpr } from '../constants/DogExpr'
import { CatExpr } from '../constants/OnboardingMascot'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../components/ui'
import {
  getOnboardingProfile,
  setPetChoice,
  type PetChoice,
} from '../lib/onboardingStorage'
import {
  PET_NAME_MAX,
  defaultPetName,
  getStoredPetName,
  setPetName,
} from '../lib/petProfile'
import { showToast } from '../lib/toast'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../lib/useKeyboardAvoidInset'
import { TextKeyboardProps } from '../lib/inputKeyboard'

const PETS: {
  id: PetChoice
  species: string
  image: ImageSourcePropType
}[] = [
  { id: 'mongi', species: '강아지', image: DogExpr.wink },
  { id: 'nami', species: '고양이', image: CatExpr.soft },
]

/**
 * 설정 → 내 펫 관리
 * 온보딩에서 고른 펫·이름을 다시 바꿀 수 있어요.
 */
export default function PetManageScreen() {
  const [petId, setPetId] = useState<PetChoice>('mongi')
  const [savedPetId, setSavedPetId] = useState<PetChoice>('mongi')
  const [petName, setPetNameDraft] = useState('')
  const [savedPetName, setSavedPetName] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollNameIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80)
  }, [])

  const { webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollNameIntoView,
  })

  useEffect(() => {
    void (async () => {
      const profile = await getOnboardingProfile()
      const id: PetChoice = profile?.petId ?? 'mongi'
      const name = await getStoredPetName()
      setPetId(id)
      setSavedPetId(id)
      setPetNameDraft(name)
      setSavedPetName(name)
    })()
  }, [])

  const trimmed = petName.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 2
  /** 비우면 하치/나미 기본 이름 */
  const nameOk = trimmed.length === 0 || (trimmed.length >= 2 && trimmed.length <= PET_NAME_MAX)
  const dirty = petId !== savedPetId || trimmed !== savedPetName
  const canSave = nameOk && !tooShort

  const borderColor = tooShort
    ? Colors.error
    : nameFocused || trimmed.length > 0
      ? Colors.primary
      : Colors.border

  const selectPet = (id: PetChoice) => {
    setPetId(id)
    const defaults = PETS.map((p) => defaultPetName(p.id))
    if (!trimmed || defaults.includes(trimmed)) {
      setPetNameDraft(defaultPetName(id))
    }
  }

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await setPetChoice(petId)
      const nextName = await setPetName(trimmed)
      setSavedPetId(petId)
      setSavedPetName(nextName)
      setPetNameDraft(nextName)
      showToast('펫 친구 정보가 저장되었어요')
      router.back()
    } catch {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="내 펫 관리" onBack={() => router.back()} />

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
          <Text style={styles.headline}>
            함께 하고 있는 펫 친구를{'\n'}관리해요
          </Text>
          <Text style={styles.sub}>
            다른 친구로 바꾸거나 새로운 이름을 지어줄 수 있어요.
          </Text>

          <Text style={styles.sectionLabel}>함께 하는 친구</Text>
          <View style={styles.petRow}>
            {PETS.map((pet) => {
              const on = petId === pet.id
              return (
                <Pressable
                  key={pet.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={pet.species}
                  onPress={() => selectPet(pet.id)}
                  style={styles.cardWrap}
                >
                  <View style={[styles.card, on ? styles.cardOn : styles.cardOff]}>
                    <Image
                      source={pet.image}
                      style={styles.petImg}
                      resizeMode="contain"
                    />
                    {on ? (
                      <View style={styles.speciesBadge}>
                        <Check size={12} color={Colors.surface} weight="bold" />
                        <Text style={styles.speciesBadgeText}>{pet.species}</Text>
                      </View>
                    ) : (
                      <Text style={styles.speciesOff}>{pet.species}</Text>
                    )}
                  </View>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.sectionLabel}>내가 지어준 이름</Text>
            <View style={[styles.inputShell, { borderColor }]}>
              <TextInput
                {...TextKeyboardProps}
                value={petName}
                onChangeText={(t) => setPetNameDraft(t.slice(0, PET_NAME_MAX))}
                placeholder={defaultPetName(petId)}
                placeholderTextColor={Colors.textDisabled}
                maxLength={PET_NAME_MAX}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => {
                  setNameFocused(true)
                  scrollNameIntoView()
                }}
                onBlur={() => setNameFocused(false)}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (canSave && dirty) void save()
                }}
                selectionColor={Colors.primary}
              />
              <Text
                style={[
                  styles.counter,
                  tooShort && styles.counterError,
                ]}
              >
                {petName.length} / {PET_NAME_MAX}
              </Text>
            </View>
            {tooShort ? (
              <Text style={styles.hintError}>2자 이상 입력해 주세요</Text>
            ) : (
              <Text style={styles.nameHint}>
                ✦ 이름을 비워두면 하치 또는 나미로 불러요.
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="이대로 할게요"
            emphasized
            disabled={!canSave || saving}
            onPress={() => {
              if (!dirty) {
                router.back()
                return
              }
              void save()
            }}
            onDisabledPress={() => {
              if (tooShort) {
                Alert.alert('안내', '이름은 비우거나 2~8글자로 입력해 주세요.')
              }
            }}
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
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  petRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  cardOff: {
    borderWidth: 1.5,
    borderColor: Colors.divider,
  },
  cardOn: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  petImg: {
    width: 118,
    height: 118,
    marginBottom: 12,
  },
  speciesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  speciesBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.surface,
  },
  speciesOff: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDisabled,
    paddingVertical: 6,
  },
  fieldBlock: {
    marginTop: 28,
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
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  counterError: {
    color: Colors.error,
  },
  nameHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  hintError: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
