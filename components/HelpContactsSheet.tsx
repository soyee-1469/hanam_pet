import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { BottomSheet } from './ui/AppOverlay'
import {
  HELP_CONTACTS,
  dialHelpContact,
} from '../lib/helpContacts'

/** 핸들·헤더·닫기 링크·세이프에리어 대략치 — 스크롤 영역 max용 */
const SHEET_CHROME = 200

type HelpContactsSheetProps = {
  visible: boolean
  onClose: () => void
}

/** 전문 상담 기관 연락처 바텀시트 — 코코아·크림 톤 */
export function HelpContactsSheet({
  visible,
  onClose,
}: HelpContactsSheetProps) {
  const { height: winH } = useWindowDimensions()
  const sheetMaxHeight = Math.round(winH * 0.82)
  const scrollMaxHeight = Math.max(240, sheetMaxHeight - SHEET_CHROME)

  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onClose}
      sheetStyle={[styles.sheet, { maxHeight: sheetMaxHeight }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>혼자 견디지 않아도 괜찮아요</Text>
        <Text style={styles.lead}>
          전문 상담 기관으로 바로 연결할 수 있어요.
        </Text>
      </View>

      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {HELP_CONTACTS.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.copy}>
              <View style={styles.nameRow}>
                <View style={styles.dot} />
                <Text style={styles.name}>{c.name}</Text>
              </View>
              <View style={styles.phoneRow}>
                <Phone size={15} color={Colors.selected} weight="fill" />
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
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={onClose}
        style={({ pressed }) => [styles.closeLink, pressed && styles.pressed]}
      >
        <Text style={styles.closeLinkText}>괜찮아요, 닫을게요</Text>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  lead: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  scroll: {
    // Hug content (flexGrow: 0); maxHeight from window — long list scrolls.
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.selected,
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
    marginBottom: 4,
  },
  phone: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.selected,
    letterSpacing: -0.2,
  },
  note: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
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
  closeLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 2,
  },
  closeLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDisabled,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.88,
  },
})
