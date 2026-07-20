import { TypeStyle } from './Typography'

/**
 * 화면 레이아웃 공통 간격.
 * 헤더↔본문 여백은 headerContentGap 하나로만 잡는다.
 * (헤더 paddingBottom에 두고, 본문 paddingTop은 0에 가깝게)
 */
export const Layout = {
  /** 화면 좌우 여백 */
  screenPaddingH: 20,
  /** 헤더 상단 (세이프에리어 아래) */
  headerPaddingTop: 8,
  /**
   * 헤더 하단 → 본문 첫 요소까지.
   * ScreenHeader · 탭 타이틀 · 서브스크린 헤더 공통.
   */
  headerContentGap: 20,
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
