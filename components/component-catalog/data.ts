/**
 * 개발용 피그마 컴포넌트 후보 인벤토리.
 * 실제 앱 화면(`app/`)·공용 UI(`components/`) 기준으로 추림.
 */

export type ExistingItem = {
  /** 피그마에도 둘 공용 컴포넌트 이름 (한글 / English) */
  name: string
  path: string
  note: string
}

export type CandidateItem = {
  /** 제안 피그마 컴포넌트 이름 (한글 / English) */
  name: string
  /** variants · 등장 맥락 */
  note: string
  /** 화면 라우트 또는 파일 경로 */
  paths: string[]
}

export type CatalogPageId =
  | 'overview'
  | 'priority'
  | 'chrome'
  | 'cards'
  | 'forms'
  | 'mind'
  | 'pet'
  | 'chat'
  | 'diary'
  | 'settings'

export type CatalogPageMeta = {
  id: CatalogPageId
  title: string
  subtitle: string
}

export const CATALOG_PAGES: CatalogPageMeta[] = [
  {
    id: 'overview',
    title: '개요 · 라이브 미리보기',
    subtitle: '공용 UI + 대표 패턴 라이브 미리보기',
  },
  {
    id: 'priority',
    title: '추천 우선순위',
    subtitle: '핵심 패턴 미리보기 + 추천 순서',
  },
  {
    id: 'chrome',
    title: '크롬 · 헤더/네비',
    subtitle: '헤더·탭바·진행 미리보기',
  },
  {
    id: 'cards',
    title: '카드 · 리스트 로우',
    subtitle: '서피스·빈 상태·행 미리보기',
  },
  {
    id: 'forms',
    title: '폼 · CTA · 칩',
    subtitle: '버튼·칩·입력·푸터 미리보기',
  },
  {
    id: 'mind',
    title: '마음 검사 · 콘텐츠',
    subtitle: '배너·검사 카드·심각도 미리보기',
  },
  {
    id: 'pet',
    title: '펫 · 홈 · 보관함',
    subtitle: '말풍선·에너지·스톡 미리보기',
  },
  {
    id: 'chat',
    title: '채팅 · 도움',
    subtitle: '버블·도움 배너·컴포저 미리보기',
  },
  {
    id: 'diary',
    title: '감정 일기',
    subtitle: '감정 선택·분포 바·CTA 미리보기',
  },
  {
    id: 'settings',
    title: '설정 · 계정',
    subtitle: '설정 행·위험 CTA·복구코드 미리보기',
  },
]

/** 피그마에서 먼저 만들 추천 순서 */
export const PRIORITY: { name: string; why: string }[] = [
  {
    name: '뒤로가기 헤더 / BackHeader',
    why: '20+ 화면에서 동일 패턴 — ScreenHeader와 한 세트로',
  },
  {
    name: '서피스 카드 / SurfaceCard',
    why: '설정·가이드·출석·알림·일기 등 기본 면',
  },
  {
    name: '섹션 라벨 + 빈 상태 / SectionLabel · EmptyState',
    why: '카드 위 라벨·목록 없음이 전역 반복',
  },
  {
    name: '선택·필터 칩 / SelectionChip',
    why: '마음·알림·프로필 — Off/On(Colors.selected)',
  },
  {
    name: '정보 배너 / InfoBanner',
    why: '검사 탭·가이드·리포트 creamyBeige 안내',
  },
  {
    name: '검사 카드 + 심각도 필 / AssessmentCard · SeverityBandPill',
    why: '마음 검사 플로우의 핵심 비주얼',
  },
  {
    name: '설정·내비 행 / SettingsRow',
    why: '더보기·가이드·지원 — 아이콘+제목+Caret',
  },
  {
    name: '펫 말풍선 / SpeechBubble',
    why: '홈·채팅·펫선택·일기완료·온보딩',
  },
  {
    name: '스톡 타일 + 에너지 바 / StockTile · EnergyBar',
    why: '홈·보관함 돌봄·레벨 UI',
  },
  {
    name: '감정 선택기 + 분포 바 / DiaryMoodPicker · MoodDistBar',
    why: '일기 작성·월간 요약의 대표 패턴',
  },
]

// ─── 3. 크롬 · 헤더/네비 ─────────────────────────────────────────

