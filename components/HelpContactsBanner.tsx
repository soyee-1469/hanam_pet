import { useMemo, useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  PanResponder,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { CaretUp } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { HelpContactsSheet } from './HelpContactsSheet'

const SWIPE_UP_THRESHOLD = 36

type HelpContactsBannerProps = {
  style?: StyleProp<ViewStyle>
  title?: string
  subtitle?: string
}

/**
 * 채팅 등 — 도움 배너 유지 + 탭/위로 스와이프 시 상담 기관 바텀시트
 */
export function HelpContactsBanner({
  style,
  title = '혼자 견디지 않아도 괜찮아요',
  subtitle = '위로 올리거나 눌러 상담 기관을 확인해요',
}: HelpContactsBannerProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy < -10 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderRelease: (_, g) => {
          if (g.dy < -SWIPE_UP_THRESHOLD || g.vy < -0.45) {
            setSheetOpen(true)
          }
        },
      }),
    [],
  )

  return (
    <>
      <View {...panResponder.panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="도움 받을 곳 보기"
          accessibilityHint="탭하거나 위로 밀면 상담 기관 연락처가 열려요"
          onPress={() => setSheetOpen(true)}
          style={({ pressed }) => [
            styles.banner,
            style,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={require('../assets/images/아이콘/도움.png')}
            style={styles.icon}
            accessibilityElementsHidden
          />
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{subtitle}</Text>
          </View>
          <View style={styles.caretWrap} accessibilityElementsHidden>
            <CaretUp
              size={16}
              color={Colors.selected}
              weight="bold"
            />
          </View>
        </Pressable>
      </View>

      <HelpContactsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    width: 28,
    height: 28,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  caretWrap: {
    paddingLeft: 2,
  },
  pressed: {
    opacity: 0.88,
  },
})
