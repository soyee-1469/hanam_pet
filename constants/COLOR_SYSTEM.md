# Hanam Healing Pet Color System v2.0

컨셉 2 — **반려동물과의 다정한 동화**  
코드: `constants/Colors.ts` · Tailwind: `tailwind.config.js`

## 컨셉보드 원색 (추출)

| 이름 | HEX | 역할 |
| --- | --- | --- |
| 코랄 오렌지 | `#FA6F37` | 주조색 |
| 웜 옐로우 | `#FBAE38` | 보조색 |
| 밀크 코코아 | `#BB7E3F` | 강조색 |
| 크리미 베이지 | `#FDDEAC` | 배경 계열 |

## 앱 UI 토큰 (10~12)

| Token | HEX | 용도 |
| --- | --- | --- |
| Primary | `#FA6F37` | 메인 버튼, 탭 선택, 진행바 |
| Primary Pressed | `#E85F2A` | Press / Hover |
| Secondary | `#FBAE38` | 보조 강조, 레벨 뱃지 |
| Accent | `#BB7E3F` | 펫 아이템·코코아 포인트 |
| Sage | `#A9B69A` | 공공·힐링 포인트 (10~20%) |
| Background | `#FFF9F3` | 앱 전체 |
| Surface / Card | `#FFFFFF` | 카드, Bottom Sheet |
| Surface Secondary | `#FFF3E6` | 비활성 카드 |
| Creamy Beige | `#FDDEAC` | 소프트 면 |
| Text Primary | `#5C3D2E` | 제목 |
| Text Secondary | `#8B6B55` | 설명 |
| Text Disabled | `#C4A990` | 비활성 |
| Border / Divider | `#F0E2D2` / `#F7EEE4` | 구분 |

## Primary 사용 규칙 (3곳만)

1. Primary 버튼  
2. 선택된 탭/네비게이션  
3. 에너지 진행바  

## 이미지 에셋 규칙

- **에이전트는 이미지 파일을 생성·수정·재인코딩하지 않는다.**
- 배경·캐릭터·아이콘 PNG/JPG는 사용자가 제공한 원본만 사용한다.
- 경로 연결(`require`)만 허용한다.
