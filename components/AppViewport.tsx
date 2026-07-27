import type { ReactNode } from 'react'
import {
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScaledSize,
} from 'react-native'
import { Colors } from '../constants/Colors'

/** 디자인 기준 캔버스 */
export const DESIGN_WIDTH = 360
export const DESIGN_HEIGHT = 800

type AppViewportProps = {
  children: ReactNode
}

/**
 * 웹: 360×800 폰 프레임으로 고정 (캡처·미리보기 기준).
 * 네이티브: 실제 화면 그대로.
 */
export function AppViewport({ children }: AppViewportProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>
  }

  return (
    <View style={styles.shell} accessibilityLabel="앱 화면 360x800">
      <View style={styles.frame}>{children}</View>
    </View>
  )
}

/** 웹은 디자인 캔버스 크기, 네이티브는 실기기 크기 */
export function useDesignWindow(): ScaledSize {
  const win = useWindowDimensions()
  if (Platform.OS === 'web') {
    return {
      ...win,
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
    }
  }
  return win
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cocoa,
    ...Platform.select({
      web: {
        // 창이 작을 때 프레임이 잘리지 않게 스크롤
        overflow: 'auto',
      },
      default: {},
    }),
  },
  frame: {
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    // Stack 등 flex:1 자식이 프레임을 채우도록
    flexDirection: 'column',
  },
})
