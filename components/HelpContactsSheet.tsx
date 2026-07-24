import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { Colors } from '../constants/Colors'
import { BottomSheet } from './ui/AppOverlay'
import { HelpContactRow } from './HelpContactRow'
import { HELP_CONTACTS } from '../lib/helpContacts'

/** 핸들·헤더·세이프에리어 대략치 — 스크롤 영역 max용 */
const SHEET_CHROME = 160

type HelpContactsSheetProps = {
  visible: boolean
  onClose: () => void
}

/** 전문 상담 기관 연락처 바텀시트 */
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
        <Text style={styles.title}>지금 도움이 필요한가요?</Text>
        <Text style={styles.lead}>
          혼자 견디지 않아도 괜찮아요. 아래 연락처로 연결하면 도움받을 수
          있어요.
        </Text>
      </View>

      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {HELP_CONTACTS.map((c) => (
          <HelpContactRow key={c.id} contact={c} />
        ))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 8,
  },
  lead: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 4,
  },
  list: {
    flexGrow: 0,
    gap: 10,
    paddingBottom: 8,
  },
})
