# 피그마「만들페이지」화면 맞춤 체크리스트

기준: [Figma 만들페이지](https://www.figma.com/design/Sz8wG7CIxyPkxCL9Gt4tUI/?node-id=54-7409)  
진행: 구역 → 화면 순서. 완료 시 `[x]` 로 표시.

## A. 온보딩

- [x] A1 스플래시 (`/onboarding/splash`)
- [x] A2 게이트 (`/onboarding/gate`)
- [x] A3 인트로 4장 (`/onboarding/intro`)
- [x] A4 약관 (`/onboarding/terms`)
- [x] A5 기본 정보 (`/onboarding/profile`)
- [x] A6 추가 정보·펫·이름 (`/onboarding/pet-select`)
- [x] A7 기록 가져오기 번호 (`/onboarding/restore-code` + 보관 시트)
- [x] A8 환영 (`/onboarding/welcome`)
- [x] A9 이어보기 번호 입력 (`/onboarding/resume`)
- [x] A10 번호 분실 안내 (`resume` lost + giveUp 바텀시트)
- [x] A11 복구 완료 (`resume` restored)

## B. 나의 펫

- [x] B1 펫 홈 (`/(tabs)`) — 시간대 헤더·말풍선·제작 완료·쿨다운·보관 팁·돌보기 CTA
- [x] B1m 시간대 인사 콜라주 (아침/숨고르기/수고했어요/탭복귀)
- [x] B1a cm-01-welcome 첫걸음 시트
- [x] B1b cm-02 나의펫 투어 카드 (1/4 · 돌보기 하이라이트)
- [x] B1c cm-03 대화 투어 카드 (2/4 · 입력창 하이라이트)
- [x] B1d cm-04 마음일기 투어 카드 (3/4 · 기록 CTA 하이라이트)
- [x] B1e cm-05 마음챙김 투어 카드 (4/4 · 우울 평가도구 하이라이트)
- [x] B1e2 cm-06-complete 투어 완료 시트 (준비 끝 · 만나러 가기)
- [x] B1f 최초 진입 이용 안내 팁 (받기 제한 배너 · 보관 한도 팁)
- [x] B1g 아이템 수령 후 쿨다운 (HH:MM:SS)
- [x] B1h 탭 복귀 인터랙션 (다시 만나서… 헤더 · 화이팅 말풍선)
- [x] B1i 캐릭터 탭 말풍선 순환
- [x] B1j 사료 주기 메시지 (다멍 · 하트 버스트)
- [x] B1k 놀아 주기 메시지 (다냥/다멍 · 하트 버스트 · 펫 이미지 연동)
- [x] B1l 펫 이름 수정 바텀시트 (새 이름 지어주기)
- [x] B2 이용 안내 시트 (홈「안내」— 받기 제한 / 보관 한도 / 돌보기)
- [x] B3 사료·놀아주기 (홈 인라인 CTA)
- [x] B4 보관함 (`/storage`) — 요약카드 + 아이템/에너지 기록 탭 시안 맞춤
- [x] B5 출석 (`/attendance`) — 히어로·캘린더·「출석하고 N개 에너지 받기」
- [x] B6 알림 (`/notifications`) — 전체/공지/서비스 · 시안 카피·미읽음 점

## C. 대화

- [x] C1 AI 유의사항 (첫 대화 전 · 확인했어요 · 도움받을 기관)
- [x] C2 대화 메인 (챗봇형 · 첫인사 말풍선 · 입력 pill)
- [x] C3 입력·응답 (팁 · 타이핑 · 펫 답변 말풍선 · 도움 배너 · 탭바 유지)
- [x] C4 상담기관 안내 (`/chat-help`)
- [x] C5 에너지 소진 (말풍선 · 에너지 채우기 · 부족 안내 · 탭바 유지)

## D. 마음일기

- [ ] D1 일기 메인 (`/(tabs)/diary`)
- [x] D2 작성 (`/diary-write`) — 작성전·선택 상태 · 감정 5종 에셋 연동
- [x] D3 목록 (`/diary-list`) — 마음일기장 · ⋮ 수정/삭제 시트
- [ ] D4 상세 (`/diary-detail`)
- [x] D5 완료 (`/diary-done`) — 마음을 담았어요 · 일기/대화 복귀

## E. 마음챙김

- [x] E1 탭 메인 (`/(tabs)/mind`) — 마음 살피기 자가진단 목록
- [ ] E2 힐링 콘텐츠 (`/mind-content`)
- [x] E3 자가검진 인트로 (`/mind-check-intro`) — 우울·불안·스트레스 평가도구
- [ ] E3b 가이드 (`/mind-check-guide`)
- [x] E4 문항 (`/mind-check`) — 진행바·문항·보기 · 중간 이탈 모달
- [ ] E5 결과 (`/mind-check-result`)
- [ ] E6 기록·리포트 (`/mind-records`, `/mind-report`)

## F. 설정·전체

- [ ] F1 전체 메뉴 (`/(tabs)/more`)
- [ ] F2 계정 (`/account`)
- [ ] F3 이용안내 (`/guide`, `/guide-doc`)
- [ ] F4 데이터 관리 (`/data-manage`)
- [ ] F5 지원 (`/support`)
- [ ] F6 탈퇴 (`/withdraw`, `/withdraw-done`)

## 진행 메모

- 로컬: http://localhost:8081 → 탭 홈 (온보딩은 `/onboarding/splash`)
- 피그마 MCP 호출 한도 — 캡처/시안 이미지로 대조
- **구현 원칙:** 시안 우선 구현 → UX 이상한 점만 [`UX_ISSUES.md`](./UX_ISSUES.md)에 따로 기록
- 칩 선택색: `Colors.selected` 브라운 유지
- 이미지 에셋은 수정하지 않음
- A 구역: OTP 웹 테두리 버그 수정 포함 완료
