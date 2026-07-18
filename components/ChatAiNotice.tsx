import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Phone } from 'phosphor-react-native'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, ScreenHeader, onboardingFooterStyle } from './ui'

type NoticeItem = {
  title: string
  body: string
}

const ITEMS: NoticeItem[] = [
  {
    title: '진단·치료를 대체하지 않아요',
    body: '여기서 나눈 대화 내용은 전문적인 의료 자문이나 치료를 대신하지 않아요.',
  },
  {
    title: '공감과 정서적 지지를 위한 대화 상대예요',
    body: '펫과 함께 편안하게 마음을 나누는 대화를 해보세요.',
  },
  {
    title: '위급할 땐 전문 기관으로 연락하세요',
    body: '힐링펫도 곁에 있지만, 긴급 상황에는 전문 상담가의 도움이 더 힘이 될 수 있어요.',
  },
]

/** 탭 바(absolute)와 CTA 사이 Fitts 안전 간격 */
const CTA_ABOVE_TAB = 24

type ChatAiNoticeProps = {
  onBack: () => void
  onConfirm: () => void
  bottomInset?: number
  /** @deprecated 시안은 펫 이름 미사용 — 호환용 */
  petName?: string
}

/** 05 · AI 이용 유의사항 — 첫 대화 시작 전 */
export function ChatAiNotice({
  onBack,
  onConfirm,
  bottomInset = 0,
}: ChatAiNoticeProps) {
  const footerPadBottom = Math.max(bottomInset, 16) + CTA_ABOVE_TAB

  return (
    <View style={styles.root}>
      <ScreenHeader title="AI 이용 유의사항" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>
          {'대화를 시작하기 전에\n꼭 확인해 주세요'}
        </Text>

        <View style={styles.list}>
          {ITEMS.map((item, index) => (
            <View key={item.title} style={styles.item}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>{index + 1}</Text>
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="도움받을 기관 보기"
          onPress={() => router.push('/chat-help')}
          style={({ pressed }) => [
            styles.helpBtn,
            pressed && styles.helpBtnPressed,
          ]}
        >
          <Phone size={18} color={Colors.primary} weight="fill" />
          <Text style={styles.helpBtnText}>도움받을 기관 보기</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPadBottom }]}>
        <PrimaryButton label="확인했어요" onPress={onConfirm} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 24,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 28,
  },
  list: {
    gap: 24,
    marginBottom: 28,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.buttonPrimaryText,
    lineHeight: 16,
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 6,
  },
  itemBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.peach,
    paddingHorizontal: 16,
  },
  helpBtnPressed: {
    opacity: 0.88,
  },
  helpBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    ...onboardingFooterStyle,
    paddingTop: 16,
  },
})