export const CHROME_EXISTING: ExistingItem[] = [
  {
    name: '스크린 헤더 / ScreenHeader',
    path: 'components/ui/ScreenHeader.tsx',
    note: '뒤로 + 제목 + 건너뛰기/우측 슬롯 · 온보딩·탈퇴·카탈로그',
  },
  {
    name: '앱 뷰포트 / AppViewport',
    path: 'components/AppViewport.tsx',
    note: '반응형 뷰포트 래퍼',
  },
  {
    name: '토스트 / ToastHost',
    path: 'components/ToastHost.tsx',
    note: '하단 토스트 · 전역 _layout',
  },
  {
    name: '오버레이 셸 / CenterDialog · BottomSheet',
    path: 'components/ui/AppOverlay.tsx',
    note: '중앙 다이얼로그 · 바텀시트 + 스크림',
  },
  {
    name: '확인 다이얼로그 / ConfirmDialog',
    path: 'components/ui/ConfirmDialog.tsx',
    note: '일기 삭제·검사 이탈·데이터 관리 등',
  },
  {
    name: '채팅 탭 아이콘 / ChatTabIcon',
    path: 'components/ChatTabIcon.tsx',
    note: '하단 탭바 채팅 슬롯 커스텀 아이콘',
  },
]

export const CHROME_CANDIDATES: CandidateItem[] = [
  {
    name: '뒤로가기 헤더 / BackHeader',
    note: 'CaretLeft+제목 인라인 복제. ScreenHeader와 한 피그마 세트로. variants: 제목만 / 우측 슬롯(「모두 읽음」) / 이중 타이틀(검사)',
    paths: [
      'app/guide.tsx',
      'app/support.tsx',
      'app/account.tsx',
      'app/data-manage.tsx',
      'app/mind-check*.tsx',
      'app/mind-report.tsx',
      'app/diary-*.tsx',
      'app/notifications.tsx',
      'app/attendance.tsx',
      'app/storage.tsx',
      '…외 다수',
    ],
  },
  {
    name: '탭 타이틀 헤더 / TabTitleHeader',
    note: '탭 상단 제목(±서브) — 더보기·일기·마음',
    paths: [
      'app/(tabs)/more.tsx',
      'app/(tabs)/diary.tsx',
      'app/(tabs)/mind.tsx',
    ],
  },
  {
    name: '홈 상태 헤더 / HomeStatusHeader',
    note: '상태 카피 + 알림 벨(뱃지 닷)',
    paths: ['app/(tabs)/index.tsx'],
  },
  {
    name: '소프트 탭바 / SoftTabBar',
    note: 'active(primary)·idle · ChatTabIcon 포함',
    paths: ['app/(tabs)/_layout.tsx'],
  },
  {
    name: '탭 아이콘 아이템 / TabIconItem',
    note: '아이콘+라벨 · focused fill/light',
    paths: ['app/(tabs)/_layout.tsx'],
  },
  {
    name: '검사 진행 헤더 / StepProgressHeader',
    note: 'N/total + 트랙 바',
    paths: ['app/mind-check.tsx'],
  },
  {
    name: '언더라인 세그먼트 탭 / TabUnderline',
    note: '콘텐츠|검사 · 에너지|아이템 · 검사 종류. selected underline',
    paths: [
      'app/(tabs)/mind.tsx',
      'app/storage.tsx',
      'app/mind-report.tsx',
    ],
  },
]

// ─── 4. 카드 · 리스트 로우 ───────────────────────────────────────

