import { Linking, Alert } from 'react-native'

export type HelpContact = {
  id: string
  name: string
  phone: string
  phoneDisplay: string
  note: string
}

/** 대화 도움·긴급 상담 — chat-help / 배너 시트 공통 */
export const HELP_CONTACTS: HelpContact[] = [
  {
    id: 'suicide',
    name: '자살예방 상담전화',
    phone: '109',
    phoneDisplay: '109',
    note: '24시간 자살예방 및 위기상황 전문 상담',
  },
  {
    id: 'life',
    name: '생명의 전화',
    phone: '15889191',
    phoneDisplay: '1588-9191',
    note: '24시간 자살예방 및 위기상황 전문 상담',
  },
  {
    id: 'mental',
    name: '정신건강 위기상담 전화',
    phone: '15770199',
    phoneDisplay: '1577-0199',
    note: '24시간 정신건강 상담 및 마음 지킴 지원',
  },
  {
    id: 'hanam',
    name: '하남시 정신건강복지센터',
    phone: '0317936552',
    phoneDisplay: '031-793-6552',
    note: '하남시 정신건강 서비스',
  },
]

export async function dialHelpContact(phone: string, name: string) {
  const url = `tel:${phone}`
  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert('안내', '이 기기에서는 전화를 걸 수 없어요.')
      return
    }
    await Linking.openURL(url)
  } catch {
    Alert.alert('연결 실패', `${name}로 연결하지 못했어요.`)
  }
}
