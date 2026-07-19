import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Fonts } from '../constants/Typography'
import { BottomSheet } from './ui/AppOverlay'
import {
  HELP_CONTACTS,
  dialHelpContact,
} from '../lib/helpContacts'

type HelpContactsSheetProps = {
  visible: boolean
  onClose: () => void
}

/** 전문 상담 기관 연락처 바텀시트 — 코코아·크림 톤 */
export function HelpContactsSheet({
  visible,
  onClose,
}: HelpContactsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onRequestClose={onClose}
      sheetStyle={styles.sheet}
    >
      <View style={styles.header}>
        <Text style={styles.title}>혼자 견디지 않아도 괜찮아요</Text>
        <Text style={styles.lead}>
          전문 상담 기관으로 바로 연결할 수 있어요.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
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
    maxHeight: '82%',
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.uiBold,
    color: Colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  lead: {
    fontSize: 13,
    fontFamily: Fonts.uiMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  scroll: {
    maxHeight: 360,
    marginBottom: 8,
  },
  list: {
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
    fontFamily: Fonts.uiBold,
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
    fontFamily: Fonts.uiBold,
    color: Colors.selected,
    letterSpacing: -0.2,
  },
  note: {
    fontSize: 12,
    fontFamily: Fonts.uiMedium,
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
    fontFamily: Fonts.uiBold,
    color: Colors.surface,
  },
  closeLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 2,
  },
  closeLinkText: {
    fontSize: 13,
    fontFamily: Fonts.uiMedium,
    color: Colors.textDisabled,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.88,
  },
})
