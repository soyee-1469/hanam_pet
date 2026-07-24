import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Phone } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import {
  dialHelpContact,
  type HelpContact,
} from '../lib/helpContacts'

type HelpContactRowProps = {
  contact: HelpContact
}

/** 도움 연락처 행 — 시트·chat-help 공통 */
export function HelpContactRow({ contact }: HelpContactRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${contact.name} ${contact.phoneDisplay} 전화 걸기`}
      onPress={() => {
        void dialHelpContact(contact.phone, contact.name)
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phoneDisplay}</Text>
        <Text style={styles.note}>{contact.note}</Text>
      </View>
      <Phone size={20} color={Colors.textDisabled} weight="regular" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phone: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  note: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    color: Colors.textSecondary,
  },
})
