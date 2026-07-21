import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import {
  CheckRow,
  PrimaryButton,
  ProgressDots,
  ScreenHeader,
  TermsSheet,
  onboardingFooterStyle,
} from '../../components/ui'
import { ONBOARDING_STEPS } from '../../lib/onboardingDraft'
import { getOnboardingCopy, type TermKeyV1 } from '../../lib/onboarding'

const copy = getOnboardingCopy().terms

type SheetKey = TermKeyV1 | null

export default function OnboardingTerms() {
  const [checks, setChecks] = useState<Record<TermKeyV1, boolean>>({
    service: false,
    privacy: false,
    sensitive: false,
    marketing: false,
  })
  const [sheetKey, setSheetKey] = useState<SheetKey>(null)
  const ctaPulse = useRef(new Animated.Value(0)).current
  const prevReady = useRef(false)

  const requiredKeys = useMemo(
    () => copy.items.filter((t) => t.required).map((t) => t.key),
    [],
  )
  const allRequired = requiredKeys.every((k) => checks[k])
  const requiredAllOn = allRequired

  useEffect(() => {
    if (allRequired && !prevReady.current) {
      Animated.sequence([
        Animated.timing(ctaPulse, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulse, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()
    }
    prevReady.current = allRequired
  }, [allRequired, ctaPulse])

  const toggle = (key: TermKeyV1) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleRequiredAll = () => {
    const next = !requiredAllOn
    setChecks((prev) => ({
      ...prev,
      service: next,
      privacy: next,
      sensitive: next,
    }))
  }

  const sheetItem = sheetKey
    ? copy.items.find((i) => i.key === sheetKey)
    : null

  const ctaScale = ctaPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={copy.header} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>{copy.headline}</Text>
        {copy.sub ? <Text style={styles.sub}>{copy.sub}</Text> : null}

        <View style={styles.allBlock}>
          <CheckRow
            label={copy.allAgree}
            checked={requiredAllOn}
            onToggle={toggleRequiredAll}
            emphasize
            compact
            hint={copy.allAgreeHint || undefined}
          />
        </View>

        <View style={styles.listBlock}>
          {copy.items
            .filter((t) => t.required)
            .map((t) => (
              <CheckRow
                key={t.key}
                label={t.label}
                checked={checks[t.key]}
                onToggle={() => toggle(t.key)}
                onPressDetail={() => setSheetKey(t.key)}
              />
            ))}
          {copy.items
            .filter((t) => !t.required)
            .map((t) => (
              <View key={t.key} style={styles.optionalWrap}>
                <CheckRow
                  label={t.label}
                  checked={checks[t.key]}
                  onToggle={() => toggle(t.key)}
                  onPressDetail={() => setSheetKey(t.key)}
                  badge="optional"
                />
              </View>
            ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>{copy.footerNote}</Text>
        <ProgressDots total={ONBOARDING_STEPS} index={0} />
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <PrimaryButton
            label={allRequired ? copy.cta : copy.ctaDisabled}
            disabled={!allRequired}
            emphasized={allRequired}
            onPress={() => router.push('/onboarding/profile')}
            onDisabledPress={() =>
              Alert.alert('', copy.ctaNudge, [{ text: '확인' }])
            }
          />
        </Animated.View>
      </View>

      <TermsSheet
        visible={sheetKey != null}
        title={sheetItem?.label ?? ''}
        body={sheetKey ? copy.dummyBodies[sheetKey] : ''}
        onClose={() => setSheetKey(null)}
        onConfirm={() => {
          if (sheetKey) {
            setChecks((prev) => ({ ...prev, [sheetKey]: true }))
          }
          setSheetKey(null)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: Layout.sectionGapLg,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 32,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  allBlock: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 16,
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 10,
    marginBottom: 18,
  },
  listBlock: {
    paddingVertical: 2,
  },
  optionalWrap: {
    marginTop: 10,
  },
  footerNote: {
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
