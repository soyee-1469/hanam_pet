import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Layout } from '../constants/Layout'
import { LegalDocSection, ScreenHeader } from '../components/ui'
import { getLegalDoc } from '../lib/legalDocs'

export default function GuideDocScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const doc = getLegalDoc(typeof id === 'string' ? id : id?.[0])

  if (!doc) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="문서" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>문서를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={doc.title} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator
      >
        {doc.sections.map((section, i) => (
          <LegalDocSection
            key={section.title}
            title={section.title}
            body={section.body}
            showDivider={i < doc.sections.length - 1}
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
  },
  body: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingBottom: 48,
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
})