export const CARDS_CANDIDATES: CandidateItem[] = [
  {
    name: '서피스 카드 / SurfaceCard',
    note: 'white · radius≈20 · divider · elevation. variants: 단독 / 행 스택 컨테이너',
    paths: [
      'app/(tabs)/more.tsx',
      'app/guide.tsx',
      'app/support.tsx',
      'app/data-manage.tsx',
      'app/mind-records.tsx',
      'app/mind-report.tsx',
      'app/diary-list.tsx',
      'app/notifications.tsx',
      'app/attendance.tsx',
    ],
  },
  {
    name: '섹션 라벨 / SectionLabel',
    note: '카드·폼 위 작은 cocoa 라벨',
    paths: [
      'app/mind-check-intro.tsx',
      'app/mind-check-guide.tsx',
      'app/mind-report.tsx',
      'app/data-manage.tsx',
      'app/guide.tsx',
      'app/support.tsx',
      'app/diary-write.tsx',
      'app/notifications.tsx',
    ],
  },
  {
    name: '빈 상태 / EmptyState',
    note: '단문 / 아이콘+제목+본문 / +CTA',
    paths: [
      'app/diary-list.tsx',
      'app/notifications.tsx',
      'app/mind-report.tsx',
      'app/storage.tsx',
      'app/mind-content.tsx',
      'app/guide-doc.tsx',
      'app/(tabs)/mind.tsx',
    ],
  },
  {
    name: '설정·내비 행 / SettingsRow',
    note: '아이콘+제목(+서브)+CaretRight. variants: default / danger. more.tsx에 로컬 정의',
    paths: [
      'app/(tabs)/more.tsx',
      'app/guide.tsx',
      'app/support.tsx',
      'app/onboarding/resume.tsx',
    ],
  },
  {
    name: '알림 행 / NotificationRow',
    note: 'unread(닷·강조) / read',
    paths: ['app/notifications.tsx'],
  },
  {
    name: '알림 상세 카드 / NotificationDetailCard',
    note: '전체 페이지 상세 본문 (제목·날짜·본문·바로가기)',
    paths: ['app/notification-detail.tsx'],
  },
  {
    name: '일기 목록 카드 / DiaryEntryCard',
    note: 'MoodEmoji + 날짜 아래 감정·태그 + 미리보기',
    paths: ['app/diary-list.tsx'],
  },
  {
    name: '출석 히어로 카드 / AttendanceHeroCard',
    note: 'stamped / unstamped 펫 표정',
    paths: ['app/attendance.tsx'],
  },
  {
    name: '출석 캘린더 카드 / AttendanceCalendarCard',
    note: 'stamp disk · empty · today · future + 범례',
    paths: ['app/attendance.tsx'],
  },
  {
    name: '보관함 이력 행 / StockHistoryRow',
    note: 'collapsed / expanded · ±delta(energy vs item)',
    paths: ['app/storage.tsx'],
  },
  {
    name: '액션 시트 메뉴 / ActionSheetMenu',
    note: 'BottomSheet 안 아이콘+제목 액션 행',
    paths: [
      'app/diary-list.tsx',
      'app/diary-detail.tsx',
      'app/(tabs)/mind.tsx',
      'app/(tabs)/index.tsx',
      'app/onboarding/resume.tsx',
    ],
  },
  {
    name: '데이터 항목 행 / DataItemRow',
    note: '라벨 + 값/카운트',
    paths: ['app/data-manage.tsx'],
  },
]

// ─── 5. 폼 · CTA · 칩 ────────────────────────────────────────────

export const FORMS_EXISTING: ExistingItem[] = [
  {
    name: 'Primary / Secondary / Ghost 버튼',
    path: 'components/ui/Button.tsx',
    note: 'CTA 패밀리 · disabled · onDisabledPress',
  },
  {
    name: '약관 체크 행 / CheckRow',
    path: 'components/ui/CheckRow.tsx',
    note: 'required/optional · compact · detail arrow',
  },
  {
    name: '온보딩 하트 진행 / ProgressDots',
    path: 'components/ui/ProgressDots.tsx',
    note: 'N/total · footer/header · popLast',
  },
  {
    name: '투어 닷 / TourDots',
    path: 'components/ui/TourDots.tsx',
    note: '온보딩 투어 인디케이터 + footer 패딩',
  },
  {
    name: '약관 시트 / TermsSheet',
    path: 'components/ui/TermsSheet.tsx',
    note: '약관 상세 바텀시트',
  },
]

export const FORMS_CANDIDATES: CandidateItem[] = [
  {
    name: '선택·필터 칩 / SelectionChip',
    note: 'Off 연한 면 / On Colors.selected (오렌지 금지). 마음 필터·알림·프로필 연령·성별',
    paths: [
      'app/(tabs)/mind.tsx',
      'app/notifications.tsx',
      'app/onboarding/profile.tsx',
    ],
  },
  {
    name: '일기 원인 태그 칩 / DiaryTagChip',
    note: 'selected / expand caret · wrap 레이아웃',
    paths: ['app/diary-write.tsx'],
  },
  {
    name: '텍스트 입력 셸 / TextInputShell',
    note: 'idle / focus(primary) / error / filled',
    paths: [
      'app/onboarding/profile.tsx',
      'app/account.tsx',
      'app/onboarding/pet-select.tsx',
    ],
  },
  {
    name: '멀티라인 노트 / DiaryNoteField',
    note: '본문 입력 + 카운터 N/max',
    paths: ['app/diary-write.tsx'],
  },
  {
    name: '채팅 컴포저 / ChatComposer',
    note: 'idle / focused / send active·disabled / tour highlight',
    paths: ['app/(tabs)/chat.tsx'],
  },
  {
    name: '이전·다음 푸터 / PrevNextFooter',
    note: '이전 / 다음·결과 보기 · disabled toast',
    paths: ['app/mind-check.tsx'],
  },
  {
    name: '위험 텍스트 링크 / DangerTextLink',
    note: '「하남이와 헤어질래요」류 ghost danger',
    paths: ['app/withdraw.tsx'],
  },
]

