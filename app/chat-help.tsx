import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'

type HelpContact = {
  id: string
  name: string
  phone: string
  phoneDisplay: string
  note: string
}

const CONTACTS: HelpContact[] = [
  {
    id: 'suicide',
    name: '자살예방 상담전화',
    phone: '109',
    phoneDisplay: '109',
    note: '24시간 자살예방 및 위기상황 전문 상담',
  },
  {
    id: 'life',
    name: '생명의 전화',
    phone: '15889191',
    phoneDisplay: '1588-9191',
    note: '24시간 마음을 다독이는 위기 극복 상담',
  },
  {
    id: 'mental',
    name: '정신건강 위기상담 전화',
    phone: '15770199',
    phoneDisplay: '1577-0199',
    note: '24시간 정신건강 상담 및 마음 지킴 지원',
  },
  {
    id: 'hanam',
    name: '하남시 정신건강복지센터',
    phone: '0317936552',
    phoneDisplay: '031-793-6552',
    note: '하남시 정신건강 서비스',
  },
]

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

/** 대화 중 도움 배너 → 긴급·상담 연락처 */
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
          {CONTACTS.map((c) => (
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
                  void dial(c.phone, c.name)
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
