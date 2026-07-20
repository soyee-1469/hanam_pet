import type { ReactNode } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useIsFocused } from 'expo-router'

/**
 * 탭 씬이 웹에서 아래에 겹쳐 남는 것을 막는다.
 * 비포커스 탭: 히트/스크린리더에서 제외 (상태는 유지).
 */
export function TabSceneGate({ children }: { children: ReactNode }) {
  const focused = useIsFocused()

  return (
    <View
      style={[styles.root, !focused && styles.inactive]}
      pointerEvents={focused ? 'auto' : 'none'}
      accessibilityElementsHidden={!focused}
      importantForAccessibility={focused ? 'yes' : 'no-hide-descendants'}
      // RN Web: hide inactive tab scenes from hit-testing & a11y tree
      {...(Platform.OS === 'web'
        ? ({ 'aria-hidden': !focused } as object)
        : null)}
      collapsable={false}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inactive: Platform.select({
    web: {
      display: 'none',
    },
    default: {},
  }) as object,
})
