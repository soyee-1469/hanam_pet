import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { Colors } from '../../constants/Colors'
import { Layout, HeaderTitleStyle } from '../../constants/Layout'

type TabScreenTitleProps = {
  title: string
  style?: StyleProp<ViewStyle>
}

/** 탭 루트 화면 타이틀 (설정·마음일기 등) */
export function TabScreenTitle({ title, style }: TabScreenTitleProps) {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    paddingHorizontal: Layout.screenPaddingH,
  },
  title: {
    color: Colors.textPrimary,
    ...HeaderTitleStyle.tab,
  },
})
