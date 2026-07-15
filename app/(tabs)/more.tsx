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
      android_ripple={{ color: 'transparent' }}
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
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <View
        style={[styles.row, (hovered) && styles.rowHover]}
        collapsable={false}
      >
        <View style={styles.rowIcon}>
          <IconComponent size={20} color={Colors.textSecondary} weight="light" />
        </View>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        <CaretRight
          size={18}
          color={Colors.textDisabled}
          weight="bold"
          style={{ transform: [{ translateX: chevronShift ? 3 : 0 }] }}
        />
      </View>
    </Pressable>
  )
}

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>설정</Text>
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
    paddingBottom: 100,
  },
  row: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowHover: {
    backgroundColor: Colors.surfaceSecondary,
  },
  rowIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
})
