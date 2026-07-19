import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {
  CaretRight,
  DotsThreeVertical,
  Heart,
  Lightning,
  Moon,
  Play,
  ArrowSquareOut,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, tabBarReserveHeight } from '../../constants/Layout'
import {
  MIND_CONTENTS,
  MIND_CHECKS,
  MIND_FEATURED,
  formatPublishedAt,
  getMindContent,
  type MindContent,
  type MindMoodFilter,
} from '../../constants/MindContent'
import {
  formatResultDateYmd,
  getMindCheckResults,
  type MindCheckResultRecord,
} from '../../lib/mindCheckResults'
import { openExternalUrl } from '../../components/ExternalLinkModal'
import { YouTubeVideoModal } from '../../components/YouTubeVideoModal'
import { BottomSheet } from '../../components/ui/AppOverlay'
import {
  extractYoutubeVideoId,
  youtubeWatchUrl,
} from '../../lib/youtube'
import { CoachmarkTourCard } from '../../components/CoachmarkTourCard'
import { PET_TOUR_STEPS, petTourHref } from '../../lib/coachmarkTour'
import {
  finishPetTourWithComplete,
  getPetTourStepIndex,
  setPetTourStepIndex,
  subscribePetTour,
} from '../../lib/coachmarkTourState'
import { setCoachmarkWelcomeStatus } from '../../lib/coachmarkStorage'
import { getPetName } from '../../lib/petProfile'

type TabId = 'fill' | 'check'

const TABS: { id: TabId; label: string }[] = [
  { id: 'fill', label: '마음 채우기' },
  { id: 'check', label: '마음 살피기' },
]

const FILTERS: { id: MindMoodFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '우울', label: '우울' },
  { id: '불안', label: '불안' },
  { id: '스트레스', label: '스트레스' },
]

const CHECK_ICON: Record<MindCheckItem['icon'], Icon> = {
  moon: Moon,
  heart: Heart,
  lightning: Lightning,
}

type MindCheckItem = (typeof MIND_CHECKS)[number]

function openContentDetail(id: string) {
  router.push({ pathname: '/mind-content', params: { id } })
}

function latestForCheck(
  results: MindCheckResultRecord[],
  id: MindCheckItem['id'],
) {
  return results.find((r) => r.assessmentId === id) ?? null
}

