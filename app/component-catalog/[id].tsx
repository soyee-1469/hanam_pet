/**
 * 컴포넌트 카탈로그 상세 — /component-catalog/[id]
 * 상단: 라이브/미니 목업 · 하단: 피그마 후보 인벤토리
 */
import type { ReactNode } from 'react'
import { View, Text } from 'react-native'
import { Redirect, useLocalSearchParams } from 'expo-router'
import { Info } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import {
  CATALOG_PAGES,
  CARDS_CANDIDATES,
  CARDS_EXISTING,
  CHAT_CANDIDATES,
  CHAT_EXISTING,
  CHROME_CANDIDATES,
  CHROME_EXISTING,
  DIARY_CANDIDATES,
  DIARY_EXISTING,
  FORMS_CANDIDATES,
  FORMS_EXISTING,
  MIND_CANDIDATES,
  MIND_EXISTING,
  PET_CANDIDATES,
  PET_EXISTING,
  PRIORITY,
  SETTINGS_CANDIDATES,
  SETTINGS_EXISTING,
  SETTINGS_FIGMA_BUILD_ORDER,
  isCatalogPageId,
  type CatalogPageId,
  type CandidateItem,
  type ExistingItem,
} from '../../components/component-catalog/data'
import {
  CatalogPageShell,
  InventoryBlock,
  styles,
} from '../../components/component-catalog/ui'
import {
  CardsPreviews,
  ChatPreviews,
  ChromePreviews,
  DiaryPreviews,
  FormsPreviews,
  MindPreviews,
  OverviewPreviews,
  PetPreviews,
  PriorityPreviews,
  SettingsPreviews,
} from '../../components/component-catalog/previews'

function Intro({ children }: { children: string }) {
  return (
    <View style={styles.intro}>
      <Info size={18} color={Colors.selected} weight="bold" />
      <Text style={styles.introText}>{children}</Text>
    </View>
  )
}

function OverviewBody() {
  return (
    <>
      <Intro>
        실제 앱 화면을 기준으로, 피그마에서 컴포넌트화하면 좋은 UI를 도메인별로
        모았어요. 위는 그려진 미리보기, 아래·다른 페이지는 이름·경로 인벤토리예요.
      </Intro>
      <OverviewPreviews />
    </>
  )
}

function PriorityBody() {
  return (
    <>
      <Intro>
        반복 등장·시각적 독립성 기준으로, 피그마에서 먼저 만들면 좋은 순서입니다.
        위 미리보기로 패턴을 보고, 아래 목록에서 이름을 확인하세요.
      </Intro>
      <PriorityPreviews />
      <Text style={[styles.blockTitle, { marginTop: 8 }]}>추천 순서</Text>
      <View style={styles.priorityCard}>
        {PRIORITY.map((item, i) => (
          <View key={item.name} style={styles.priorityRow}>
            <Text style={styles.priorityNum}>{i + 1}</Text>
            <View style={styles.priorityBody}>
              <Text style={styles.priorityText}>{item.name}</Text>
              <Text style={styles.priorityWhy}>{item.why}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  )
}

function ThemePage({
  intro,
  previews,
  existing,
  candidates,
}: {
  intro: string
  previews: ReactNode
  existing?: ExistingItem[]
  candidates?: CandidateItem[]
}) {
  return (
    <>
      <Intro>{intro}</Intro>
      {previews}
      <Text style={[styles.blockTitle, { marginTop: 4 }]}>후보 · 경로</Text>
      <InventoryBlock existing={existing} candidates={candidates} />
    </>
  )
}

function PageBody({ pageId }: { pageId: CatalogPageId }) {
  switch (pageId) {
    case 'overview':
      return <OverviewBody />
    case 'priority':
      return <PriorityBody />
    case 'chrome':
      return (
        <ThemePage
          intro="헤더·탭바·진행 바·세그먼트 탭 등 화면 크롬 패턴이에요."
          previews={<ChromePreviews />}
          existing={CHROME_EXISTING}
          candidates={CHROME_CANDIDATES}
        />
      )
    case 'cards':
      return (
        <ThemePage
          intro="흰 서피스 카드와 설정·알림·일기 등 리스트 행 패턴이에요. SurfaceCard·SettingsRow는 공용 컴포넌트예요."
          previews={<CardsPreviews />}
          existing={CARDS_EXISTING}
          candidates={CARDS_CANDIDATES}
        />
      )
    case 'forms':
      return (
        <ThemePage
          intro="버튼·체크·칩·입력·푸터 CTA — 선택 칩은 selected 브라운이에요."
          previews={<FormsPreviews />}
          existing={FORMS_EXISTING}
          candidates={FORMS_CANDIDATES}
        />
      )
    case 'mind':
      return (
        <ThemePage
          intro="마음 탭 배너·검사 카드·심각도·영상 행을 그려 두었어요."
          previews={<MindPreviews />}
          existing={MIND_EXISTING}
          candidates={MIND_CANDIDATES}
        />
      )
    case 'pet':
      return (
        <ThemePage
          intro="말풍선·에너지(옐로)·스톡·출석 보상 등 펫 홈·보관함 패턴이에요."
          previews={<PetPreviews />}
          existing={PET_EXISTING}
          candidates={PET_CANDIDATES}
        />
      )
    case 'chat':
      return (
        <ThemePage
          intro="버블·도움 배너·컴포저·상담 전화 카드 — 도움 배너는 공용 컴포넌트예요."
          previews={<ChatPreviews />}
          existing={CHAT_EXISTING}
          candidates={CHAT_CANDIDATES}
        />
      )
    case 'diary':
      return (
        <ThemePage
          intro="감정 선택기·분포 바(파스텔)·일기 카드·기록 CTA예요."
          previews={<DiaryPreviews />}
          existing={DIARY_EXISTING}
          candidates={DIARY_CANDIDATES}
        />
      )
    case 'settings':
      return (
        <>
          <ThemePage
            intro="설정은 컴포넌트 먼저 → 화면 조립 순서로 갑니다. 아래는 실제 공용 UI 미리보기예요."
            previews={<SettingsPreviews />}
            existing={SETTINGS_EXISTING}
            candidates={SETTINGS_CANDIDATES}
          />
          <Text style={[styles.blockTitle, { marginTop: 8 }]}>
            피그마 빌드 순서 (설정)
          </Text>
          <View style={styles.priorityCard}>
            {SETTINGS_FIGMA_BUILD_ORDER.map((item) => (
              <View key={item.step} style={styles.priorityRow}>
                <Text style={styles.priorityNum}>{item.step}</Text>
                <View style={styles.priorityBody}>
                  <Text style={styles.priorityText}>
                    [{item.status}] {item.name}
                  </Text>
                  <Text style={styles.priorityWhy}>{item.note}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )
  }
}

export default function ComponentCatalogPageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const pageId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''

  if (pageId === 'chrome-existing' || pageId === 'chrome-candidates') {
    return (
      <Redirect
        href={
          pageId === 'chrome-existing'
            ? '/component-catalog/chrome'
            : '/component-catalog/cards'
        }
      />
    )
  }

  if (!pageId || !isCatalogPageId(pageId)) {
    return <Redirect href="/component-catalog" />
  }

  const meta = CATALOG_PAGES.find((page) => page.id === pageId)!

  return (
    <CatalogPageShell pageId={pageId} title={meta.title}>
      <PageBody pageId={pageId} />
    </CatalogPageShell>
  )
}
