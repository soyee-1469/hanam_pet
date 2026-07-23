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
import { CaretRight } from 'phosphor-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  PrimaryButton,
  ScreenHeader,
  onboardingFooterStyle,
} from '../components/ui'
import { getOnboardingProfile, NICKNAME_MAX } from '../lib/onboardingStorage'
import { showToast } from '../lib/toast'
import {
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  useKeyboardAvoidInset,
} from '../lib/useKeyboardAvoidInset'
import { TextKeyboardProps } from '../lib/inputKeyboard'

const FALLBACK_NICKNAME = '하남행복이'
const NICKNAME_KEY = 'hp_nickname'

type Mode = 'view' | 'edit'

/**
 * 설정 → 내 닉네임
 * 시안: 안내 + 닉네임 행(>) → 탭 시 편집
 */
export default function AccountScreen() {
  const [mode, setMode] = useState<Mode>('view')
  const [nickname, setNickname] = useState(FALLBACK_NICKNAME)
  const [savedNickname, setSavedNickname] = useState(FALLBACK_NICKNAME)
  const [focused, setFocused] = useState(false)
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const inputRef = useRef<TextInput>(null)

  const scrollFieldIntoView = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80)
  }, [])

  const { webKeyboardInset } = useKeyboardAvoidInset({
    onOpen: scrollFieldIntoView,
    enabled: mode === 'edit',
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

  const openEdit = () => {
    setNickname(savedNickname)
    setMode('edit')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const cancelEdit = () => {
    setNickname(savedNickname)
    setFocused(false)
    setMode('view')
  }

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const next = trimmed.slice(0, NICKNAME_MAX)
      await AsyncStorage.setItem(NICKNAME_KEY, next)
      setSavedNickname(next)
      setNickname(next)
      showToast('닉네임이 저장되었어요')
      setMode('view')
    } catch {
      Alert.alert('저장 실패', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="내 닉네임"
        onBack={() => {
          if (mode === 'edit') {
            cancelEdit()
            return
          }
          router.back()
        }}
      />

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
          <Text style={styles.heading}>내 닉네임</Text>
          <Text style={styles.lead}>닉네임은 언제든 변경할 수 있어요.</Text>

          {mode === 'view' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`닉네임 ${savedNickname}, 변경하기`}
              onPress={openEdit}
              style={({ pressed }) => [
                styles.nameRow,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.nameText} numberOfLines={1}>
                {savedNickname || FALLBACK_NICKNAME}
              </Text>
              <CaretRight
                size={18}
                color={Colors.textDisabled}
                weight="bold"
              />
            </Pressable>
          ) : (
            <View style={styles.fieldBlock}>
              <View style={[styles.inputShell, { borderColor }]}>
                <TextInput
                  {...TextKeyboardProps}
                  ref={inputRef}
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
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (canSave) void save()
                  }}
                />
                <Text style={styles.counter}>
                  {nickname.length} / {NICKNAME_MAX}
                </Text>
              </View>
              {tooShort ? (
                <Text style={styles.errorHint}>
                  닉네임은 2글자 이상이어야 해요.
                </Text>
              ) : (
                <Text style={styles.hint}>최대 {NICKNAME_MAX}자</Text>
              )}
            </View>
          )}
        </ScrollView>

        {mode === 'edit' ? (
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
        ) : null}
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
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 8,
    paddingBottom: Layout.blockGap,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  lead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    gap: 8,
  },
  nameText: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  fieldBlock: {
    marginTop: 4,
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
