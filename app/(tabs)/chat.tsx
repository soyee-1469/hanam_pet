import { useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { List, PaperPlaneTilt } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { DogExpr } from '../../constants/DogExpr'
import { CHAT_EMOTION_CARDS } from '../../constants/Moods'
import { MoodEmoji } from '../../components/MoodEmoji'

const PET_NAME = '몽이'

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
  const [message, setMessage] = useState('')
  const tabBarSpace = 72 + Math.max(insets.bottom, 8) + 5

  const sendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    Alert.alert(PET_NAME, `더미: “${trimmed}” 이야기를 들어줄게.`)
    setMessage('')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>대화</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메뉴"
            hitSlop={8}
            onPress={() => Alert.alert('메뉴', '더미: 대화 메뉴입니다.')}
            style={({ pressed }) => [
              styles.menuBtn,
              { cursor: 'pointer' } as object,
              pressed && styles.menuBtnPressed,
            ]}
          >
            <List size={24} color={Colors.textSecondary} weight="regular" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.petBlock}>
            <Text style={styles.petName}>{PET_NAME}</Text>

            <View style={styles.avatarWrap}>
              <Image
                source={DogExpr.wink}
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.speechBubble}>
              <Text style={styles.speechMain}>오늘 하루 어땠어?</Text>
              <Text style={styles.speechSub}>무슨 일이 있었는지 천천히 들려줘.</Text>
            </View>
          </View>

          <View style={styles.cardList}>
            {CHAT_EMOTION_CARDS.map((card) => (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                onPress={() => sendMessage(card.label)}
                style={({ pressed }) => [
                  styles.emotionCard,
                  { cursor: 'pointer' } as object,
                  pressed && styles.emotionCardPressed,
                ]}
              >
                <View style={[styles.emotionIconWrap, { backgroundColor: card.softBg }]}>
                  <MoodEmoji index={card.emojiIndex} size={28} />
                </View>
                <Text style={styles.emotionLabel}>{card.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.composerWrap, { paddingBottom: tabBarSpace + 8 }]}>
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요..."
              placeholderTextColor={Colors.textDisabled}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(message)}
              blurOnSubmit={false}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="보내기"
              onPress={() => sendMessage(message)}
              style={({ pressed }) => [
                styles.sendBtn,
                message.trim().length > 0 && styles.sendBtnActive,
                { cursor: 'pointer' } as object,
                pressed && styles.sendBtnPressed,
              ]}
            >
              <PaperPlaneTilt
                size={18}
                color={
                  message.trim().length > 0
                    ? Colors.buttonPrimaryText
                    : Colors.textDisabled
                }
                weight="fill"
              />
            </Pressable>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  menuBtnPressed: {
    backgroundColor: Colors.divider,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: 0,
    paddingBottom: 20,
  },
  petBlock: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 180,
    height: 180,
  },
  speechBubble: {
    marginTop: 8,
    maxWidth: 300,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speechMain: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  speechSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardList: {
    marginTop: 28,
    gap: 10,
  },
  emotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    boxShadow: `inset -2px -2px 4px 0px ${Colors.cardInsetShadow}`,
  },
  emotionCardPressed: {
    backgroundColor: Colors.buttonSecondaryBg,
  },
  emotionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  composerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.divider,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
  sendBtnPressed: {
    opacity: 0.88,
  },
})
