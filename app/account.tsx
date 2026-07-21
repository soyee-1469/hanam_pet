import { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft } from 'phosphor-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import { getOnboardingProfile, NICKNAME_MAX } from '../lib/onboardingStorage'
import { showToast } from '../lib/toast'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../lib/useKeyboardAvoidInset'

const FALLBACK_NICKNAME = '몽이지킴이'
const NICKNAME_KEY = 'hp_nickname'

export default function AccountScreen() {
  const [nickname, setNickname] = useState(FALLBACK_NICKNAME)
  const [savedNickname, setSavedNickname] = useState(FALLBACK_NICKNAME)
  const [focused, setFocused] = useState(false)
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollFieldIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80)
  }, [])

  const { webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollFieldIntoView,
  })

  useEffect(() => {
    void getOnboardingProfile().then((profile) => {
      if (profile?.nickname) {
        const name = profile.nickname.slice(0, NICKNAME_MAX)
        setNickname(name)
        setSavedNickname(name)
      }
    })
  }, [])

  const trimmed = nickname.trim()
  const dirty = trimmed !== savedNickname
  const tooShort = trimmed.length > 0 && trimmed.length < 2
  const canSave = trimmed.length >= 2 && trimmed.length <= NICKNAME_MAX && dirty

  const borderColor = tooShort
    ? Colors.error
    : focused || dirty
      ? Colors.primary
      : Colors.border

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await AsyncStorage.setItem(NICKNAME_KEY, trimmed.slice(0, NICKNAME_MAX))
      setSavedNickname(trimmed.slice(0, NICKNAME_MAX))
      showToast('닉네임이 저장되었어요')
      router.back()
    } catch {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          android_ripple={{ color: 'transparent' }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>계정</Text>
      </View>

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
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>닉네임</Text>
            <View style={[styles.inputShell, { borderColor }]}>
              <TextInput
                value={nickname}
                onChangeText={(t) => setNickname(t.slice(0, NICKNAME_MAX))}
                onFocus={() => {
                  setFocused(true)
                  scrollFieldIntoView()
                }}
                onBlur={() => setFocused(false)}
                placeholder="닉네임을 입력해 주세요"
                placeholderTextColor={Colors.textDisabled}
                maxLength={NICKNAME_MAX}
                style={styles.input}
                returnKeyType="done"
              />
              <Text style={styles.counter}>
                {nickname.length} / {NICKNAME_MAX}
              </Text>
            </View>
            <Text style={styles.hint}>
              최대 {NICKNAME_MAX}자 · 앱 안에서만 표시되며, 개인을 식별하는
              정보로 사용되지 않습니다.
            </Text>
            {tooShort ? (
              <Text style={styles.errorHint}>닉네임은 2글자 이상이어야 해요.</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="변경 사항 저장"
            emphasized
            disabled={!canSave || saving}
            onPress={() => {
              void save()
            }}
            onDisabledPress={() => {
              if (!dirty) return
              if (trimmed.length < 2) {
                Alert.alert('안내', '닉네임은 2~8글자로 입력해 주세요.')
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.headerPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: Layout.blockGap,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingLeft: 14,
    paddingRight: 12,
    minHeight: 52,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  counter: {
    marginLeft: 8,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  errorHint: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
