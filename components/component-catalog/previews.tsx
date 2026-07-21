/**
 * 카탈로그 라이브/미니 목업 — 실제 앱 비주얼 언어(크림·코코아)에 맞춤.
 * 공용 컴포넌트가 있으면 재사용, 없으면 인라인 목업.
 */
import { useState, type ReactNode } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import {
  Bell,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  Gear,
  House,
  Info,
  Moon,
  Notebook,
  PawPrint,
  Phone,
  Plus,
  Smiley,
  User,
  WarningCircle,
  X,
} from 'phosphor-react-native'
import { Layout } from '../../constants/Layout'
import { Colors, Shadows } from '../../constants/Colors'
import { DIARY_MOODS } from '../../constants/Moods'
import { DIARY_MOOD_LABEL_COLOR } from '../../constants/diaryDemo'
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  CheckRow,
  ProgressDots,
  ScreenHeader,
} from '../ui'
import { MoodEmoji } from '../MoodEmoji'
import { HelpContactsBanner } from '../HelpContactsBanner'
import { EnergyIcon } from '../EnergyIcon'
import { styles as catalogStyles } from './ui'

// —— 공통 래퍼 ——

export function PreviewSection({
  label,
  children,
  first,
}: {
  label: string
  children: ReactNode
  first?: boolean
}) {
  return (
    <View style={[pv.section, first && pv.sectionFirst]}>
      <Text style={catalogStyles.previewLabel}>{label}</Text>
      {children}
    </View>
  )
}

export function PreviewCard({ children }: { children: ReactNode }) {
  return <View style={catalogStyles.previewCard}>{children}</View>
}

export function LivePreviewsBlock({
  title = '라이브 미리보기',
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <>
      <Text style={catalogStyles.blockTitle}>{title}</Text>
      <PreviewCard>{children}</PreviewCard>
    </>
  )
}

// —— 인라인 미니 목업 빌딩 블록 ——

function MockBackHeader({
  title,
  right,
}: {
  title: string
  right?: string
}) {
  return (
    <View style={pv.backHeader}>
      <View style={pv.backHeaderLeft}>
        <CaretLeft size={20} color={Colors.textPrimary} weight="bold" />
        <Text style={pv.backHeaderTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <Text style={pv.backHeaderRight}>{right}</Text> : null}
    </View>
  )
}

function MockTabTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={pv.tabTitleWrap}>
      <Text style={pv.tabTitle}>{title}</Text>
      {sub ? <Text style={pv.tabSub}>{sub}</Text> : null}
    </View>
  )
}

function MockUnderlineTabs({
  items,
  active,
}: {
  items: string[]
  active: number
}) {
  return (
    <View style={pv.underlineRow}>
      {items.map((label, i) => (
        <View key={label} style={pv.underlineItem}>
          <Text
            style={[
              pv.underlineText,
              i === active && pv.underlineTextOn,
            ]}
          >
            {label}
          </Text>
          {i === active ? <View style={pv.underlineBar} /> : null}
        </View>
      ))}
    </View>
  )
}

