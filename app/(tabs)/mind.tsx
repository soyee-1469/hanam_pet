import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Info,
  Lightning,
  Moon,
  Play,
  ArrowSquareOut,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout, HeaderTitleStyle, tabBarReserveHeight } from '../../constants/Layout'
import {
  MIND_CONTENTS,
  MIND_CHECKS,
  MIND_FEATURED,
  formatPublishedAt,
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
import { TabSceneGate } from '../../components/TabSceneGate'
import { EojeolText } from '../../components/EojeolText'
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
  return (
    <TabSceneGate>
      <MindScreenBody />
    </TabSceneGate>
  )
}

function MindScreenBody() {
  const insets = useSafeAreaInsets()
  const tabBarSpace = tabBarReserveHeight(insets.bottom)
  const params = useLocalSearchParams<{ segment?: string }>()
  /** Skip one focus-reset after consuming `?segment=` (avoids clear→fill race). */
  const skipNextFillReset = useRef(false)
  const [tab, setTab] = useState<TabId>('fill')
  const [filter, setFilter] = useState<MindMoodFilter>('all')
  const [results, setResults] = useState<MindCheckResultRecord[]>([])
  const [petName, setPetName] = useState('하치')
  const [tourIndex, setTourIndex] = useState<number | null>(
    getPetTourStepIndex(),
  )
  const checkListRef = useRef<View>(null)
  const [checkSpot, setCheckSpot] = useState<{
    x: number
    y: number
    w: number
    h: number
  } | null>(null)
  const [playing, setPlaying] = useState<MindContent | null>(null)
  const [menuContent, setMenuContent] = useState<MindContent | null>(null)

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

  useEffect(() => {
    if (!tourHighlightCheck) {
      setCheckSpot(null)
      return
    }
    const t = requestAnimationFrame(() => {
      checkListRef.current?.measureInWindow((x, y, w, h) => {
        if (w > 0 && h > 0) setCheckSpot({ x, y, w, h })
      })
    })
    return () => cancelAnimationFrame(t)
  }, [tourHighlightCheck, tab, results])

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
        skipNextFillReset.current = true
        router.setParams({ segment: undefined })
      } else if (skipNextFillReset.current) {
        skipNextFillReset.current = false
      } else if (!showMindTour) {
        setTab('fill')
      }
      let alive = true
      void getMindCheckResults().then((list) => {
        if (alive) setResults(list)
      })
      return () => {
        alive = false
      }
    }, [params.segment, showMindTour]),
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
                <EojeolText style={[styles.tabLabel, on && styles.tabLabelOn]}>
                  {t.label}
                </EojeolText>
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
              accessibilityLabel={`${MIND_FEATURED.title} 자세히 보기`}
              onPress={() => openContentDetail(MIND_FEATURED.id)}
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
                      accessibilityLabel={`${item.title} 자세히 보기`}
                      onPress={() => openContentDetail(item.id)}
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
                      </View>
                      <View style={styles.videoCopy}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.videoMeta}>
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
            <View
              style={styles.checkNotice}
              accessible
              accessibilityLabel="자신의 증상을 직접 확인하고 작성한 자가보고식 평가 결과는 참고용으로, 의학적 진단을 대체하지 않아요."
            >
              <View style={styles.checkNoticeIcon}>
                <Info size={18} color={Colors.selected} weight="fill" />
              </View>
              <Text style={styles.checkNoticeText}>
                자신의 증상을 직접 확인하고 작성한 자가보고식 평가 결과는
                참고용으로, 의학적 진단을 대체하지 않아요.
              </Text>
            </View>

            <View
              ref={checkListRef}
              collapsable={false}
              style={[
                styles.checkList,
                tourHighlightCheck && styles.checkListTourHidden,
              ]}
            >
              {MIND_CHECKS.map((check) => {
                const IconComp = CHECK_ICON[check.icon]
                const latest = latestForCheck(results, check.id)
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
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.checkIconWrap}>
                      <IconComp
                        size={22}
                        color={Colors.cocoa}
                        weight="regular"
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{check.title}</Text>
                      <Text style={styles.rowMeta}>
                        {check.code} · {check.questions}문항 · 약 {check.minutes}
                        분
                      </Text>
                      <Text
                        style={[
                          styles.checkHistory,
                          !latest && styles.checkHistoryEmpty,
                        ]}
                      >
                        {latest
                          ? `최근 평가 ${formatResultDateYmd(latest.at)}`
                          : '검사 이력 없음'}
                      </Text>
                    </View>
                    <CaretRight
                      size={18}
                      color={Colors.taupe}
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
        <>
          <View style={styles.coachScrimLayer} pointerEvents="auto">
            <View style={styles.coachScrim} />
          </View>
          {checkSpot ? (
            <View
              pointerEvents="box-none"
              style={[
                styles.checkTourSpot,
                {
                  left: checkSpot.x - 4,
                  top: checkSpot.y - 4,
                  width: checkSpot.w + 8,
                },
              ]}
            >
              {MIND_CHECKS.map((check) => {
                const IconComp = CHECK_ICON[check.icon]
                const latest = latestForCheck(results, check.id)
                return (
                  <Pressable
                    key={`tour-${check.id}`}
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
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.checkIconWrap}>
                      <IconComp
                        size={22}
                        color={Colors.cocoa}
                        weight="regular"
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{check.title}</Text>
                      <Text style={styles.rowMeta}>
                        {check.code} · {check.questions}문항 · 약{' '}
                        {check.minutes}분
                      </Text>
                      <Text
                        style={[
                          styles.checkHistory,
                          !latest && styles.checkHistoryEmpty,
                        ]}
                      >
                        {latest
                          ? `최근 평가 ${formatResultDateYmd(latest.at)}`
                          : '검사 이력 없음'}
                      </Text>
                    </View>
                    <CaretRight size={18} color={Colors.taupe} weight="bold" />
                  </Pressable>
                )
              })}
            </View>
          ) : null}
          <CoachmarkTourCard
            step={tourStep}
            stepIndex={tourIndex ?? 0}
            petName={petName}
            onNext={onPetTourNext}
            bottom={tabBarSpace + 16}
          />
        </>
      ) : null}

      <YouTubeVideoModal
        visible={playing != null}
        onClose={() => setPlaying(null)}
        title={playing?.title}
        subtitle={
          playing ? `${playing.mood} · ${playing.minutes}분` : undefined
        }
        externalUrl={playing?.externalUrl}
        thumbnailUrl={playing?.thumbnailUrl}
      />

      <BottomSheet
        visible={menuContent != null}
        onRequestClose={() => setMenuContent(null)}
        sheetStyle={styles.menuSheet}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle} numberOfLines={2}>
            {menuContent?.title ?? ''}
          </Text>
          {menuContent ? (
            <Text style={styles.menuMeta} numberOfLines={1}>
              {menuContent.mood} · {menuContent.minutes}분
            </Text>
          ) : null}
        </View>
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
          <View style={styles.menuIconWrap}>
            <Play size={18} color={Colors.cocoa} weight="fill" />
          </View>
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
          <View style={styles.menuIconWrap}>
            <ArrowSquareOut size={18} color={Colors.cocoa} weight="bold" />
          </View>
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
          <View style={styles.menuIconWrap}>
            <CaretRight size={18} color={Colors.cocoa} weight="bold" />
          </View>
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
    color: Colors.textPrimary,
    marginBottom: 14,
    ...HeaderTitleStyle.tab,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Layout.tabMenuPaddingTop,
    paddingBottom: Layout.tabMenuPaddingBottom,
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
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
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: 14,
    paddingBottom: Layout.blockGap,
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
    fontSize: 18,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  checkNoticeIcon: {
    marginTop: 1,
  },
  checkNoticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  checkList: {
    gap: 8,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 84,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Layout.cardPaddingH,
    paddingVertical: Layout.blockGap,
    ...Shadows.elevation,
  },
  checkIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkHistory: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  checkHistoryEmpty: {
    color: Colors.taupe,
    opacity: 0.72,
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
    paddingTop: 2,
    paddingBottom: 4,
  },
  menuHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  menuMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowText: {
    flex: 1,
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
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  coachScrimLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  coachScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  checkListTourHidden: {
    opacity: 0,
  },
  checkTourSpot: {
    position: 'absolute',
    zIndex: 30,
    elevation: 30,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    padding: 6,
    gap: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
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
