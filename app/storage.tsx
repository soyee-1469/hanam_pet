import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, Lightning } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'

type EnergyEntry = {
  id: string
  title: string
  time: string
  delta: number
}

const ENERGY_HISTORY: EnergyEntry[] = [
  { id: '1', title: '사료 주기', time: '오늘 14:20', delta: -10 },
  { id: '2', title: '출석 도장 보상', time: '오늘 09:12', delta: 30 },
  { id: '3', title: '놀아 주기', time: '어제 21:05', delta: -15 },
  { id: '4', title: '사료 받기', time: '어제 10:40', delta: 20 },
  { id: '5', title: '감정일기 작성', time: '어제 08:30', delta: 15 },
  { id: '6', title: '장난감 받기', time: '그제 19:18', delta: 25 },
]

export default function StorageScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.title}>내 보관함</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>에너지 내역</Text>
        <Text style={styles.sectionHint}>획득·사용한 에너지가 여기에 모예요.</Text>

        <View style={styles.list}>
          {ENERGY_HISTORY.map((item) => {
            const gained = item.delta > 0
            return (
              <View key={item.id} style={styles.row} collapsable={false}>
                <View style={styles.iconWrap}>
                  <Lightning
                    size={18}
                    color={gained ? Colors.secondary : Colors.textSecondary}
                    weight="fill"
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowTime}>{item.time}</Text>
                </View>
                <Text style={[styles.delta, gained ? styles.deltaGain : styles.deltaUse]}>
                  {gained ? `+${item.delta}` : `${item.delta}`}
                </Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.88,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionHint: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  list: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginRight: 12,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowTime: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  delta: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  deltaGain: {
    color: Colors.secondary,
  },
  deltaUse: {
    color: Colors.textSecondary,
  },
})