function MockSoftTabBar() {
  const tabs = [
    { label: '홈', Icon: House, on: true },
    { label: '채팅', Icon: Smiley, on: false },
    { label: '일기', Icon: Notebook, on: false },
    { label: '마음', Icon: Moon, on: false },
    { label: '더보기', Icon: Gear, on: false },
  ] as const
  return (
    <View style={pv.tabBar}>
      {tabs.map((t) => (
        <View key={t.label} style={pv.tabBarItem}>
          <t.Icon
            size={22}
            color={t.on ? Colors.primary : Colors.textDisabled}
            weight={t.on ? 'fill' : 'light'}
          />
          <Text
            style={[pv.tabBarLabel, t.on && pv.tabBarLabelOn]}
          >
            {t.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

function MockStepProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.max(0, Math.min(1, current / total))
  return (
    <View style={pv.stepWrap}>
      <Text style={pv.stepLabel}>
        {current}/{total}
      </Text>
      <View style={pv.stepTrack}>
        <View style={[pv.stepFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  )
}

function MockSurfaceCard({ children }: { children: ReactNode }) {
  return <View style={pv.surfaceCard}>{children}</View>
}

function MockSettingsRow({
  title,
  sub,
  danger,
  last,
  Icon = Gear,
}: {
  title: string
  sub?: string
  danger?: boolean
  last?: boolean
  Icon?: typeof Gear
}) {
  return (
    <View style={[pv.settingsRow, !last && pv.settingsRowDivider]}>
      <View style={pv.settingsIcon}>
        <Icon
          size={20}
          color={danger ? Colors.error : Colors.textPrimary}
          weight="regular"
        />
      </View>
      <View style={pv.settingsCopy}>
        <Text style={[pv.settingsTitle, danger && pv.settingsTitleDanger]}>
          {title}
        </Text>
        {sub ? <Text style={pv.settingsSub}>{sub}</Text> : null}
      </View>
      <CaretRight size={14} color={Colors.textDisabled} weight="bold" />
    </View>
  )
}

function MockEmptyState() {
  return (
    <View style={pv.emptyWrap}>
      <Text style={pv.emptyTitle}>아직 기록이 없어요</Text>
      <Text style={pv.emptyBody}>첫 감정을 남겨 보면 여기 모여요</Text>
    </View>
  )
}

function MockNotificationRow({ unread }: { unread?: boolean }) {
  return (
    <View style={[pv.notifRow, unread && pv.notifRowUnread]}>
      {unread ? <View style={pv.notifDot} /> : <View style={pv.notifDotSpacer} />}
      <View style={pv.notifCopy}>
        <Text style={[pv.notifTitle, unread && pv.notifTitleUnread]}>
          출석 보상이 도착했어요
        </Text>
        <Text style={pv.notifSub}>방금 · 에너지 +3</Text>
      </View>
    </View>
  )
}

function MockDiaryEntryCard() {
  return (
    <View style={pv.diaryCard}>
      <MoodEmoji index={1} size={28} />
      <View style={pv.diaryCopy}>
        <Text style={pv.diaryDate}>7월 19일 · 기뻐요</Text>
        <Text style={pv.diaryPreview} numberOfLines={1}>
          오늘 산책하면서 마음이 한결 가벼워졌어요
        </Text>
        <View style={pv.tagRow}>
          <View style={pv.tagChip}>
            <Text style={pv.tagText}>산책</Text>
          </View>
          <View style={pv.tagChip}>
            <Text style={pv.tagText}>휴식</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

function MockSelectionChips() {
  const [on, setOn] = useState('우울')
  const items = ['전체', '우울', '불안', '스트레스']
  return (
    <View style={pv.chipRow}>
      {items.map((label) => {
        const selected = label === on
        return (
          <Pressable
            key={label}
            onPress={() => setOn(label)}
            style={[pv.chip, selected ? pv.chipOn : pv.chipOff]}
          >
            <Text style={[pv.chipText, selected && pv.chipTextOn]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function MockTextInput({ focused }: { focused?: boolean }) {
  return (
    <View style={[pv.inputShell, focused && pv.inputShellFocus]}>
      <Text style={focused ? pv.inputText : pv.inputPlaceholder}>
        {focused ? '하남이' : '닉네임을 입력해 주세요'}
      </Text>
    </View>
  )
}

function MockPrevNextFooter() {
  return (
    <View style={pv.prevNext}>
      <Pressable style={pv.prevBtn}>
        <Text style={pv.prevBtnText}>이전</Text>
      </Pressable>
      <Pressable style={pv.nextBtn}>
        <Text style={pv.nextBtnText}>다음</Text>
      </Pressable>
    </View>
  )
}

function MockInfoBanner() {
  return (
    <View style={pv.infoBanner}>
      <Info size={18} color={Colors.selected} weight="fill" />
      <Text style={pv.infoBannerText}>
        자가보고식 평가 결과는 참고용이며, 의학적 진단을 대체하지 않아요.
      </Text>
    </View>
  )
}

function MockAssessmentCard() {
  return (
    <View style={pv.assessCard}>
      <View style={pv.assessIcon}>
        <Moon size={22} color={Colors.cocoa} weight="regular" />
      </View>
      <View style={pv.assessCopy}>
        <Text style={pv.assessTitle}>우울 평가도구</Text>
        <Text style={pv.assessMeta}>PHQ · 9문항 · 약 3분</Text>
        <Text style={pv.assessHistory}>최근 평가 2026.07.12</Text>
      </View>
      <CaretRight size={18} color={Colors.taupe} weight="bold" />
    </View>
  )
}

function MockSeverityPills() {
  const bands = [
    { label: '정상', bg: '#E8EEE4', fg: '#6B7A5C' },
    { label: '경증', bg: '#FBECC4', fg: '#8A6B2E' },
    { label: '중등도', bg: '#F7D7B8', fg: '#8A5B44' },
    { label: '중증', bg: '#F0D0CC', fg: '#8A4A45' },
  ]
  return (
    <View style={pv.pillRow}>
      {bands.map((b) => (
        <View key={b.label} style={[pv.bandPill, { backgroundColor: b.bg }]}>
          <Text style={[pv.bandPillText, { color: b.fg }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  )
}

function MockOptionRow({ selected }: { selected?: boolean }) {
  return (
    <View style={[pv.optionRow, selected && pv.optionRowOn]}>
      <Text style={[pv.optionText, selected && pv.optionTextOn]}>
        전혀 없음
      </Text>
      {selected ? (
        <Check size={18} color={Colors.selected} weight="bold" />
      ) : null}
    </View>
  )
}

function MockSpeechBubble({ text, tip }: { text: string; tip?: boolean }) {
  return (
    <View style={pv.bubbleWrap}>
      <View style={pv.bubble}>
        {tip ? (
          <View style={pv.bubbleTipRow}>
            <Text style={pv.bubbleText}>{text}</Text>
            <X size={14} color={Colors.textDisabled} weight="bold" />
          </View>
        ) : (
          <Text style={pv.bubbleText}>{text}</Text>
        )}
      </View>
      <View style={pv.bubbleTail} />
    </View>
  )
}

function MockEnergyBar({ fill = 0.65 }: { fill?: number }) {
  return (
    <View>
      <View style={pv.energyHeader}>
        <EnergyIcon size={16} />
        <Text style={pv.energyLabel}>
          <Text style={pv.energyCurrent}>65</Text>
          <Text style={pv.energyMax}> / 100</Text>
        </Text>
      </View>
      <View style={pv.energyTrack}>
        <View style={[pv.energyFill, { width: `${fill * 100}%` }]} />
      </View>
    </View>
  )
}

function MockStockTile() {
  return (
    <View style={pv.stockTile}>
      <View style={pv.stockIconWell}>
        <PawPrint size={22} color={Colors.selected} weight="fill" />
      </View>
      <Text style={pv.stockLabel}>사료</Text>
      <Text style={pv.stockCount}>3 / 5</Text>
      <View style={pv.stockTrack}>
        <View style={[pv.stockFill, { width: '60%' }]} />
      </View>
    </View>
  )
}

function MockChatBubbles() {
  return (
    <View style={pv.chatStack}>
      <View style={pv.userBubble}>
        <Text style={pv.userBubbleText}>오늘 좀 지쳤어요</Text>
      </View>
      <View style={pv.petAnswerWrap}>
        <View style={pv.petAnswer}>
          <Text style={pv.petAnswerText}>
            그랬구나. 천천히 이야기해 줘도 괜찮아요.
          </Text>
        </View>
        <View style={pv.petAnswerTail} />
      </View>
    </View>
  )
}

function MockComposer() {
  return (
    <View style={pv.composer}>
      <Text style={pv.composerPlaceholder}>하남이에게 말해 보세요</Text>
      <View style={pv.sendBtn}>
        <CaretRight size={16} color={Colors.surface} weight="bold" />
      </View>
    </View>
  )
}

function MockMoodPicker() {
  const [sel, setSel] = useState(1)
  const labels = ['기뻐요', '슬퍼요', '화가나요', '걱정돼요', '불편해요']
  return (
    <View style={pv.moodPicker}>
      {([1, 2, 3, 4, 5] as const).map((i) => {
        const on = sel === i
        return (
          <Pressable
            key={i}
            onPress={() => setSel(i)}
            style={pv.moodItem}
          >
            <MoodEmoji index={i} size={32} />
            <Text style={[pv.moodLabel, on && pv.moodLabelOn]}>
              {labels[i - 1]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function MockMoodDistBar() {
  // 분포 바: 파스텔 8px / 범례: 이모지 + 기준색 테두리
  const segs = [
    { flex: 4, color: '#F7D7B8', label: '좋음', count: 4 },
    { flex: 3, color: '#E4EBB8', label: '보통', count: 3 },
    { flex: 2, color: '#C5DFF0', label: '힘듦', count: 2 },
  ]
  const legend = DIARY_MOODS.map((m) => ({
    id: m.id,
    label: m.shortLabel,
    emojiIndex: m.emojiIndex,
    borderColor: DIARY_MOOD_LABEL_COLOR[m.id],
    count: m.id === 'great' ? 4 : m.id === 'ok' ? 3 : m.id === 'hard' ? 2 : 0,
  }))
  return (
    <View>
      <View style={pv.distBar}>
        {segs.map((s) => (
          <View
            key={s.label}
            style={[pv.distSeg, { flex: s.flex, backgroundColor: s.color }]}
          />
        ))}
      </View>
      <View style={pv.legendRow}>
        {legend.map((item) => (
          <View key={item.id} style={pv.legendItem}>
            <View
              style={[pv.legendEmojiRing, { borderColor: item.borderColor }]}
            >
              <MoodEmoji index={item.emojiIndex} size={18} />
            </View>
            <Text style={pv.legendLabel}>
              {item.label} <Text style={pv.legendCount}>{item.count}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// —— 페이지별 미리보기 ——

export function OverviewPreviews() {
  const [checkOn, setCheckOn] = useState(true)
  return (
    <LivePreviewsBlock title="라이브 미리보기 (공용 코드)">
      <PreviewSection label="Button" first>
        <PrimaryButton label="Primary" onPress={() => {}} style={pv.gapBtn} />
        <SecondaryButton label="Secondary" onPress={() => {}} style={pv.gapBtn} />
        <GhostButton label="Ghost" onPress={() => {}} style={pv.gapBtn} />
      </PreviewSection>

      <PreviewSection label="CheckRow · ProgressDots · MoodEmoji">
        <CheckRow
          label="필수 동의 예시"
          checked={checkOn}
          onToggle={() => setCheckOn((v) => !v)}
          badge="required"
          compact
        />
        <View style={pv.gapTop}>
          <ProgressDots total={4} index={1} placement="footer" />
        </View>
        <View style={catalogStyles.moodRow}>
          {([1, 2, 3, 4, 5] as const).map((i) => (
            <MoodEmoji key={i} index={i} size={36} />
          ))}
        </View>
      </PreviewSection>

      <PreviewSection label="ScreenHeader · SelectionChip · SpeechBubble (목업)">
        <View style={pv.insetDemo}>
          <ScreenHeader title="예시 헤더" onBack={() => {}} />
        </View>
        <MockSelectionChips />
        <MockSpeechBubble text="오늘도 같이 시작해 볼까요" />
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function PriorityPreviews() {
  return (
    <LivePreviewsBlock title="우선순위 패턴 미리보기">
      <PreviewSection label="BackHeader · SurfaceCard · SettingsRow" first>
        <MockBackHeader title="가이드" right="모두 읽음" />
        <MockSurfaceCard>
          <MockSettingsRow title="이용 안내" sub="앱 사용법" Icon={Info} />
          <MockSettingsRow title="계정" sub="닉네임·복구코드" Icon={User} last />
        </MockSurfaceCard>
      </PreviewSection>
      <PreviewSection label="SelectionChip · InfoBanner · SpeechBubble">
        <MockSelectionChips />
        <MockInfoBanner />
        <MockSpeechBubble text="사료와 장난감은 최대 5개예요" tip />
      </PreviewSection>
      <PreviewSection label="AssessmentCard · EnergyBar · MoodDistBar">
        <MockAssessmentCard />
        <View style={pv.gapTop}>
          <MockEnergyBar />
        </View>
        <View style={pv.gapTop}>
          <MockMoodDistBar />
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function ChromePreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="ScreenHeader (공용)" first>
        <View style={pv.insetDemo}>
          <ScreenHeader title="스크린 헤더" onBack={() => {}} onSkip={() => {}} />
        </View>
      </PreviewSection>
      <PreviewSection label="BackHeader · TabTitleHeader">
        <MockBackHeader title="알림" right="모두 읽음" />
        <View style={pv.gapTop}>
          <MockTabTitle title="더보기" sub="계정과 이용 안내를 관리해요" />
        </View>
        <View style={[pv.homeStatus, pv.gapTop]}>
          <Text style={pv.homeStatusText}>좋은 아침이에요!</Text>
          <View style={pv.bellWrap}>
            <Bell size={20} color={Colors.textPrimary} weight="regular" />
            <View style={pv.bellDot} />
          </View>
        </View>
      </PreviewSection>
      <PreviewSection label="SoftTabBar · TabUnderline · StepProgress">
        <MockSoftTabBar />
        <View style={pv.gapTop}>
          <MockUnderlineTabs items={['콘텐츠', '검사']} active={1} />
        </View>
        <View style={pv.gapTop}>
          <MockStepProgress current={3} total={9} />
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function CardsPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="SurfaceCard · SettingsRow · SectionLabel" first>
        <Text style={pv.sectionLabel}>계정</Text>
        <MockSurfaceCard>
          <MockSettingsRow title="내 계정" Icon={User} />
          <MockSettingsRow title="데이터 관리" Icon={Gear} last />
        </MockSurfaceCard>
      </PreviewSection>
      <PreviewSection label="EmptyState · NotificationRow">
        <MockSurfaceCard>
          <MockEmptyState />
        </MockSurfaceCard>
        <View style={pv.gapTop}>
          <MockSurfaceCard>
            <MockNotificationRow unread />
            <MockNotificationRow />
          </MockSurfaceCard>
        </View>
      </PreviewSection>
      <PreviewSection label="DiaryEntryCard · ActionSheet 행">
        <MockDiaryEntryCard />
        <View style={[pv.actionSheet, pv.gapTop]}>
          <View style={pv.actionRow}>
            <Notebook size={20} color={Colors.textPrimary} />
            <Text style={pv.actionText}>수정하기</Text>
          </View>
          <View style={[pv.actionRow, pv.actionRowDanger]}>
            <WarningCircle size={20} color={Colors.error} />
            <Text style={[pv.actionText, pv.actionTextDanger]}>삭제하기</Text>
          </View>
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function FormsPreviews() {
  const [checkOn, setCheckOn] = useState(false)
  return (
    <LivePreviewsBlock>
      <PreviewSection label="Button · CheckRow (공용)" first>
        <PrimaryButton label="감정 기록하기" onPress={() => {}} style={pv.gapBtn} />
        <SecondaryButton label="나중에" onPress={() => {}} style={pv.gapBtn} />
        <CheckRow
          label="만 14세 이상입니다"
          checked={checkOn}
          onToggle={() => setCheckOn((v) => !v)}
          badge="required"
          compact
        />
      </PreviewSection>
      <PreviewSection label="SelectionChip · TextInputShell">
        <MockSelectionChips />
        <Text style={[pv.sectionLabel, pv.gapTop]}>닉네임</Text>
        <MockTextInput />
        <View style={pv.gapTop}>
          <MockTextInput focused />
        </View>
      </PreviewSection>
      <PreviewSection label="ChatComposer · PrevNextFooter · DangerLink">
        <MockComposer />
        <View style={pv.gapTop}>
          <MockPrevNextFooter />
        </View>
        <Pressable style={pv.dangerLink}>
          <Text style={pv.dangerLinkText}>하남이와 헤어질래요</Text>
        </Pressable>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function MindPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="InfoBanner · AssessmentCard" first>
        <MockInfoBanner />
        <View style={pv.gapTop}>
          <MockAssessmentCard />
        </View>
      </PreviewSection>
      <PreviewSection label="SeverityBandPill · OptionRow">
        <MockSeverityPills />
        <View style={pv.gapTop}>
          <MockOptionRow selected />
          <MockOptionRow />
        </View>
      </PreviewSection>
      <PreviewSection label="Featured · ContentVideoRow (목업)">
        <View style={pv.featured}>
          <View style={pv.featuredBadge}>
            <Text style={pv.featuredBadgeText}>오늘의 추천</Text>
          </View>
          <Text style={pv.featuredTitle}>호흡으로 마음 가라앉히기</Text>
          <Text style={pv.featuredMeta}>3:24 · 명상</Text>
        </View>
        <View style={[pv.videoRow, pv.gapTop]}>
          <View style={pv.videoThumb}>
            <Text style={pv.videoDur}>5:12</Text>
          </View>
          <View style={pv.videoCopy}>
            <Text style={pv.videoTitle}>불안할 때 쓰는 그라운딩</Text>
            <Text style={pv.videoMeta}>마음 콘텐츠 · 조회 128</Text>
          </View>
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function PetPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="SpeechBubble · LevelEnergyBar" first>
        <MockSpeechBubble text="오늘도 같이 시작해 볼까요" />
        <View style={pv.gapTop}>
          <MockEnergyBar fill={0.72} />
        </View>
      </PreviewSection>
      <PreviewSection label="StockTile · TodayGainChip · EnergyReward">
        <View style={pv.stockRow}>
          <MockStockTile />
          <View style={pv.stockTile}>
            <View style={[pv.stockIconWell, { backgroundColor: Colors.iconToy }]}>
              <Smiley size={22} color={Colors.selected} weight="fill" />
            </View>
            <Text style={pv.stockLabel}>장난감</Text>
            <Text style={pv.stockCount}>0 / 5</Text>
            <View style={pv.stockTrack}>
              <View style={[pv.stockFill, { width: '0%' }]} />
            </View>
          </View>
        </View>
        <View style={[pv.chipRow, pv.gapTop]}>
          <View style={pv.gainChip}>
            <EnergyIcon size={12} />
            <Text style={pv.gainChipText}>오늘 +12 / 30</Text>
          </View>
          <View style={pv.rewardPill}>
            <EnergyIcon size={12} />
            <Text style={pv.rewardPillText}>+3 에너지</Text>
          </View>
        </View>
        <View style={[pv.doneBadge, pv.gapTop]}>
          <CheckCircle size={16} color={Colors.selected} weight="fill" />
          <Text style={pv.doneBadgeText}>오늘 출석 완료!</Text>
        </View>
      </PreviewSection>
      <PreviewSection label="CareStockCard (목업)">
        <View style={pv.careRow}>
          <View style={pv.careCard}>
            <Text style={pv.careLabel}>밥 주기</Text>
            <Text style={pv.careCount}>×3</Text>
          </View>
          <View style={[pv.careCard, pv.careCardMuted]}>
            <Text style={[pv.careLabel, pv.careLabelMuted]}>장난감 받기</Text>
            <Text style={[pv.careCount, pv.careLabelMuted]}>비었어요</Text>
          </View>
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function ChatPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="HelpContactsBanner (공용)" first>
        <HelpContactsBanner />
      </PreviewSection>
      <PreviewSection label="ChatBubble · RestTip · EnergyDepleted">
        <MockChatBubbles />
        <View style={[pv.restTip, pv.gapTop]}>
          <Text style={pv.restTipTitle}>잠깐 쉬어가요</Text>
          <Text style={pv.restTipBody}>
            에너지가 부족해요. 출석·일기로 에너지를 모아 보세요.
          </Text>
        </View>
        <View style={[pv.depletedPill, pv.gapTop]}>
          <View style={pv.depletedDot} />
          <Text style={pv.depletedText}>에너지 소진</Text>
        </View>
      </PreviewSection>
      <PreviewSection label="ChatComposer · PrimaryCallCard">
        <MockComposer />
        <View style={[pv.callCard, pv.gapTop]}>
          <Text style={pv.callTitle}>하남시 정신건강복지센터</Text>
          <Text style={pv.callMeta}>031-790-6425 · 평일 09–18시</Text>
          <View style={pv.callCta}>
            <Phone size={16} color={Colors.surface} weight="fill" />
            <Text style={pv.callCtaText}>전화하기</Text>
          </View>
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function DiaryPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="MoodEmoji · DiaryMoodPicker" first>
        <MockMoodPicker />
      </PreviewSection>
      <PreviewSection label="MoodDistBar · MonthFeedback">
        <MockMoodDistBar />
        <Text style={pv.feedback}>
          이번 달은 좋은 날이 조금 더 많았어요. 그 흐름을 가볍게 이어가 봐요.
        </Text>
      </PreviewSection>
      <PreviewSection label="DiaryEntryCard · DiaryWriteCTA">
        <MockDiaryEntryCard />
        <Pressable style={[pv.writeCta, pv.gapTop]}>
          <Plus size={18} color={Colors.surface} weight="bold" />
          <Text style={pv.writeCtaText}>감정 기록하기</Text>
        </Pressable>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

export function SettingsPreviews() {
  return (
    <LivePreviewsBlock>
      <PreviewSection label="SettingsGroupCard · SettingsRow" first>
        <MockTabTitle title="더보기" sub="계정과 이용 안내를 관리해요" />
        <MockSurfaceCard>
          <MockSettingsRow title="내 계정" sub="닉네임 변경" Icon={User} />
          <MockSettingsRow title="이용 안내" Icon={Info} />
          <MockSettingsRow
            title="로그아웃"
            danger
            Icon={WarningCircle}
            last
          />
        </MockSurfaceCard>
      </PreviewSection>
      <PreviewSection label="DangerActionCard · NicknameForm">
        <View style={pv.dangerCard}>
          <Text style={pv.dangerCardTitle}>검사 기록을 모두 지울까요?</Text>
          <Text style={pv.dangerCardBody}>
            삭제하면 되돌릴 수 없어요. 신중히 선택해 주세요.
          </Text>
          <Pressable style={pv.dangerCta}>
            <Text style={pv.dangerCtaText}>모두 삭제하기</Text>
          </Pressable>
        </View>
        <Text style={[pv.sectionLabel, pv.gapTop]}>닉네임</Text>
        <MockTextInput focused />
      </PreviewSection>
      <PreviewSection label="RestoreCodeCard (목업)">
        <View style={pv.restoreCard}>
          <View style={pv.restorePet}>
            <PawPrint size={28} color={Colors.selected} weight="fill" />
          </View>
          <Text style={pv.restoreLabel}>복구 코드</Text>
          <Text style={pv.restoreCode}>HN-7K2M-9P4Q</Text>
          <Text style={pv.restoreHint}>안전한 곳에 보관해 주세요</Text>
        </View>
      </PreviewSection>
    </LivePreviewsBlock>
  )
}

const pv = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionFirst: {
    marginTop: 0,
  },
  gapBtn: {
    marginBottom: 8,
  },
  gapTop: {
    marginTop: 12,
  },
  insetDemo: {
    marginHorizontal: -4,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 8,
  },
  backHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  backHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  backHeaderRight: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.selected,
  },
  tabTitleWrap: {
    marginBottom: 4,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tabSub: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  homeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bellWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  underlineRow: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  underlineItem: {
    paddingBottom: 10,
  },
  underlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  underlineTextOn: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  underlineBar: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.selected,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  tabBarLabelOn: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stepWrap: {
    gap: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  stepTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.sand,
    overflow: 'hidden',
  },
  stepFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.selected,
  },
  surfaceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingsRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  settingsIcon: {
    width: 28,
    marginRight: 10,
    alignItems: 'center',
  },
  settingsCopy: {
    flex: 1,
    gap: 2,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingsTitleDanger: {
    color: Colors.error,
  },
  settingsSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyWrap: {
    paddingVertical: 28,
    paddingHorizontal: Layout.cardPaddingH,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  notifRowUnread: {
    backgroundColor: Colors.creamyBeige,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  notifDotSpacer: {
    width: 8,
    marginRight: 10,
  },
  notifCopy: {
    flex: 1,
    gap: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notifSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  diaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 14,
    ...Shadows.elevation,
  },
  diaryCopy: {
    flex: 1,
    gap: 4,
  },
  diaryDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  diaryPreview: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionSheet: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionTextDanger: {
    color: Colors.error,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipOn: {
    backgroundColor: Colors.selected,
    borderColor: Colors.selected,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextOn: {
    color: Colors.surface,
  },
  inputShell: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputShellFocus: {
    borderColor: Colors.selected,
  },
  inputPlaceholder: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  inputText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  prevNext: {
    flexDirection: 'row',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nextBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.surface,
  },
  dangerLink: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  dangerLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  assessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 16,
    ...Shadows.elevation,
  },
  assessIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessCopy: {
    flex: 1,
  },
  assessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  assessMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  assessHistory: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bandPill: {
    paddingHorizontal: Layout.headerPaddingH,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bandPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: Layout.cardPaddingH,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: 8,
  },
  optionRowOn: {
    borderColor: Colors.selected,
    backgroundColor: Colors.creamyBeige,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTextOn: {
    fontWeight: '800',
  },
  featured: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: Colors.selected,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.surface,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 4,
  },
  featuredMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  videoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  videoThumb: {
    width: 72,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.sand,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 6,
  },
  videoDur: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.surface,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  videoCopy: {
    flex: 1,
    gap: 4,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  videoMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  bubbleWrap: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '92%',
    ...Shadows.elevation,
  },
  bubbleTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
    textAlign: 'center',
  },
  bubbleTail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 14,
  },
  energyCurrent: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  energyMax: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textDisabled,
  },
  energyTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.energyFill,
  },
  stockRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stockTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  stockIconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.iconFeed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stockLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stockCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stockTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.energyTrack,
    overflow: 'hidden',
    marginTop: 4,
  },
  stockFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  gainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  gainChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rewardPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.creamyBeige,
    paddingHorizontal: Layout.headerPaddingH,
    paddingVertical: 8,
    borderRadius: 999,
  },
  doneBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.selected,
  },
  careRow: {
    flexDirection: 'row',
    gap: 10,
  },
  careCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1.5,
    borderColor: Colors.selected,
    paddingVertical: 12,
    gap: 4,
  },
  careCardMuted: {
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    opacity: 0.85,
  },
  careLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.selected,
  },
  careLabelMuted: {
    color: Colors.textDisabled,
  },
  careCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chatStack: {
    gap: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: Colors.accentSoft,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubbleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  petAnswerWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  petAnswer: {
    backgroundColor: Colors.cardRecessed,
    borderRadius: 20,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  petAnswerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  petAnswerTail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.cardRecessed,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
  restTip: {
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restTipTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  restTipBody: {
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  depletedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Layout.headerPaddingH,
    paddingVertical: 6,
    borderRadius: 999,
  },
  depletedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textDisabled,
  },
  depletedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(94, 64, 51, 0.1)',
  },
  composerPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 16,
    ...Shadows.elevation,
  },
  callTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  callMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  callCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minHeight: 44,
  },
  callCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.surface,
  },
  moodPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  moodLabelOn: {
    color: Colors.selected,
    fontWeight: '800',
  },
  distBar: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: Colors.sand,
  },
  distSeg: {
    height: '100%',
    minWidth: 4,
  },
  legendRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendEmojiRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  legendCount: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  feedback: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dangerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 16,
  },
  dangerCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  dangerCardBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  dangerCta: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.surface,
  },
  restoreCard: {
    alignItems: 'center',
    backgroundColor: Colors.creamyBeige,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restorePet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  restoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  restoreCode: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  restoreHint: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  writeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    ...Shadows.elevation,
  },
  writeCtaText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.surface,
  },
})
