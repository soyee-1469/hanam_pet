# 하남이네 힐링펫

Expo Router · React Native · TypeScript · NativeWind

## 실행

```bash
cd "/Users/ymy/작업/하남이네/healing-pet"
npm start
```

- `i` — iOS 시뮬레이터
- `a` — Android 에뮬레이터
- `w` — 웹

## 웹 배포 (Vercel · 화면 공유용)

```bash
# 1) 로컬에서 빌드 확인
npm run export:web
npx serve dist

# 2) Vercel에 올리기 (최초 1회 로그인·프로젝트 연결)
npx vercel
# 이후 프로덕션
npm run deploy:web
```

Vercel 대시보드에서 Git 연결 시:

- Framework: **Other**
- Build Command: `npx expo export -p web`
- Output Directory: `dist`

배포 URL을 Chrome에서 열고 피그마 확장으로 화면을 붙이면 됩니다.

## 현재 구현

- **나의 펫 (Home)** — `app/(tabs)/index.tsx`
- 나머지 탭은 placeholder

## 컬러 (Affectionate Story)

| 이름 | 값 |
|------|-----|
| Warm Beige | `#F5EDE3` |
| Coral Orange | `#E8956A` |
| Soft Yellow | `#F5D76E` |
| Cocoa Brown | `#5C4033` |
