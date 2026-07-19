import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  HELP_CONTACTS,
  dialHelpContact,
} from '../lib/helpContacts'

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
            <View key={c.id} style={styles.card}>
              <View style={styles.copy}>
                <View style={styles.nameRow}>
                  <View style={styles.dot} />
                  <Text style={styles.name}>{c.name}</Text>
                </View>
                <View style={styles.phoneRow}>
                  <Phone size={16} color={Colors.primary} weight="fill" />
                  <Text style={styles.phone}>{c.phoneDisplay}</Text>
                </View>
                <Text style={styles.note}>{c.note}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${c.name} 연결`}
                onPress={() => {
                  void dialHelpContact(c.phone, c.name)
                }}
                style={({ pressed }) => [
                  styles.connectBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Phone size={14} color={Colors.surface} weight="fill" />
                <Text style={styles.connectText}>연결</Text>
              </Pressable>
            </View>
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
    paddingTop: Layout.headerPaddingTop + 24,
    paddingBottom: 24,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  phone: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  note: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  connectBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.selected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.surface,
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
