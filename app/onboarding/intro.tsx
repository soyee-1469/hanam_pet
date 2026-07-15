import { useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Colors, Shadows } from '../../constants/Colors'
import { PrimaryButton, ProgressDots, ScreenHeader } from '../../components/ui'
import { ONBOARDING_STEPS } from '../../lib/onboardingDraft'

const SLIDES = [
  {
    key: 'care',
    title: '매일 마음을 돌봐요',
    body: '짧은 기록과 대화로\n오늘 감정을 가볍게 남겨 보세요.',
    image: require('../../assets/images/dog-character_2.png'),
    bubble: '오늘 마음은 어때?',
  },
  {
    key: 'pet',
    title: '펫이 곁에 있어요',
    body: '몽이와 나미가 응원하고\n함께 에너지를 쌓아 가요.',
    image: require('../../assets/images/dog-character_3.png'),
    bubble: '같이 있으면 든든해!',
  },
  {
    key: 'mind',
    title: '마음챙김이 이어져요',
    body: '일기 · 대화 · 미션이\n하루의 루틴이 됩니다.',
    image: require('../../assets/images/dog-character_4.png'),
    bubble: '작은 한 걸음이면 돼.',
  },
  {
    key: 'ready',
    title: '함께 시작해요',
    body: '준비는 짧게,\n쓰기는 편하게.',
    image: require('../../assets/images/dog-character_5.png'),
    bubble: '내가 기다릴게!',
  },
] as const

export default function OnboardingIntro() {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null)

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width)
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, i)))
  }

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true })
      setIndex(index + 1)
      return
    }
    router.push('/onboarding/terms')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="소개" onBack={() => router.back()} />
      <ProgressDots total={ONBOARDING_STEPS} index={0} />

      <FlatList
        ref={listRef}
        style={styles.list}
        data={[...SLIDES]}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.petBlock}>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{item.bubble}</Text>
              </View>
              <Image source={item.image} style={styles.pet} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[styles.dot, i === index ? styles.dotOn : styles.dotOff]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={index === SLIDES.length - 1 ? '다음' : '계속'}
          onPress={goNext}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  slide: {
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bubble: {
    maxWidth: 220,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pet: {
    width: 148,
    height: 148,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotOn: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  dotOff: {
    backgroundColor: Colors.sand,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
})
