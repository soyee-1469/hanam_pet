import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CaretLeft, Play, ArrowSquareOut } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import { ExternalLinkModal } from '../components/ExternalLinkModal'
import { YouTubeVideoModal } from '../components/YouTubeVideoModal'
import {
  formatPublishedAt,
  getMindContent,
} from '../constants/MindContent'
import {
  extractYoutubeVideoId,
  youtubeWatchUrl,
} from '../lib/youtube'

export default function MindContentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const content = getMindContent(typeof id === 'string' ? id : id?.[0])
  const [playerOpen, setPlayerOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)

  const videoId = useMemo(
    () =>
      content
        ? extractYoutubeVideoId(content.externalUrl, content.thumbnailUrl)
        : null,
    [content],
  )
  const watchUrl = videoId
    ? youtubeWatchUrl(videoId)
    : content?.externalUrl
  const canPlay = Boolean(videoId || content?.externalUrl)

  if (!content) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            style={styles.sideBtn}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>마음 채우기</Text>
          <View style={styles.sideBtn} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>콘텐츠를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>마음 채우기</Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="앱에서 재생"
          disabled={!canPlay}
          onPress={() => {
            if (canPlay) setPlayerOpen(true)
          }}
          style={({ pressed }) => [
            styles.hero,
            pressed && canPlay && styles.pressed,
            !canPlay && styles.heroDisabled,
          ]}
        >
          <Image
            source={{ uri: content.thumbnailUrl }}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <View style={styles.heroScrim} pointerEvents="none" />
          {canPlay ? (
            <View style={styles.heroPlay} pointerEvents="none">
              <Play size={28} color="#FFFFFF" weight="fill" />
            </View>
          ) : null}
          <View style={styles.heroDuration} pointerEvents="none">
            <Text style={styles.heroDurationText}>{content.minutes}분</Text>
          </View>
        </Pressable>

        <View style={styles.metaRow}>
          <View style={styles.moodChip}>
            <Text style={styles.moodChipText}>{content.mood}</Text>
          </View>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{content.minutes}분</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {formatPublishedAt(content.publishedAt)}
          </Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.summary}>{content.summary}</Text>

        {watchUrl ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="유튜브에서 보기"
            onPress={() => setLinkOpen(true)}
            style={({ pressed }) => [
              styles.linkHint,
              pressed && styles.pressed,
            ]}
          >
            <ArrowSquareOut size={16} color={Colors.selected} weight="bold" />
            <Text style={styles.linkHintText}>유튜브에서 보기</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="앱에서 재생"
          emphasized
          disabled={!canPlay}
          onPress={() => setPlayerOpen(true)}
        />
      </View>

      <YouTubeVideoModal
        visible={playerOpen}
        onClose={() => setPlayerOpen(false)}
        title={content.title}
        subtitle={`${content.mood} · ${content.minutes}분`}
        externalUrl={content.externalUrl}
        thumbnailUrl={content.thumbnailUrl}
      />

      {watchUrl ? (
        <ExternalLinkModal
          visible={linkOpen}
          url={watchUrl}
          onClose={() => setLinkOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
  },
  hero: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.creamyBeige,
    aspectRatio: 16 / 9,
    marginBottom: 20,
    ...Shadows.elevation,
  },
  heroDisabled: {
    opacity: 0.7,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  heroPlay: {
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
  },
  heroDuration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroDurationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  moodChip: {
    backgroundColor: Colors.creamyBeige,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.selected,
  },
  metaDot: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDisabled,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 30,
  },
  summary: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 18,
  },
  linkHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  linkHintText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.selected,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
