import type { ReactNode } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Colors } from '../constants/Colors'
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  useDesignWindow,
} from '../lib/designWindow'

export { DESIGN_WIDTH, DESIGN_HEIGHT, useDesignWindow }

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
    flexDirection: 'column',
  },
})
