import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { X, ArrowSquareOut } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Fonts } from '../constants/Typography'
import { OVERLAY_SCRIM } from './ui/AppOverlay'
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

type YouTubeVideoModalProps = {
  visible: boolean
  onClose: () => void
  title?: string
  /** YouTube watch / embed / short URL */
  externalUrl?: string
  /** 리스트와 동일한 썸네일 — 포스터 / video id 폴백 */
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
  externalUrl,
  thumbnailUrl,
}: YouTubeVideoModalProps) {
  useTabBarCoverWhileVisible(visible)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [playerReady, setPlayerReady] = useState(false)

  const videoId = useMemo(
    () => extractYoutubeVideoId(externalUrl, thumbnailUrl),
    [externalUrl, thumbnailUrl],
  )
  const embedUri = videoId ? youtubeEmbedUrl(videoId) : null
  const watchUri = videoId
    ? youtubeWatchUrl(videoId)
    : externalUrl?.startsWith('http')
      ? externalUrl
      : null

  const playerWidth = Math.min(width - 40, 560)
  const playerHeight = Math.round((playerWidth * 9) / 16)
  const showPoster = Boolean(thumbnailUrl && embedUri && !playerReady)

  useEffect(() => {
    if (!visible) setPlayerReady(false)
  }, [visible, embedUri])

  const openOnYoutube = () => {
    if (!watchUri) return
    void openExternalUrl(watchUri)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />
        <View style={[styles.card, { maxWidth: playerWidth + 32 }]}>
          <View style={styles.chrome}>
            <Text style={styles.title} numberOfLines={2}>
              {title ?? '영상 보기'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.pressed,
              ]}
            >
              <X size={20} color={Colors.cocoa} weight="bold" />
            </Pressable>
          </View>

          <View
            style={[
              styles.player,
              { width: playerWidth, height: playerHeight },
            ]}
          >
            {embedUri ? (
              <WebView
                source={{ uri: embedUri }}
                style={styles.webview}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                setSupportMultipleWindows={false}
                onLoadEnd={() => setPlayerReady(true)}
              />
            ) : (
              <View style={styles.fallback}>
                <Text style={styles.fallbackText}>
                  재생할 영상을 찾을 수 없어요.
                </Text>
              </View>
            )}
            {showPoster && thumbnailUrl ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.poster}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
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
                size={16}
                color={Colors.selected}
                weight="bold"
              />
              <Text style={styles.youtubeBtnText}>유튜브에서 보기</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    ...(Platform.OS === 'web'
      ? ({ position: 'fixed', inset: 0, zIndex: 10000 } as object)
      : null),
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.creamyBeige,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    ...Shadows.elevation,
  },
  chrome: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.uiBold,
    color: Colors.cocoa,
    lineHeight: 22,
    paddingTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
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
  poster: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: Fonts.uiMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  youtubeBtn: {
    marginTop: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  youtubeBtnText: {
    fontSize: 14,
    fontFamily: Fonts.uiBold,
    color: Colors.selected,
  },
  pressed: {
    opacity: 0.85,
  },
})