// ─── 6. 마음 검사 · 콘텐츠 ───────────────────────────────────────

export const MIND_EXISTING: ExistingItem[] = [
  {
    name: '유튜브 재생 모달 / YouTubeVideoModal',
    path: 'components/YouTubeVideoModal.tsx',
    note: '마음 탭·콘텐츠 상세 재생',
  },
  {
    name: '외부 링크 확인 / ExternalLinkModal',
    path: 'components/ExternalLinkModal.tsx',
    note: '콘텐츠 외부 이동 확인',
  },
]

export const MIND_CANDIDATES: CandidateItem[] = [
  {
    name: '정보 배너 / InfoBanner',
    note: 'creamyBeige + Info/Warning + 본문 · 탭 가능 변형',
    paths: [
      'app/(tabs)/mind.tsx',
      'app/mind-report.tsx',
      'app/mind-check-intro.tsx',
      'app/mind-check-guide.tsx',
    ],
  },
  {
    name: '검사 카드 / AssessmentCard',
    note: '아이콘 웰 + 제목/문항·분 + 최근 이력 + Caret · tour highlight',
    paths: ['app/(tabs)/mind.tsx', 'app/mind-check-intro.tsx'],
  },
  {
    name: '심각도 필 / SeverityBandPill',
    note: 'BAND별 면색 pill — intro·guide·report·result 복제',
    paths: [
      'app/mind-check-intro.tsx',
      'app/mind-check-guide.tsx',
      'app/mind-report.tsx',
      'app/mind-check-result.tsx',
    ],
  },
  {
    name: '심각도 구간 행 / SeverityBandRow',
    note: 'pill + 구간 제목 + 의미 설명',
    paths: ['app/mind-check-intro.tsx', 'app/mind-check-guide.tsx'],
  },
  {
    name: '검사 결과 히스토리 카드 / MindResultCard',
    note: '날짜 · band · 점수 · 세그먼트 바 · 요약 · 상세보기',
    paths: ['app/mind-report.tsx'],
  },
  {
    name: '점수 링 / ScoreRing',
    note: '결과 화면 band color 원형 점수',
    paths: ['app/mind-check-result.tsx'],
  },
  {
    name: '검사 선택지 행 / AssessmentOptionRow',
    note: 'selected(Check) / idle',
    paths: ['app/mind-check.tsx'],
  },
  {
    name: '추천 영상 히어로 / FeaturedContentCard',
    note: '그라데이션 + Play + 「오늘의 추천」뱃지',
    paths: ['app/(tabs)/mind.tsx'],
  },
  {
    name: '콘텐츠 리스트 행 / ContentVideoRow',
    note: 'thumb + duration + meta + more(⋯)',
    paths: ['app/(tabs)/mind.tsx'],
  },
]

// ─── 7. 펫 · 홈 · 보관함 ─────────────────────────────────────────

export const PET_EXISTING: ExistingItem[] = [
  {
    name: '온보딩 토크 스테이지 / OnboardingTalkStage',
    path: 'components/OnboardingTalkStage.tsx',
    note: '말풍선+펫+소개 · intro·마음검사·힐링·일기 투어',
  },
  {
    name: '코치마크 웰컴 시트 / CoachmarkWelcomeSheet',
    path: 'components/CoachmarkWelcomeSheet.tsx',
    note: '홈 최초 투어 시작',
  },
  {
    name: '코치마크 투어 카드 / CoachmarkTourCard',
    path: 'components/CoachmarkTourCard.tsx',
    note: '홈·일기·채팅·마음 step dots + CTA',
  },
  {
    name: '코치마크 완료 시트 / CoachmarkCompleteSheet',
    path: 'components/CoachmarkCompleteSheet.tsx',
    note: '투어 완료',
  },
]

