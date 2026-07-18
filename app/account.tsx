import { useEffect, useState } from 'react'
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
import * as Clipboard from 'expo-clipboard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import { getOnboardingProfile } from '../lib/onboardingStorage'
import { showToast } from '../lib/toast'

const MAX_LEN = 10
const FALLBACK_NICKNAME = '몽이지킴이'
const ANON_ID_DISPLAY = 'anon_8f2c...a91'
const ANON_ID_FULL = 'anon_8f2c9d4e1b7a91'
const NICKNAME_KEY = 'hp_nickname'

export default function AccountScreen() {
  const [nickname, setNickname] = useState(FALLBACK_NICKNAME)
  const [savedNickname, setSavedNickname] = useState(FALLBACK_NICKNAME)
  const [focused, setFocused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void getOnboardingProfile().then((profile) => {
      if (profile?.nickname) {
        const name = profile.nickname.slice(0, MAX_LEN)
        setNickname(name)
        setSavedNickname(name)
      }
    })
  }, [])

  const trimmed = nickname.trim()
  const dirty = trimmed !== savedNickname
  const tooShort = trimmed.length > 0 && trimmed.length < 2
  const canSave = trimmed.length >= 2 && trimmed.length <= MAX_LEN && dirty

  const borderColor = tooShort
    ? Colors.error
    : focused || dirty
      ? Colors.primary
      : Colors.border

  const copyAnonId = async () => {
    try {
      await Clipboard.setStringAsync(ANON_ID_FULL)
      setCopied(true)
      showToast('클립보드에 복사되었어요')
      setTimeout(() => setCopied(false), 1600)
    } catch {
      Alert.alert('복사 실패', '잠시 후 다시 시도해 주세요.')
    }
  }

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await AsyncStorage.setItem(NICKNAME_KEY, trimmed)
      setSavedNickname(trimmed)
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
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>프로필</Text>
            </View>
            <Text style={styles.status}>익명으로 안전하게 이용 중</Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>닉네임</Text>
            <View style={[styles.inputShell, { borderColor }]}>
              <TextInput
                value={nickname}
                onChangeText={(t) => setNickname(t.slice(0, MAX_LEN))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="닉네임을 입력해 주세요"
                placeholderTextColor={Colors.textDisabled}
                maxLength={MAX_LEN}
                style={styles.input}
                returnKeyType="done"
              />
              <Text style={styles.counter}>
                {nickname.length} / {MAX_LEN}
              </Text>
            </View>
            <Text style={styles.hint}>
              닉네임은 앱 안에서만 표시되며, 개인을 식별하는 정보로 사용되지
              않습니다.
            </Text>
            {tooShort ? (
              <Text style={styles.errorHint}>닉네임은 2글자 이상이어야 해요.</Text>
            ) : null}
          </View>

          <View style={styles.anonCard}>
            <View style={styles.anonCopy}>
              <Text style={styles.anonLabel}>익명 식별자</Text>
              <Text style={styles.anonId}>{ANON_ID_DISPLAY}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="익명 식별자 복사"
              onPress={() => {
                void copyAnonId()
              }}
              style={({ pressed }) => [
                styles.copyBtn,
                pressed && styles.copyBtnPressed,
              ]}
            >
              <Text style={styles.copyBtnText}>
                {copied ? '복사됨' : '복사'}
              </Text>
            </Pressable>
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
                Alert.alert('안내', '닉네임은 2~10글자로 입력해 주세요.')
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
    paddingHorizontal: 12,
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
    paddingBottom: 16,
  },
  profileBlock: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  counter: {
    marginLeft: 8,
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
  anonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.creamyBeige,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  anonCopy: {
    flex: 1,
    minWidth: 0,
  },
  anonLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  anonId: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  copyBtnPressed: {
    opacity: 0.7,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    ...onboardingFooterStyle,
  },
})
