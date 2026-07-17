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
} as const
