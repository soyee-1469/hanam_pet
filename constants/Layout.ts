import { TypeStyle } from './Typography'

/**
 * 화면·컴포넌트 공통 간격.
 *
 * 스케일 (가로)
 * - headerPaddingH  12  헤더 좌우 (뒤로 버튼 hit area)
 * - cardPaddingH    16  카드·리스트 행·칩·배너 내부
 * - rowMinHeight    56  SettingsRow 최소 높이
 * - screenPaddingH  20  화면 좌우
 *
 * 스케일 (세로)
 * - headerPaddingTop      8
 * - sectionGap           12  섹션·행 간
 * - blockGap             16  카드 내부 블록 간
 * - headerContentGap     20  헤더 → 본문 (헤더 paddingBottom에만)
 * - sectionGapLg         20  큰 블록 간
 * - spaceXl / contentPaddingBottom  24  하단·와이드 인셋
 *
 * 규칙
 * - 헤더↔본문 여백은 headerContentGap 하나로만 (본문 paddingTop ≈ 0)
 * - 카드/행 내부 좌우는 cardPaddingH (16·18 혼재 금지)
 * - 화면 좌우는 screenPaddingH
 */
export const Layout = {
  /** 화면 좌우 여백 */
  screenPaddingH: 20,
  /** 헤더 좌우 (뒤로 버튼·타이틀 슬롯) */
  headerPaddingH: 12,
  /** 헤더 상단 (세이프에리어 아래) */
  headerPaddingTop: 8,
  /**
   * 헤더 하단 → 본문 첫 요소까지.
   * ScreenHeader · 탭 타이틀 · 서브스크린 헤더 공통.
   */
  headerContentGap: 20,

  /** 카드·리스트 행·칩 그룹·배너 내부 좌우 */
  cardPaddingH: 16,
  /** 설정·내비 SettingsRow 최소 높이 */
  rowMinHeight: 56,
  /** 섹션·행 사이 기본 간격 */
  sectionGap: 12,
  /** 카드 내부 블록 간격 */
  blockGap: 16,
  /** 큰 섹션·스크롤 블록 간격 */
  sectionGapLg: 20,
  /**
   * 스케일 최대 스텝 (24).
   * 스크롤·폼 하단, 온보딩 스테이지 와이드 인셋 등.
   */
  spaceXl: 24,
  /** 스크롤·폼 하단 여유 — spaceXl과 동일 */
  contentPaddingBottom: 24,

  /**
   * 하단 탭 바 콘텐츠 높이 (세이프에리어·extra pad 제외).
   * 전체 높이 = tabBarContentHeight + max(bottom, 8) + tabBarExtraBottom
   */
  tabBarContentHeight: 68,
  /** 탭 바 하단 추가 패딩 (홈 인디케이터 여유) */
  tabBarExtraBottom: 5,
  /** 화면 내 언더라인 탭 메뉴 — 상·하 패딩 */
  tabMenuPaddingTop: 3,
  tabMenuPaddingBottom: 14,
} as const

/** 헤더 타이틀 타이포 — ScreenHeader·탭 루트·서브화면 공통 */
export const HeaderTitleStyle = {
  /** 뒤로가기·가운데 정렬 서브화면 (알림, 출석, 대화 등) */
  screen: TypeStyle.screenTitle,
  /** 탭 루트 (마음챙김, 마음일기, 설정 등) */
  tab: TypeStyle.tabTitle,
} as const

/** absolute 탭 바 위 콘텐츠 예약 높이 */
export function tabBarReserveHeight(safeBottom: number) {
  return (
    Layout.tabBarContentHeight +
    Math.max(safeBottom, 8) +
    Layout.tabBarExtraBottom
  )
}