export const PET_CANDIDATES: CandidateItem[] = [
  {
    name: '펫 말풍선 / SpeechBubble',
    note: '흰 말풍선±꼬리. variants: greet / tip(닫기 X) / depleted · 화면마다 미세 스타일 차이',
    paths: [
      'app/(tabs)/index.tsx',
      'app/onboarding/pet-select.tsx',
      'app/(tabs)/chat.tsx',
      'app/diary-done.tsx',
      'components/OnboardingTalkStage.tsx',
    ],
  },
  {
    name: '펫 선택 카드 / PetSelectCard',
    note: 'selected(heart)+bubble / off',
    paths: ['app/onboarding/pet-select.tsx'],
  },
  {
    name: '돌봄 스톡 카드 / CareStockCard',
    note: '홈 하단 액션 · enabled / empty muted / tour',
    paths: ['app/(tabs)/index.tsx'],
  },
  {
    name: '미션 퀵 아이템 / MenuQuickItem',
    note: 'ready / cooldown ring / nudge',
    paths: ['app/(tabs)/index.tsx'],
  },
  {
    name: '쿨다운 링 / MenuCooldownRing',
    note: 'progress 0–1 원형',
    paths: ['app/(tabs)/index.tsx'],
  },
  {
    name: '레벨·에너지 블록 / LevelEnergyBar',
    note: '탭 → 보관함 · fill by energy',
    paths: ['app/(tabs)/index.tsx'],
  },
  {
    name: '보관함 스톡 타일 / StockTile',
    note: '아이콘 웰 + 라벨 + have/max + 트랙 · empty',
    paths: ['app/storage.tsx'],
  },
  {
    name: '오늘 획득 칩 / TodayGainChip',
    note: 'gained/cap · energy accent(옐로)',
    paths: ['app/storage.tsx'],
  },
  {
    name: '에너지 보상 필 / EnergyRewardPill',
    note: 'Lightning + “+N 에너지”',
    paths: ['app/attendance.tsx', 'app/diary-done.tsx'],
  },
  {
    name: '출석 완료 배지 / AttendanceDoneBadge',
    note: 'CheckCircle + 「오늘 출석 완료!」',
    paths: ['app/attendance.tsx'],
  },
]

// ─── 8. 채팅 · 도움 ──────────────────────────────────────────────

export const CHAT_EXISTING: ExistingItem[] = [
  {
    name: '도움 연락처 배너 / HelpContactsBanner',
    path: 'components/HelpContactsBanner.tsx',
    note: '크림 배너 → 시트/화면 오픈',
  },
  {
    name: '도움 연락처 시트 / HelpContactsSheet',
    path: 'components/HelpContactsSheet.tsx',
    note: '상담 기관 연락처 바텀시트',
  },
  {
    name: 'AI 이용 안내 / ChatAiNotice',
    path: 'components/ChatAiNotice.tsx',
    note: '채팅 진입 전체 화면 유의사항',
  },
]

export const CHAT_CANDIDATES: CandidateItem[] = [
  {
    name: '채팅 버블 패밀리 / ChatBubble',
    note: 'pet answer / user / greet / tip / typing dots / depleted',
    paths: ['app/(tabs)/chat.tsx'],
  },
  {
    name: '연락처 리스트 행 / HelpContactRow',
    note: 'Sheet · chat-help · support 3곳 스타일 분산 — 한 컴포넌트로',
    paths: [
      'components/HelpContactsSheet.tsx',
      'app/chat-help.tsx',
      'app/support.tsx',
    ],
  },
  {
    name: '센터 전화 카드 / PrimaryCallCard',
    note: '주소·전화·hours + 전화 CTA (하남시 정신건강복지센터)',
    paths: ['app/support.tsx'],
  },
  {
    name: '에너지 소진 필 / EnergyDepletedPill',
    note: 'statusDot + 「에너지 소진」',
    paths: ['app/(tabs)/chat.tsx'],
  },
  {
    name: '휴식 팁 카드 / RestTipCard',
    note: '「잠깐 쉬어가요」',
    paths: ['app/(tabs)/chat.tsx'],
  },
]

// ─── 9. 감정 일기 ────────────────────────────────────────────────

