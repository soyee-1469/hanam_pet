import type { ReactNode } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretLeft, CaretRight } from 'phosphor-react-native'
import { Colors, Shadows } from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { ScreenHeader } from '../ui'
import type { CandidateItem, CatalogPageId, ExistingItem } from './data'
import { CATALOG_PAGES, getPageIndex } from './data'

export function PathList({ paths }: { paths: string[] }) {
  const shown = paths.slice(0, 6)
  const rest = paths.length - shown.length
  return (
    <Text style={styles.paths}>
      {shown.join('\n')}
      {rest > 0 ? `\n…외 ${rest}곳` : ''}
    </Text>
  )
}

export function ExistingCard({ item }: { item: ExistingItem }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPath}>{item.path}</Text>
      <Text style={styles.itemNote}>{item.note}</Text>
    </View>
  )
}

export function CandidateCard({ item }: { item: CandidateItem }) {
  return (
    <View style={[styles.itemCard, styles.candidateCard]}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemNote}>{item.note}</Text>
      <Text style={styles.pathsLabel}>등장</Text>
      <PathList paths={item.paths} />
    </View>
  )
}

export function SectionBadge({
  label,
  recommend,
  gap,
}: {
  label: string
  recommend?: boolean
  gap?: boolean
}) {
  return (
    <Text
      style={[
        styles.sectionBadge,
        recommend && styles.sectionBadgeRec,
        gap && styles.sectionBadgeGap,
      ]}
    >
      {label}
    </Text>
  )
}

export function InventoryBlock({
  existing,
  candidates,
}: {
  existing?: ExistingItem[]
  candidates?: CandidateItem[]
}) {
  const hasExisting = (existing?.length ?? 0) > 0
  const hasCandidates = (candidates?.length ?? 0) > 0

  return (
    <View>
      {hasExisting ? (
        <>
          <SectionBadge label="이미 코드 공용 · 피그마에도" />
          {existing!.map((item) => (
            <ExistingCard key={item.path + item.name} item={item} />
          ))}
        </>
      ) : null}

      {hasCandidates ? (
        <>
          <SectionBadge
            label="피그마 컴포넌트 후보"
            recommend
            gap={hasExisting}
          />
          {candidates!.map((item) => (
            <CandidateCard key={item.name} item={item} />
          ))}
        </>
      ) : null}
    </View>
  )
}

function PageNav({ pageId }: { pageId: CatalogPageId }) {
  const index = getPageIndex(pageId)
  const total = CATALOG_PAGES.length
  const prev = index > 0 ? CATALOG_PAGES[index - 1] : null
  const next = index < total - 1 ? CATALOG_PAGES[index + 1] : null

  return (
    <View style={styles.pageNav}>
      <Pressable
        accessibilityRole="button"
        disabled={!prev}
        onPress={() => prev && router.replace(`/component-catalog/${prev.id}`)}
        style={({ pressed }) => [
          styles.pageNavBtn,
          !prev && styles.pageNavBtnDisabled,
          pressed && prev && styles.pressed,
        ]}
      >
        <CaretLeft
          size={16}
          color={prev ? Colors.selected : Colors.textDisabled}
          weight="bold"
        />
        <Text
          style={[styles.pageNavBtnText, !prev && styles.pageNavBtnTextDisabled]}
          numberOfLines={1}
        >
          {prev ? prev.title : '이전'}
        </Text>
      </Pressable>

      <Text style={styles.pageIndicator}>
        {index + 1}/{total}
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={!next}
        onPress={() => next && router.replace(`/component-catalog/${next.id}`)}
        style={({ pressed }) => [
          styles.pageNavBtn,
          styles.pageNavBtnRight,
          !next && styles.pageNavBtnDisabled,
          pressed && next && styles.pressed,
        ]}
      >
        <Text
          style={[styles.pageNavBtnText, !next && styles.pageNavBtnTextDisabled]}
          numberOfLines={1}
        >
          {next ? next.title : '다음'}
        </Text>
        <CaretRight
          size={16}
          color={next ? Colors.selected : Colors.textDisabled}
          weight="bold"
        />
      </Pressable>
    </View>
  )
}

export function CatalogPageShell({
  pageId,
  title,
  children,
}: {
  pageId: CatalogPageId
  title: string
  children: ReactNode
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={title}
        onBack={() => router.replace('/component-catalog')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageNav pageId={pageId} />
        {children}
        <PageNav pageId={pageId} />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/component-catalog')}
          style={({ pressed }) => [styles.footerBtn, pressed && styles.pressed]}
        >
          <Text style={styles.footerBtnText}>목록으로</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 40,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  introText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadows.elevation,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDisabled,
    marginBottom: 8,
  },
  previewLabelGap: {
    marginTop: 16,
  },
  previewBtn: {
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    justifyContent: 'center',
  },
  priorityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  priorityNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.creamyBeige,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.selected,
    overflow: 'hidden',
  },
  priorityBody: {
    flex: 1,
    gap: 2,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priorityWhy: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pathsLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.selected,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: Colors.selected,
    backgroundColor: Colors.creamyBeige,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  sectionBadgeRec: {
    color: Colors.surface,
    backgroundColor: Colors.selected,
  },
  sectionBadgeGap: {
    marginTop: 16,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  candidateCard: {
    backgroundColor: Colors.surfaceSecondary,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemPath: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.selected,
    marginBottom: 6,
  },
  itemNote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  paths: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: Colors.textDisabled,
  },
  pageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pageNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.creamyBeige,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  pageNavBtnRight: {
    justifyContent: 'flex-end',
  },
  pageNavBtnDisabled: {
    backgroundColor: Colors.surfaceSecondary,
  },
  pageNavBtnText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.selected,
  },
  pageNavBtnTextDisabled: {
    color: Colors.textDisabled,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  hubCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hubNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.creamyBeige,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.selected,
    overflow: 'hidden',
  },
  hubBody: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  hubSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  footerBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
})
