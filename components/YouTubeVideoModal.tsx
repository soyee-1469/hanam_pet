import { useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { X, ArrowSquareOut } from 'phosphor-react-native'
import { Layout } from '../constants/Layout'
import { Colors, Shadows } from '../constants/Colors'
import {
  extractYoutubeVideoId,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../lib/youtube'
import { openExternalUrl } from './ExternalLinkModal'
import {
  acquireTabBarOverlay,
  releaseTabBarOverlay,
} from '../lib/tabBarOverlay'

/** 영상 포커스용 — 공통 스크림보다 조금 짙게 */
const VIDEO_SCRIM = 'rgba(91, 57, 39, 0.48)'

type YouTubeVideoModalProps = {
  visible: boolean
  onClose: () => void
  title?: string
  /** 제목 아래 보조 메타 (예: 불안 · 12분) */
  subtitle?: string
  /** YouTube watch / embed / short URL */
  externalUrl?: string
  /** 리스트와 동일한 썸네일 — video id 폴백 */
  thumbnailUrl?: string
}

function useTabBarCoverWhileVisible(visible: boolean) {
  useEffect(() => {
    if (!visible) return
    acquireTabBarOverlay()
    return () => {
      releaseTabBarOverlay()
    }
  }, [visible])
}

/** 앱 안 YouTube 임베드 재생 — 코코아·크림 크롬 */
export function YouTubeVideoModal({
  visible,
  onClose,
  title,
  subtitle,
  externalUrl,
  thumbnailUrl,
}: YouTubeVideoModalProps) {
  useTabBarCoverWhileVisible(visible)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const closingRef = useRef(false)

  const backdropOpacity = useRef(new Animated.Value(0)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardY = useRef(new Animated.Value(22)).current

  const videoId = useMemo(
    () => extractYoutubeVideoId(externalUrl, thumbnailUrl),
    [externalUrl, thumbnailUrl],
  )
  /** 앱에서 재생 탭 → 모달 열리면 바로 재생. 웹은 브라우저 정책상 mute 필요. */
  const embedUri = videoId
    ? youtubeEmbedUrl(videoId, {
        autoplay: true,
        mute: Platform.OS === 'web',
      })
    : null
  const watchUri = videoId
    ? youtubeWatchUrl(videoId)
    : externalUrl?.startsWith('http')
      ? externalUrl
      : null

  const playerWidth = Math.min(width - 40, 560)
  const playerHeight = Math.round((playerWidth * 9) / 16)

  useEffect(() => {
    if (!visible) {
      closingRef.current = false
      backdropOpacity.setValue(0)
      cardOpacity.setValue(0)
      cardY.setValue(22)
      return
    }

    closingRef.current = false
    backdropOpacity.setValue(0)
    cardOpacity.setValue(0)
    cardY.setValue(22)

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardY, {
        toValue: 0,
        friction: 8,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, backdropOpacity, cardOpacity, cardY])

  const requestClose = () => {
    if (!visible || closingRef.current) return
    closingRef.current = true
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardY, {
        toValue: 14,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      closingRef.current = false
      if (finished) onClose()
    })
  }

  const openOnYoutube = () => {
    if (!watchUri) return
    void openExternalUrl(watchUri)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.scrim, { opacity: backdropOpacity }]}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={requestClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />
        <Animated.View
          style={[
            styles.card,
            {
              maxWidth: playerWidth + 36,
              opacity: cardOpacity,
              transform: [{ translateY: cardY }],
            },
          ]}
        >
          <View style={styles.chrome}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {title ?? '영상 보기'}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              onPress={requestClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.pressed,
              ]}
            >
              <X size={18} color={Colors.cocoa} weight="bold" />
            </Pressable>
          </View>

          <View
            style={[
              styles.player,
              { width: playerWidth, height: playerHeight },
            ]}
          >
            {!embedUri ? (
              <View style={styles.fallback}>
                <Text style={styles.fallbackText}>
                  재생할 영상을 찾을 수 없어요.
                </Text>
              </View>
            ) : visible ? (
              <WebView
                key={embedUri}
                source={{ uri: embedUri }}
                style={styles.webview}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                setSupportMultipleWindows={false}
              />
            ) : null}
          </View>

          {watchUri ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="유튜브에서 보기"
              onPress={openOnYoutube}
              style={({ pressed }) => [
                styles.youtubeBtn,
                pressed && styles.pressed,
              ]}
            >
              <ArrowSquareOut
                size={17}
                color={Colors.selected}
                weight="bold"
              />
              <Text style={styles.youtubeBtnText}>유튜브에서 보기</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingH,
    ...(Platform.OS === 'web'
      ? ({ position: 'fixed', inset: 0, zIndex: 10000 } as object)
      : null),
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: VIDEO_SCRIM,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    zIndex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: Layout.cardPaddingH,
    paddingTop: Layout.blockGap,
    paddingBottom: Layout.blockGap,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elevation,
  },
  chrome: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    paddingRight: 4,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cocoa,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.creamyBeige,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  player: {
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.cardPaddingH,
    backgroundColor: Colors.surfaceSecondary,
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  youtubeBtn: {
    marginTop: 14,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: Layout.cardPaddingH,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  youtubeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.selected,
  },
  pressed: {
    opacity: 0.85,
  },
})