export const DIARY_EXISTING: ExistingItem[] = [
  {
    name: '감정 이모지 / MoodEmoji',
    path: 'components/MoodEmoji.tsx',
    note: '감정 SVG 1~5 · size 가변 · 머리 위 colorDot 옵션',
  },
]

export const DIARY_CANDIDATES: CandidateItem[] = [
  {
    name: '감정 선택기 / DiaryMoodPicker',
    note: '선택 라벨 강조 · MoodEmoji 조합',
    paths: ['app/diary-write.tsx'],
  },
  {
    name: '감정 캘린더 / DiaryMoodCalendar',
    note: '월 네비 · day: mood/empty/today/selected/future (출석 캘린더와 구조 유사)',
    paths: ['app/(tabs)/diary.tsx'],
  },
  {
    name: '감정 분포 바 / MoodDistBar',
    note: '8px stacked pastel(좋음/보통/힘듦) + 레전드 swatch/횟수',
    paths: ['app/(tabs)/diary.tsx'],
  },
  {
    name: '월 피드백 카피 / MoodMonthFeedback',
    note: 'good/ok/hard 비중 문구 블록',
    paths: ['app/(tabs)/diary.tsx'],
  },
  {
    name: '감정 기록 CTA / DiaryWriteCTA',
    note: 'Plus + primary · tour ring',
    paths: ['app/(tabs)/diary.tsx'],
  },
  {
    name: '일기 목록 카드 / DiaryEntryCard',
    note: '이모지+날짜+미리보기+태그 (카드 페이지와 동일 후보)',
    paths: ['app/diary-list.tsx'],
  },
  {
    name: '일기 상세 무드 히어로 / DiaryDetailMood',
    note: '큰 MoodEmoji + 날짜 + 태그',
    paths: ['app/diary-detail.tsx'],
  },
  {
    name: '일기 완료 히어로 / DiaryDoneHero',
    note: '폭죽 + SpeechBubble + EnergyReward + dual CTA 조합',
    paths: ['app/diary-done.tsx'],
  },
]

// ─── 10. 설정 · 계정 ─────────────────────────────────────────────

export const SETTINGS_EXISTING: ExistingItem[] = [
  {
    name: '사진 권한 시트 / PhotoPermissionSheet',
    path: 'components/PhotoPermissionSheet.tsx',
    note: '복구코드 보관 사진 권한',
  },
  {
    name: '권한 거부 다이얼로그 / PhotoPermissionDeniedDialog',
    path: 'components/PhotoPermissionDeniedDialog.tsx',
    note: '권한 거부 후 안내',
  },
]

export const SETTINGS_CANDIDATES: CandidateItem[] = [
  {
    name: '설정 그룹 카드 / SettingsGroupCard',
    note: 'SurfaceCard + SettingsRow 스택',
    paths: ['app/(tabs)/more.tsx'],
  },
  {
    name: '설정·내비 행 / SettingsRow',
    note: '아이콘+제목(+서브)+Caret — more 로컬 → 피그마·공용 승격 후보',
    paths: [
      'app/(tabs)/more.tsx',
      'app/guide.tsx',
      'app/support.tsx',
      'app/onboarding/resume.tsx',
    ],
  },
  {
    name: '위험·삭제 액션 카드 / DangerActionCard',
    note: '경고 카피 + 파괴 CTA · 삭제 체크리스트',
    paths: ['app/mind-records.tsx', 'app/withdraw.tsx'],
  },
  {
    name: '복구 코드 카드 / RestoreCodeCard',
    note: 'peek pet + code + copy',
    paths: ['app/onboarding/restore-code.tsx'],
  },
  {
    name: '계정 닉네임 폼 / AccountNicknameForm',
    note: 'TextInputShell 재사용 · focus/error',
    paths: ['app/account.tsx'],
  },
  {
    name: '기록 가져오기 시트 / ResumeImportSheet',
    note: 'BottomSheet + Primary',
    paths: ['app/onboarding/resume.tsx'],
  },
  {
    name: '가이드 문서 섹션 / LegalDocSection',
    note: 'title + body + divider',
    paths: ['app/guide-doc.tsx'],
  },
]

export function isCatalogPageId(value: string): value is CatalogPageId {
  return CATALOG_PAGES.some((page) => page.id === value)
}

export function getPageIndex(id: CatalogPageId): number {
  return CATALOG_PAGES.findIndex((page) => page.id === id)
}
