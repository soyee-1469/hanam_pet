import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { HelpContactRow } from '../components/HelpContactRow'
import { HELP_CONTACTS } from '../lib/helpContacts'

/** 대화 중 도움 배너 → 긴급·상담 연락처 (전체 화면) */
export default function ChatHelpScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>지금 도움이 필요한가요?</Text>
        <Text style={styles.lead}>
          혼자 견디지 않아도 괜찮아요. 아래 연락처로 연결하면 도움받을 수
          있어요.
        </Text>

        <View style={styles.list}>
          {HELP_CONTACTS.map((c) => (
            <HelpContactRow key={c.id} contact={c} />
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="대화로 돌아가기"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
      >
        <Text style={styles.backLinkText}>괜찮아요, 대화로 돌아갈게요.</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerPaddingTop + Layout.contentPaddingBottom,
    paddingBottom: Layout.contentPaddingBottom,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 10,
  },
  lead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  list: {
    gap: 12,
  },
  pressed: {
    opacity: 0.88,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Layout.screenPaddingH,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
