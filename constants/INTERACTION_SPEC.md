# Accent Color Rule + Interaction Spec (v2.0)

컬러 토큰: Color System **v2.0** (`constants/Colors.ts`)

## Shadow

| Token | Spec |
| --- | --- |
| Elevation | `0 2px 8px rgba(92,61,46,0.04)` |

## Primary CTA (`놀아주기` 등)

- bg `#FA6F37` → Hover/Press `#E85F2A`
- Pressed: `scale(0.97)`
- `cursor: pointer`

## Active-Nudge (`사료 획득하기`)

- Secondary soft: bg `#FFF0D4` / text `#E89A28` (또는 Primary 유도)
- `disabled` 금지, `triggerMissionNudge()`

## 레벨 뱃지

- Secondary `#FBAE38` 계열 (웜 옐로우)

## 번개 아이콘

- fill `#FBAE38`

## 이미지 에셋

- **절대 이미지를 생성·편집·재저장하지 말 것**
- 사용자가 넣은 `assets/images/*`만 경로로 연결
