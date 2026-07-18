import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CaretLeft, Play, ArrowUpRight } from 'phosphor-react-native'
import { Colors, Shadows } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { PrimaryButton, onboardingFooterStyle } from '../components/ui'
import { ExternalLinkModal } from '../components/ExternalLinkModal'
import { getMindContent } from '../constants/MindContent'

export default function MindContentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const content = getMindContent(typeof id === 'string' ? id : id?.[0])
  const [linkOpen, setLinkOpen] = useState(false)

  if (!content) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>콘텐츠</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>콘텐츠를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const externalUrl = content.externalUrl

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {content.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="외부에서 콘텐츠 열기"
            onPress={() => {
              if (externalUrl) setLinkOpen(true)
            }}
            style={({ pressed }) => [
              styles.bigPlay,
              pressed && styles.pressed,
            ]}
          >
            <Play size={36} color={Colors.primary} weight="fill" />
          </Pressable>
          <Text style={styles.meta}>
            {content.mood} · {content.minutes}분
          </Text>
          <Text style={styles.playState}>
            {externalUrl
              ? '외부 페이지에서 이어서 볼 수 있어요'
              : '콘텐츠를 준비 중이에요'}
          </Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.summary}>{content.summary}</Text>

        {externalUrl ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="외부 사이트로 이동"
            onPress={() => setLinkOpen(true)}
            style={({ pressed }) => [
              styles.linkHint,
              pressed && styles.pressed,
            ]}
          >
            <ArrowUpRight size={16} color={Colors.selected} weight="bold" />
            <Text style={styles.linkHintText}>웹에서 열기</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="외부에서 이어서 보기"
          emphasized
          disabled={!externalUrl}
          onPress={() => setLinkOpen(true)}
        />
      </View>

      {externalUrl ? (
        <ExternalLinkModal
          visible={linkOpen}
          url={externalUrl}
          onClose={() => setLinkOpen(false)}
        />
      ) : null}
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
    paddingHorizontal: 12,
    paddingTop: Layout.headerPaddingTop,
    paddingBottom: Layout.headerContentGap,
    minHeight: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 2,
    marginRight: 40,
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 16,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: Colors.cocoa,
    borderRadius: 24,
    paddingVertical: 40,
    marginBottom: 24,
    ...Shadows.elevation,
  },
  bigPlay: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  meta: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  playState: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 28,
  },
  summary: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  linkHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  linkHintText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.selected,
  },
  footer: {
    ...onboardingFooterStyle,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
})
