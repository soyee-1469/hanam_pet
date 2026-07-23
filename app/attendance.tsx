import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Colors } from '../constants/Colors'

/**
 * 출석 캘린더는 제거됨.
 * 홈 헤더 「출석 도장」메뉴 → AttendanceDoneDialog 팝업.
 * 딥링크/알림으로 /attendance 들어오면 홈으로 보냄.
 */
export default function AttendanceScreen() {
  useEffect(() => {
    router.replace('/(tabs)')
  }, [])

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={Colors.selected} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
})
