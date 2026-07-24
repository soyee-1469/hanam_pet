# 온보딩 화면 순서 · UI/UX 개선 계획

카피·문구는 변경하지 않는다. 레이아웃·간격·색·계층·진행 표시만 손본다.

## 정상 플로우 (첫 만남)

```
splash → gate → welcome-prep → intro[4] → diary → healing → mind
  → terms → profile → pet-select → restore-code → welcome → (tabs)
```

복원 분기: `gate → resume-intro → resume → (tabs)`

## TourDots (서비스 소개)

의도된 7단계: promises → reasons → features → help → diary → healing → mind  
`welcome-prep`은 투어 **전** 안내이므로 닷에서 제외한다. (기존 8/0 → intro 7/0 리셋 버그 해소)

## ProgressDots (약관 이후 셋업) — 5단계

| index | 화면 |
|------|------|
| 0 | terms |
| 1 | profile |
| 2 | pet-select |
| 3 | restore-code |
| 4 | welcome |

## 순서대로 적용할 개선

1. welcome-prep — TourDots 제거, 제목 cocoa, 하단 빈 여백 축소  
2. intro — 이유 칩을 `selected`(브라운)로, Primary 코랄은 CTA만  
3. diary / healing / mind — 배경 `creamyBeige` 통일  
4. terms — 헤더 중복 타이틀 정리(본문 headline 유지), 배경·푸터 간격  
5. profile — 배경 통일 (응원 펫은 뒤로가기 시에만 노출 유지)  
6. pet-select — ProgressDots index 2  
7. restore-code — ProgressDots index 3, 팁 크롬 완화(에러색 남용 제거)  
8. welcome — ProgressDots index 4, 제목 cocoa  
9. resume-intro — 제목 cocoa  

## 보류 (이번 패치 밖)

- gate CTA를 PrimaryButton으로 전면 교체  
- intro 아코디언 기본 접힘  
- skip → terms 를 replace로 바꾸기 (스택 동작 변경)  
- resume dead `lost` 화면 정리  
