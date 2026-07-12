import { useState } from 'react'
import { View, Text, Pressable, Alert, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Camera,
  Gift,
  Lightning,
  Info,
  CaretRight,
} from 'phosphor-react-native'
import type { Icon } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'

const MORE_MENUS: { id: string; label: string; Icon: Icon }[] = [
  { id: 'album', label: '나의펫 앨범', Icon: Camera },
  { id: 'decorate', label: '꾸미기', Icon: Gift },
  { id: 'energy', label: '에너지 내역', Icon: Lightning },
  { id: 'guide', label: '서비스 안내', Icon: Info },
]

function MoreMenuRow({
  label,
  IconComponent,
  onPress,
}: {
  label: string
  IconComponent: Icon
  onPress: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [chevronShift, setChevronShift] = useState(false)

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => {
        setHovered(true)
        setChevronShift(true)
      }}
      onHoverOut={() => {
        setHovered(false)
        setChevronShift(false)
      }}
      onPressIn={() => setChevronShift(true)}
      onPressOut={() => setChevronShift(hovered)}
      style={({ pressed }) => [
        styles.row,
        { cursor: 'pointer' } as object,
        (hovered || pressed) && styles.rowHover,
      ]}
    >
      <IconComponent size={20} color={Colors.textSecondary} weight="light" />
      <Text style={styles.rowLabel}>{label}</Text>
      <CaretRight
        size={18}
        color={Colors.textDisabled}
        weight="bold"
        style={{ transform: [{ translateX: chevronShift ? 3 : 0 }] }}
      />
    </Pressable>
  )
}

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>더보기</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MORE_MENUS.map((item) => (
          <MoreMenuRow
            key={item.id}
            label={item.label}
            IconComponent={item.Icon}
            onPress={() => Alert.alert(item.label, '더미 화면입니다.')}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  list: {
    gap: 8,
    paddingBottom: 100,
  },
  row: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  rowHover: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
})
