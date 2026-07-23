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

**배포 URL:** https://hanam-pet.vercel.app  

`main`에 푸시하면 **Vercel이 자동 배포**합니다.  
(GitHub Actions + Secrets 방식이 아니라, Vercel ↔ GitHub 직연동)

### 최초 1회만 (아직 연결 안 돼 있으면)

1. https://vercel.com 로그인  
2. **Add New Project** → GitHub `soyee-1469/hanam_pet` Import  
3. Framework: **Other**  
4. Build Command: `npx expo export -p web`  
5. Output Directory: `dist`  
6. Deploy  

이후부터는 `main` 푸시만 하면 자동 반영됩니다.  
연결 확인: Vercel 프로젝트 → **Settings → Git**

```bash
# 로컬에서 빌드만 확인
npm run export:web
npx serve dist
```

Chrome에서 배포 URL을 열고 피그마 확장으로 화면을 붙이면 됩니다.

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
