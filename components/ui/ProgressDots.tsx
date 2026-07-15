import { View, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'

type ProgressDotsProps = {
  total: number
  index: number
}

/** Slim step progress — brand orange fill only */
export function ProgressDots({ total, index }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.seg, i <= index ? styles.segOn : styles.segOff]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    marginHorizontal: 3,
  },
  segOn: {
    backgroundColor: Colors.primary,
  },
  segOff: {
    backgroundColor: Colors.sand,
  },
})