export default function MindScreen() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const params = useLocalSearchParams<{ segment?: string }>()
  const initialSegment =
    params.segment === 'check' || params.segment === 'fill'
      ? params.segment
      : 'fill'
  const [tab, setTab] = useState<TabId>(initialSegment)
  const [filter, setFilter] = useState<MindMoodFilter>('all')
  const [results, setResults] = useState<MindCheckResultRecord[]>([])
  const [petName, setPetName] = useState('하치')
  const [tourIndex, setTourIndex] = useState<number | null>(
    getPetTourStepIndex(),
  )
  const [playing, setPlaying] = useState<MindContent | null>(null)
  const [menuContent, setMenuContent] = useState<MindContent | null>(null)

  const watchContent = useCallback((id: string) => {
    const content = getMindContent(id)
    if (!content) return
    const videoId = extractYoutubeVideoId(
      content.externalUrl,
      content.thumbnailUrl,
    )
    if (videoId || content.externalUrl) {
      setPlaying(content)
      return
    }
    openContentDetail(id)
  }, [])

  const openOnYoutube = useCallback((content: MindContent) => {
    const videoId = extractYoutubeVideoId(
      content.externalUrl,
      content.thumbnailUrl,
    )
    const url = videoId
      ? youtubeWatchUrl(videoId)
      : content.externalUrl
    if (url) void openExternalUrl(url)
  }, [])

  const tourStep =
    tourIndex != null ? PET_TOUR_STEPS[tourIndex] : undefined
  const showMindTour = tourStep?.route === 'mind'
  const tourHighlightCheck =
    showMindTour && tourStep?.highlight === 'checkTool'

  useEffect(() => {
    return subscribePetTour(() => {
      setTourIndex(getPetTourStepIndex())
    })
  }, [])

  useEffect(() => {
    void getPetName().then((n) => {
      if (n) setPetName(n)
    })
  }, [])

  useEffect(() => {
    if (showMindTour) setTab('check')
  }, [showMindTour])

  const finishPetTour = async () => {
    finishPetTourWithComplete()
    await setCoachmarkWelcomeStatus('accepted')
    router.replace('/(tabs)')
  }

  const onPetTourNext = () => {
    if (tourIndex == null) return
    const next = tourIndex + 1
    if (next < PET_TOUR_STEPS.length) {
      const step = PET_TOUR_STEPS[next]
      setPetTourStepIndex(next)
      if (step.route !== 'mind') {
        router.push(petTourHref(step.route) as never)
      }
      return
    }
    void finishPetTour()
  }

  useFocusEffect(
    useCallback(() => {
      if (params.segment === 'check' || params.segment === 'fill') {
        setTab(params.segment)
      }
      let alive = true
      void getMindCheckResults().then((list) => {
        if (alive) setResults(list)
      })
      return () => {
        alive = false
      }
    }, [params.segment]),
  )

  const list = useMemo(() => {
    if (filter === 'all') return MIND_CONTENTS
    return MIND_CONTENTS.filter((c) => c.mood === filter)
  }, [filter])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마음챙김</Text>
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t.id
            return (
              <Pressable
                key={t.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setTab(t.id)}
                style={({ pressed }) => [
                  styles.tabBtn,
                  pressed && styles.tabPressed,
                ]}
              >
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>
                  {t.label}
                </Text>
                {on ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            )
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarSpace + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'fill' ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${MIND_FEATURED.title} 재생`}
              onPress={() => watchContent(MIND_FEATURED.id)}
              style={({ pressed }) => [
                styles.featured,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={{ uri: MIND_FEATURED.thumbnailUrl }}
                style={styles.featuredBg}
                resizeMode="cover"
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)']}
                locations={[0.28, 0.62, 1]}
                style={styles.featuredGradient}
                pointerEvents="none"
              />
              <View style={styles.featuredPlay} pointerEvents="none">
                <Play size={28} color="#FFFFFF" weight="fill" />
              </View>
              <View style={styles.featuredBadges}>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgePrimaryText}>오늘의 추천</Text>
                </View>
              </View>
              <View style={styles.featuredBottom}>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {MIND_FEATURED.title}
                </Text>
                <Text style={styles.featuredMeta}>
                  {MIND_FEATURED.mood} · {MIND_FEATURED.minutes}분
                </Text>
              </View>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {FILTERS.map((f) => {
                const on = filter === f.id
                return (
                  <Pressable
                    key={f.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setFilter(f.id)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {f.label}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <View style={styles.videoList}>
              {list.length === 0 ? (
                <Text style={styles.emptyText}>해당 카테고리 콘텐츠가 없어요.</Text>
              ) : (
                list.map((item) => (
                  <View key={item.id} style={styles.videoRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title} 재생`}
                      onPress={() => watchContent(item.id)}
                      style={({ pressed }) => [
                        styles.videoMain,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.thumbWrap}>
                        <Image
                          source={{ uri: item.thumbnailUrl }}
                          style={styles.thumb}
                          resizeMode="cover"
                        />
                        <View style={styles.thumbPlay} pointerEvents="none">
                          <Play size={14} color="#FFFFFF" weight="fill" />
                        </View>
                        <View style={styles.durationBadge}>
                          <Text style={styles.durationText}>{item.minutes}분</Text>
                        </View>
                      </View>
                      <View style={styles.videoCopy}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.videoMeta} numberOfLines={1}>
                          {item.mood} · {formatPublishedAt(item.publishedAt)}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title} 더보기`}
                      onPress={() => setMenuContent(item)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.videoMore,
                        pressed && styles.pressed,
                      ]}
                    >
                      <DotsThreeVertical
                        size={20}
                        color={Colors.textSecondary}
                        weight="bold"
                      />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.checkNotice}>
              <Text style={styles.checkNoticeText}>
                자신의 증상을 직접 확인하고 작성한 자가보고식 평가 결과는
                참고용으로, 의학적 진단을 대체하지 않아요.
              </Text>
            </View>

            <View style={styles.checkList}>
              {MIND_CHECKS.map((check) => {
                const IconComp = CHECK_ICON[check.icon]
                const latest = latestForCheck(results, check.id)
                const highlight =
                  tourHighlightCheck && check.id === MIND_CHECKS[0]?.id
                return (
                  <Pressable
                    key={check.id}
                    accessibilityRole="button"
                    accessibilityLabel={check.title}
                    onPress={() =>
                      router.push({
                        pathname: '/mind-check-intro',
                        params: { id: check.id },
                      })
                    }
                    style={({ pressed }) => [
                      styles.checkCard,
                      highlight && styles.checkCardTour,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.checkIconWrap}>
                      <IconComp
                        size={22}
                        color={Colors.primary}
                        weight="regular"
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{check.title}</Text>
                      <Text style={styles.rowMeta}>
                        {check.code} · {check.questions}문항 · 약 {check.minutes}
                        분
                      </Text>
                      <Text style={styles.checkHistory}>
                        {latest
                          ? `최근 평가 ${formatResultDateYmd(latest.at)}`
                          : '검사 이력 없음'}
                      </Text>
                    </View>
                    <CaretRight
                      size={16}
                      color={Colors.textDisabled}
                      weight="bold"
                    />
                  </Pressable>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      {showMindTour && tourStep ? (
        <View style={styles.coachOverlay} pointerEvents="box-none">
          <View style={styles.coachScrim} />
          {tourHighlightCheck ? (
            <View
              style={styles.tourSpotlight}
              pointerEvents="none"
              accessibilityElementsHidden
            >
              <View style={styles.checkIconWrap}>
                <Moon size={22} color={Colors.primary} weight="regular" />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>
                  {MIND_CHECKS[0]?.title ?? '우울 평가도구'}
                </Text>
                <Text style={styles.rowMeta}>
                  {MIND_CHECKS[0]
                    ? `${MIND_CHECKS[0].code} · ${MIND_CHECKS[0].questions}문항 · 약 ${MIND_CHECKS[0].minutes}분`
                    : ''}
                </Text>
              </View>
              <CaretRight
                size={16}
                color={Colors.textDisabled}
                weight="bold"
              />
            </View>
          ) : null}
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={Math.max(insets.bottom, 12) + 24}
          />
        </View>
      ) : null}

      <YouTubeVideoModal
        visible={playing != null}
        onClose={() => setPlaying(null)}
        title={playing?.title}
        externalUrl={playing?.externalUrl}
        thumbnailUrl={playing?.thumbnailUrl}
      />

      <BottomSheet
        visible={menuContent != null}
        onRequestClose={() => setMenuContent(null)}
        sheetStyle={styles.menuSheet}
      >
        <Text style={styles.menuTitle} numberOfLines={2}>
          {menuContent?.title ?? ''}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="앱에서 재생"
          onPress={() => {
            const c = menuContent
            setMenuContent(null)
            if (c) setPlaying(c)
          }}
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <Play size={20} color={Colors.cocoa} weight="fill" />
          <Text style={styles.menuRowText}>앱에서 재생</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="유튜브에서 보기"
          onPress={() => {
            const c = menuContent
            setMenuContent(null)
            if (c) openOnYoutube(c)
          }}
          style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        >
          <ArrowSquareOut size={20} color={Colors.cocoa} weight="bold" />
          <Text style={styles.menuRowText}>유튜브에서 보기</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="자세히 보기"
          onPress={() => {
            const id = menuContent?.id
            setMenuContent(null)
            if (id) openContentDetail(id)
          }}
          style={({ pressed }) => [
            styles.menuRow,
            styles.menuRowLast,
            pressed && styles.pressed,
          ]}
        >
          <CaretRight size={20} color={Colors.cocoa} weight="bold" />
          <Text style={styles.menuRowText}>자세히 보기</Text>
        </Pressable>
      </BottomSheet>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.headerPaddingTop,
  },
  headerTitle: {
    paddingHorizontal: Layout.screenPaddingH,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPaddingH,
    gap: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    paddingTop: 2,
    paddingBottom: 12,
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  tabLabelOn: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Layout.headerContentGap,
  },
  featured: {
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    minHeight: 188,
    justifyContent: 'space-between',
    marginBottom: 24,
    overflow: 'hidden',
    ...Shadows.elevation,
  },
  featuredBg: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    zIndex: 1,
  },
  featuredBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 1,
  },
  badgePrimary: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgePrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredBottom: {
    zIndex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 4,
  },
  featuredMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  checkNotice: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  checkNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  checkList: {
    gap: 10,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...Shadows.elevation,
  },
  checkCardTour: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  checkIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkHistory: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOff: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipOn: {
    backgroundColor: Colors.selected,
    borderColor: Colors.selected,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextOn: {
    color: '#FFFFFF',
  },
  videoList: {
    gap: 14,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minWidth: 0,
  },
  videoMore: {
    width: 32,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSheet: {
    paddingTop: 4,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  thumbWrap: {
    width: 148,
    height: 84,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.creamyBeige,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 21,
    marginBottom: 6,
  },
  videoMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  coachOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 28,
  },
  coachScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  tourSpotlight: {
    position: 'absolute',
    top: 168,
    left: Layout.screenPaddingH,
    right: Layout.screenPaddingH,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    ...Shadows.elevation,
  },
  pressed: {
    opacity: 0.9,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
})
