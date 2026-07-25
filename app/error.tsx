import { router, useLocalSearchParams } from 'expo-router'
import { ErrorStateScreen } from '../components/ErrorStateScreen'

function paramText(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0]?.trim() || fallback
  if (typeof value === 'string' && value.trim()) return value.trim()
  return fallback
}

/**
 * 공통 오류 화면.
 *
 * 예:
 * router.push({
 *   pathname: '/error',
 *   params: {
 *     header: '안내',
 *     title: '일시적으로 연결할 수 없어요',
 *     body: '네트워크 상태를 확인한 뒤\n다시 시도해 주세요.',
 *     primary: '다시 시도',
 *     tertiary: '홈으로',
 *   },
 * })
 */
export default function ErrorScreen() {
  const params = useLocalSearchParams<{
    header?: string
    title?: string
    body?: string
    primary?: string
    tertiary?: string
  }>()

  const headerTitle = paramText(params.header, '안내')
  const title = paramText(
    params.title,
    '문제가 생겼어요',
  )
  const body = paramText(
    params.body,
    '잠시 후 다시 시도해 주세요.\n계속되면 고객센터로 문의해 주세요.',
  )
  const primaryLabel = paramText(params.primary, '다시 시도')
  const tertiaryLabel = paramText(params.tertiary, '홈으로')

  const goBackOrHome = () => {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/(tabs)')
  }

  return (
    <ErrorStateScreen
      headerTitle={headerTitle}
      title={title}
      body={body}
      primaryLabel={primaryLabel}
      onPrimary={goBackOrHome}
      tertiaryLabel={tertiaryLabel}
      onTertiary={() => router.replace('/(tabs)')}
      onBack={goBackOrHome}
    />
  )
}
