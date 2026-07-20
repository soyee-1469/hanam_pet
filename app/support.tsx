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
import {
  CaretLeft,
  Phone,
  Heart,
  Headset,
  Warning,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'

const PRIMARY = {
  name: '하남시 정신건강복지센터',
  address: '경기도 하남시 대청로 10',
  phone: '0317906558',
  phoneDisplay: '031-790-6558',
  hours: '평일 09:00 ~ 18:00',
}

type Contact = {
  id: string
  name: string
  phoneDisplay: string
  phones: { label: string; phone: string }[]
  Icon: Icon
}

const CONTACTS: Contact[] = [
  {
    id: 'suicide',
    name: '자살예방상담전화',
    phoneDisplay: '109',
    phones: [{ label: '109', phone: '109' }],
    Icon: Heart,
  },
  {
    id: 'crisis',
    name: '정신건강위기상담',
    phoneDisplay: '1577-0199',
    phones: [{ label: '1577-0199', phone: '15770199' }],
    Icon: Headset,
  },
  {
    id: 'life',
    name: '생명의 전화',
    phoneDisplay: '1588-9191',
    phones: [{ label: '1588-9191', phone: '15889191' }],
    Icon: Phone,
  },
  {
    id: 'emergency',
    name: '긴급 신고',
    phoneDisplay: '112 / 119',
    phones: [
      { label: '112 (경찰)', phone: '112' },
      { label: '119 (소방·응급)', phone: '119' },
    ],
    Icon: Warning,
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

function openContact(contact: Contact) {
  if (contact.phones.length === 1) {
    void dial(contact.phones[0].phone, contact.name)
    return
  }
  Alert.alert(
    contact.name,
    '연결할 번호를 선택해 주세요.',
    [
      ...contact.phones.map((p) => ({
        text: p.label,
        onPress: () => {
          void dial(p.phone, contact.name)
        },
      })),
      { text: '취소', style: 'cancel' as const },
    ],
  )
}

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>고객 지원</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.primaryCard}>
          <Text style={styles.primaryTitle}>{PRIMARY.name}</Text>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLine}>{PRIMARY.address}</Text>
            <Text style={styles.infoLine}>{PRIMARY.phoneDisplay}</Text>
            <Text style={styles.infoLine}>{PRIMARY.hours}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="하남시 정신건강복지센터 전화 연결"
            onPress={() => {
              void dial(PRIMARY.phone, PRIMARY.name)
            }}
            style={({ pressed }) => [
              styles.callBtn,
              pressed && styles.callBtnPressed,
            ]}
          >
            <Phone size={18} color="#FFFFFF" weight="fill" />
            <Text style={styles.callBtnText}>전화 연결</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>추가 연락처 안내</Text>
        <View style={styles.list}>
          {CONTACTS.map((contact) => (
            <Pressable
              key={contact.id}
              accessibilityRole="button"
              accessibilityLabel={`${contact.name} ${contact.phoneDisplay} 전화걸기`}
              onPress={() => openContact(contact)}
              style={({ pressed }) => [
                styles.contactCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.contactIcon}>
                <contact.Icon
                  size={20}
                  color={Colors.textPrimary}
                  weight="regular"
                />
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneDisplay}</Text>
              </View>
              <Phone size={18} color={Colors.textDisabled} weight="regular" />
            </Pressable>
          ))}
        </View>

        <Text style={styles.footerNote}>
          힐링펫 대화는 전문 상담·치료를 대체하지 않아요. 위급할 때는 바로
          연락해 주세요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
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
    opacity: 0.88,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 40,
  },
  primaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 28,
    ...Shadows.elevation,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoBlock: {
    gap: 6,
    marginBottom: 18,
  },
  infoLine: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  callBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.selected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtnPressed: {
    opacity: 0.9,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionLabel: {
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  list: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...Shadows.elevation,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  contactPhone: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.selected,
  },
  footerNote: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDisabled,
    lineHeight: 20,
    textAlign: 'center',
  },
})
