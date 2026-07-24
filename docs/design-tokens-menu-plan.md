# 디자인 토큰·메뉴별 UI 통일 계획

카피 문구는 유지. 색·타이포·선택/버튼 상태만 통일.

## 변수표 (시안)

| 토큰 | HEX | 용도 |
|------|-----|------|
| cocoa / textPrimary | `#7A5B45` | 타이틀·본문·**옵션 선택** |
| textSecondary | `#8E6F5C` | 보조 문구 |
| textDisabled | `#B79A8A` | 약한 보조 |
| creamyBeige | `#F6EFE5` | 연한 면 |
| background | `#F8F4EF` | 화면 배경 |
| surface | `#FFFFFF` | 카드·입력 |
| border / unselected | `#E9DCCF` | 테두리·**옵션 미선택** |
| primary | `#FF8F7A` | **CTA 버튼만** (+ moodGood) |
| accent | `#FFD78A` | 에너지·포인트 옐로 |
| accentSoft | `#FBECC4` | Accent 연한 면 |
| cardRecessed | `#FFFBF8` | 오목 카드 |
| inactive | `#ECECEB` | **버튼 비활성 면** |
| inactiveText | `#B8B8B8` | **버튼 비활성 글자** |
| warning | `#C41000` | 경고 |

## 상태 규칙

- 옵션 미선택: `unselected`/`border` 면·테두리, 글자 `textSecondary`
- 옵션 선택: `cocoa`/`selected`(=cocoa) 면 또는 테두리, 글자 surface/cocoa
- CTA 활성: `primary` 코랄
- CTA 비활성: `inactive` + `inactiveText`
- 코랄은 Primary 버튼·기분「좋음」외 옵션/칩/탭에 쓰지 않음

## 타이포

- 화면 타이틀(헤더): `Type.title` 18 / screenTitle
- 페이지 제목(히어로): `Type.titleLg` 22 또는 display 26
- 본문: `Type.body` 15 / `bodyMd` 14
- 버튼: `Type.titleSm` 16

## 메뉴 적용 순서

1. Colors·Button·SelectionChip (기반)
2. 온보딩 폼 (profile/pet/terms) — 선택 칩
3. 나의 펫 홈 — 탭/뱃지 코랄 남용 정리
4. 대화
5. 마음일기 (태그 선택 = cocoa)
6. 마음챙김
7. 더보기·설정·탈퇴·계정
