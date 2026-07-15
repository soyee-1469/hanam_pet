import { useState } from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../../constants/Colors'
import { PrimaryButton, ProgressDots, ScreenHeader } from '../../components/ui'
import {
  ONBOARDING_STEPS,
  getOnboardingDraft,
  setOnboardingDraft,
} from '../../lib/onboardingDraft'
import type { PetChoice } from '../../lib/onboardingStorage'

const PETS: {
  id: PetChoice
  name: string
  tag: string
  image: number
}[] = [
  {
    id: 'mongi',
    name: '몽이',
    tag: '든든한 강아지 친구',
    image: require('../../assets/images/dog-character_3.png'),
  },
  {
    id: 'nami',
    name: '나미',
    tag: '포근한 고양이 친구',
    image: require('../../assets/images/cat-character_1.png'),
  },
]

export default function OnboardingPetSelect() {
  const [petId, setPetId] = useState<PetChoice | null>(
    getOnboardingDraft().petId,
  )

  const goNext = () => {
    if (!petId) return
    setOnboardingDraft({ petId })
    router.push('/onboarding/ai-notice')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="펫 선택" onBack={() => router.back()} />
      <ProgressDots total={ONBOARDING_STEPS} index={3} />

      <View style={styles.body}>
        <Text style={styles.headline}>함께할 친구를 고르세요</Text>
        <Text style={styles.sub}>나중에 바꿀 수 있어요. 지금은 한 명만 선택합니다.</Text>

        <View style={styles.row}>
          {PETS.map((pet) => {
            const selected = petId === pet.id
            return (
              <Pressable
                key={pet.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setPetId(pet.id)}
                android_ripple={{ color: 'transparent' }}
                style={({ pressed }) => [
                  styles.cardWrap,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[styles.card, selected && styles.cardOn]}
                  collapsable={false}
                >
                  <Image source={pet.image} style={styles.petImg} resizeMode="contain" />
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petTag}>{pet.tag}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="다음" disabled={!petId} onPress={goNext} />
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
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
  },
  cardWrap: {
    flex: 1,
    marginHorizontal: 6,
  },
  pressed: {
    opacity: 0.94,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 200,
  },
  cardOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardRecessed,
    ...Shadows.elevation,
  },
  petImg: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  petTag: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
})
