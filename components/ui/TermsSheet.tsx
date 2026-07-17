import { useCallback, useRef, useState } from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { PrimaryButton } from './Button'

type TermsSheetProps = {
  visible: boolean
  title: string
  body: string
  onClose: () => void
  onConfirm: () => void
}

export function TermsSheet({
  visible,
  title,
  body,
  onClose,
  onConfirm,
}: TermsSheetProps) {
  const insets = useSafeAreaInsets()
  const [reachedEnd, setReachedEnd] = useState(false)
  const contentH = useRef(0)
  const layoutH = useRef(0)

  const reset = useCallback(() => {
    setReachedEnd(false)
    contentH.current = 0
    layoutH.current = 0
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleConfirm = () => {
    if (!reachedEnd) return
    reset()
    onConfirm()
  }

  const checkEnd = (offsetY: number) => {
    const max = contentH.current - layoutH.current
    if (max <= 8) {
      setReachedEnd(true)
      return
    }
    if (offsetY >= max - 24) setReachedEnd(true)
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    checkEnd(e.nativeEvent.contentOffset.y)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={handleClose} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              onPress={handleClose}
              style={styles.closeBtn}
            >
              <X size={22} color={Colors.textPrimary} weight="bold" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(_, h) => {
              contentH.current = h
              checkEnd(0)
            }}
            onLayout={(e) => {
              layoutH.current = e.nativeEvent.layout.height
              checkEnd(0)
            }}
          >
            <Text style={styles.body}>{body}</Text>
            {!reachedEnd ? (
              <Text style={styles.scrollHint}>아래로 끝까지 읽어 주세요</Text>
            ) : null}
          </ScrollView>

          <PrimaryButton
            label="확인했어요"
            disabled={!reachedEnd}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(91, 57, 39, 0.35)',
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 8,
    ...Shadows.elevation,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.sand,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingRight: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 360,
    marginBottom: 14,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  scrollHint: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDisabled,
    textAlign: 'center',
  },
})
