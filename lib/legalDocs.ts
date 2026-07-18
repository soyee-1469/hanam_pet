/** 이용 안내 · 약관 문서 (더미 — 정식 문서 연결 전) */

export type LegalDocId = 'terms' | 'privacy' | 'sensitive' | 'oss'

export type LegalSection = {
  title: string
  body: string
}

export type LegalDoc = {
  id: LegalDocId
  title: string
  sections: LegalSection[]
}

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  terms: {
    id: 'terms',
    title: '이용약관',
    sections: [
      {
        title: '제1조 (목적)',
        body: '본 약관은 하남이네 힐링펫(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
      },
      {
        title: '제2조 (정의)',
        body: '1. "서비스"란 회사가 제공하는 서비스를 의미하며, 이용자가 PC, 모바일 기기 등 단말기의 종류와 관계없이 이용할 수 있는 서비스를 말합니다.\n\n2. "이용자"란 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.',
      },
      {
        title: '제3조 (이용계약)',
        body: '이용계약은 이용자가 본 약관에 동의하고 이용 신청을 하며, 회사가 이를 승낙함으로써 성립합니다. 회사는 업무상 또는 기술상 지장이 없는 한 서비스 이용을 승낙합니다.',
      },
      {
        title: '제4조 (서비스의 내용)',
        body: '회사는 마음챙김, 펫 케어, 대화, 감정일기 등 정서 지원과 관련된 기능을 제공합니다. 서비스의 구체적인 내용은 운영상 필요에 따라 변경될 수 있습니다.',
      },
      {
        title: '제5조 (이용자의 의무)',
        body: '이용자는 관련 법령과 본 약관을 준수하며, 서비스 목적에 맞게 성실히 이용해 주세요. 타인의 권리를 침해하거나 서비스 운영을 방해하는 행위는 할 수 없습니다.',
      },
      {
        title: '제6조 (서비스의 변경·중단)',
        body: '회사는 운영상·기술상의 필요에 따라 서비스를 변경하거나 일시 중단할 수 있으며, 이 경우 앱 내 안내 등 합리적인 방법으로 고지합니다.',
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: '개인정보 처리방침',
    sections: [
      {
        title: '1. 수집하는 개인정보',
        body: '서비스 제공을 위해 닉네임, 이용 기록(감정일기·대화·케어 등) 등 최소한의 정보를 처리할 수 있습니다.',
      },
      {
        title: '2. 수집·이용 목적',
        body: '맞춤 케어 제공, 서비스 개선, 고객 문의 대응을 위해 개인정보를 이용합니다.',
      },
      {
        title: '3. 보유 및 이용 기간',
        body: '회원 탈퇴 시 또는 관련 법령에서 정한 기간까지 보관하며, 목적이 달성되면 지체 없이 파기합니다.',
      },
      {
        title: '4. 제3자 제공',
        body: '법령에 따른 경우를 제외하고 이용자의 개인정보를 외부에 제공하지 않습니다.',
      },
    ],
  },
  sensitive: {
    id: 'sensitive',
    title: '민감정보 처리 고지',
    sections: [
      {
        title: '1. 민감정보의 범위',
        body: '감정일기·대화 등에서 건강·정서와 관련된 정보가 포함될 수 있습니다.',
      },
      {
        title: '2. 이용 목적',
        body: '정서 지원 서비스 제공을 위해 민감정보를 처리할 수 있습니다.',
      },
      {
        title: '3. 보호 조치',
        body: '불필요한 식별정보는 최소화하며, 서비스 목적 범위에서만 처리합니다.',
      },
    ],
  },
  oss: {
    id: 'oss',
    title: '오픈소스 라이선스',
    sections: [
      {
        title: '사용 오픈소스',
        body: '힐링펫은 Expo / React Native, Expo Router, phosphor-react-native, AsyncStorage 등 오픈소스 소프트웨어를 사용합니다. 각 패키지는 해당 라이선스(주로 MIT)를 따릅니다.',
      },
      {
        title: '라이선스 안내',
        body: '전체 의존성 목록과 라이선스 전문은 앱 정식 배포 시 상세 목록으로 제공합니다.',
      },
    ],
  },
}

export function getLegalDoc(id: string | undefined): LegalDoc | null {
  if (!id) return null
  if (id in LEGAL_DOCS) return LEGAL_DOCS[id as LegalDocId]
  return null
}

/** TermsSheet 등 plain text가 필요할 때 */
export function legalDocToPlainText(doc: LegalDoc): string {
  return doc.sections
    .map((s) => `${s.title}\n\n${s.body}`)
    .join('\n\n')
}
