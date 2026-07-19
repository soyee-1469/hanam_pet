/**
 * 개발용 피그마 컴포넌트 후보 허브 — 10개 페이지.
 * 라우트: /component-catalog
 * 진입: 설정(더보기) → 개발
 */
import { View, Text, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CaretRight, Info } from 'phosphor-react-native'
import { Colors } from '../../constants/Colors'
import { ScreenHeader } from '../../components/ui'
import { CATALOG_PAGES } from '../../components/component-catalog/data'
import { styles as catalogStyles } from '../../components/component-catalog/ui'

export default function ComponentCatalogHubScreen() {
  return (
    <SafeAreaView style={catalogStyles.safe} edges={['top']}>
      <ScreenHeader title="피그마 컴포넌트 후보" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={catalogStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={catalogStyles.intro}>
          <Info size={18} color={Colors.selected} weight="bold" />
          <Text style={catalogStyles.introText}>
            각 페이지 상단에 앱과 같은 크림·코코아 미리보기를 그려 두었어요.
            아래 후보 목록의 이름·경로는 피그마 매핑용입니다.
          </Text>
        </View>

        <Text style={catalogStyles.blockTitle}>페이지 목록</Text>

        {CATALOG_PAGES.map((page, index) => (
          <Pressable
            key={page.id}
            accessibilityRole="button"
            onPress={() => router.push(`/component-catalog/${page.id}`)}
            style={({ pressed }) => [
              catalogStyles.hubCard,
              pressed && catalogStyles.pressed,
            ]}
          >
            <Text style={catalogStyles.hubNum}>{index + 1}</Text>
            <View style={catalogStyles.hubBody}>
              <Text style={catalogStyles.hubTitle}>{page.title}</Text>
              <Text style={catalogStyles.hubSubtitle}>{page.subtitle}</Text>
            </View>
            <CaretRight size={18} color={Colors.selected} weight="bold" />
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [
            catalogStyles.footerBtn,
            pressed && catalogStyles.pressed,
          ]}
        >
          <Text style={catalogStyles.footerBtnText}>닫기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
