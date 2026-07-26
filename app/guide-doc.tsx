import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CaretDown, CaretLeft, Check } from 'phosphor-react-native'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { BottomSheet } from '../components/ui/AppOverlay'
import {
  getLegalDoc,
  getLegalVersion,
  type LegalVersion,
} from '../lib/legalDocs'

export default function GuideDocScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const doc = getLegalDoc(typeof id === 'string' ? id : id?.[0])
  const [versionId, setVersionId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setVersionId(null)
    setPickerOpen(false)
  }, [doc?.id])

  const version: LegalVersion | null = useMemo(() => {
    if (!doc) return null
    return getLegalVersion(doc, versionId)
  }, [doc, versionId])

  if (!doc || !version) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>문서</Text>
          <View style={styles.sideSlot} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>문서를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const multiVersion = doc.versions.length > 1

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.sideBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {doc.title}
        </Text>
        <View style={styles.sideSlot} />
      </View>

      <View style={styles.versionWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`시행일 ${version.label}`}
          accessibilityHint={
            multiVersion ? '다른 버전을 선택할 수 있어요' : undefined
          }
          disabled={!multiVersion}
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.versionBtn,
            pressed && multiVersion && styles.pressed,
            !multiVersion && styles.versionBtnSingle,
          ]}
        >
          <Text style={styles.versionLabel}>{version.label}</Text>
          {multiVersion ? (
            <CaretDown size={18} color={Colors.cocoa} weight="bold" />
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator
      >
        {version.blocks.map((block, index) => {
          if (block.kind === 'chapter') {
            return (
              <Text
                key={`ch-${block.title}-${index}`}
                style={[
                  styles.chapterTitle,
                  index > 0 && styles.chapterTitleSpaced,
                ]}
              >
                {block.title}
              </Text>
            )
          }
          return (
            <View key={`art-${block.title}-${index}`} style={styles.article}>
              <Text style={styles.articleTitle}>{block.title}</Text>
              <Text style={styles.articleBody}>{block.body}</Text>
            </View>
          )
        })}
      </ScrollView>

      <BottomSheet
        visible={pickerOpen}
        onRequestClose={() => setPickerOpen(false)}
      >
        <Text style={styles.pickerTitle}>시행일 선택</Text>
        {doc.versions.map((v) => {
          const on = v.id === version.id
          return (
            <Pressable
              key={v.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setVersionId(v.id)
                setPickerOpen(false)
              }}
              style={({ pressed }) => [
                styles.pickerRow,
                on && styles.pickerRowOn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.pickerRowText, on && styles.pickerRowTextOn]}>
                {v.label}
              </Text>
              {on ? (
                <Check size={18} color={Colors.cocoa} weight="bold" />
              ) : (
                <View style={styles.pickerCheckSlot} />
              )}
            </Pressable>
          )
        })}
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.headerPaddingH,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    width: 40,
    height: 40,
  },
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  versionWrap: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 12,
  },
  versionBtn: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.beige,
    backgroundColor: Colors.surface,
  },
  versionBtnSingle: {
    justifyContent: 'flex-start',
  },
  versionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 48,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 14,
    marginTop: 4,
  },
  chapterTitleSpaced: {
    marginTop: 28,
  },
  article: {
    marginBottom: 22,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  articleBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingH,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  pickerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  pickerRowOn: {
    backgroundColor: Colors.creamyBeige,
  },
  pickerRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pickerRowTextOn: {
    fontWeight: '800',
  },
  pickerCheckSlot: {
    width: 18,
    height: 18,
  },
})
