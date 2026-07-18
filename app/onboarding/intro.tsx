import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  PanResponder,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  CalendarHeart,
  ChatCircle,
  HandHeart,
  Heart,
  LockKey,
  MagnifyingGlass,
  PawPrint,
  Phone,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import {
  PrimaryButton,
  ScreenHeader,
  TourDots,
  onboardingFooterStyle,
} from '../../components/ui'
import { getOnboardingCopy } from '../../lib/onboarding'

const copy = getOnboardingCopy().intro
const SLIDES = copy.slides
const PAGER_TOTAL = SLIDES.length
const SWIPE_THRESHOLD = 56

const FEATURE_ICONS: Record<string, Icon> = {
  pet: PawPrint,
  chat: ChatCircle,
  diary: CalendarHeart,
  fill: Heart,
  check: MagnifyingGlass,
}

async function dial(phone: string, name: string) {
  const url = `tel:${phone}`
  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert('안내', '이 기기에서는 전화를 걸 수 없어요.')
      return
    }
    await Linking.openURL(url)
  } catch {
    Alert.alert('연결 실패', `${name}로 연결하지 못했어요.`)
  }
}

function BrandSlide({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <View style={styles.centerSlide}>
      <View style={styles.brandGlow}>
        <Image
          source={DogExpr.fun}
          style={styles.brandImage}
          resizeMode="contain"
          accessibilityLabel="힐링펫"
        />
      </View>
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerBody}>{body}</Text>
    </View>
  )
}

function HelpSlide({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <View style={styles.helpSlide}>
      <View style={styles.helpIconWrap}>
        <HandHeart size={40} color={Colors.accent} weight="fill" />
      </View>
      <Text style={styles.helpTitle}>{title}</Text>
      <Text style={styles.helpBody}>{body}</Text>
      <View style={styles.helpList}>
        {copy.helpLines.map((line) => (
          <View key={line.phone} style={styles.helpCard}>
            <View style={styles.helpCardCopy}>
              <View style={styles.helpNameRow}>
                <View style={styles.helpDot} />
                <Text style={styles.helpName}>{line.name}</Text>
              </View>
              <View style={styles.helpPhoneRow}>
                <Phone size={14} color={Colors.primary} weight="fill" />
                <Text style={styles.helpPhone}>{line.phoneDisplay}</Text>
              </View>
              <Text style={styles.helpNote}>{line.note}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${line.name} 연결`}
              onPress={() => void dial(line.phone, line.name)}
              style={({ pressed }) => [
                styles.connectBtn,
                pressed && styles.pressed,
              ]}
            >
              <Phone size={14} color={Colors.surface} weight="fill" />
              <Text style={styles.connectText}>{copy.helpConnect}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  )
}

function FeaturesSlide({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <View style={styles.featuresSlide}>
      <Text style={styles.featuresTitle}>{title}</Text>
      <Text style={styles.featuresBody}>{body}</Text>
      <View style={styles.featureList}>
        {copy.features.map((f) => {
          const IconComp = FEATURE_ICONS[f.key] ?? PawPrint
          return (
            <View key={f.key} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <IconComp size={22} color={Colors.primary} weight="fill" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureName}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.body}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

function PrivacySlide({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <View style={styles.centerSlide}>
      <View style={styles.lockGlow}>
        <LockKey size={56} color={Colors.accent} weight="fill" />
      </View>
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerBody}>{body}</Text>
    </View>
  )
}

export default function OnboardingIntro() {
  const [index, setIndex] = useState(0)
  const item = SLIDES[index]
  const canSwipeNext = index < SLIDES.length - 1
  const canSwipePrev = index > 0

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)))
  }

  /** 투어 끝 = 약관 (피그마: 온보딩 → 약관) */
  const finishTour = () => router.push('/onboarding/terms')
  const skipToTerms = () => router.push('/onboarding/terms')

  const goNext = () => {
    if (canSwipeNext) {
      goTo(index + 1)
      return
    }
    finishTour()
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -SWIPE_THRESHOLD && canSwipeNext) goTo(index + 1)
          else if (g.dx > SWIPE_THRESHOLD && canSwipePrev) goTo(index - 1)
        },
      }),
    [canSwipeNext, canSwipePrev, index],
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        onBack={canSwipePrev ? () => goTo(index - 1) : undefined}
        onSkip={skipToTerms}
        skipLabel={copy.skip}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        {item.key === 'brand' ? (
          <BrandSlide title={item.title} body={item.body} />
        ) : item.key === 'features' ? (
          <FeaturesSlide title={item.title} body={item.body} />
        ) : item.key === 'privacy' ? (
          <PrivacySlide title={item.title} body={item.body} />
        ) : item.key === 'help' ? (
          <HelpSlide title={item.title} body={item.body} />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TourDots total={PAGER_TOTAL} index={index} />
        <PrimaryButton label={copy.ctaNext} onPress={goNext} />
      </View>
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
    paddingBottom: 8,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  pressed: {
    opacity: 0.88,
  },
  centerSlide: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  brandGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  brandImage: {
    width: 120,
    height: 120,
  },
  lockGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  centerBody: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  helpSlide: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  helpIconWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  helpBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  helpList: {
    gap: 10,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  helpCardCopy: {
    flex: 1,
    minWidth: 0,
  },
  helpNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  helpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  helpName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  helpPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  helpPhone: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  helpNote: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.selected,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  connectText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.surface,
  },
  featuresSlide: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 8,
  },
  featuresBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.iconFeed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
    minWidth: 0,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 19,
  },
})
