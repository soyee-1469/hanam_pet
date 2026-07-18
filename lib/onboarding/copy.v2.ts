/**
 * 온보딩 버전2 — 피그마 `만들페이지` 스토리보드 원문에 가까운 카피
 * 출처: file Sz8wG7CIxyPkxCL9Gt4tUI · node 54:7409 구간
 *
 * 화면 바인딩용으로 v1과 같은 스키마를 유지하되, 문구는 스토리보드 원문에 맞춤.
 */
export const onboardingCopyV2 = {
  version: 'v2' as const,

  splash: {
    title: '마음챙김의 모든 것',
    body: '언제나 곁에 있는 나만의 펫과 함께\n매일 마음을 힐링해요',
  },

  gate: {
    title: '하치 & 나미',
    sub: '마음을 돌보는 나의 펫',
    primary: '처음 방문했어요',
    secondary: '이미 함께 하고 있어요',
    hint: '이전부터 이용했다면 이어보기 번호로 계속 사용해 보세요',
  },

  intro: {
    header: '서비스 소개',
    ctaContinue: '다음',
    ctaNext: '다음',
    skip: '건너뛰기',
    /** 투어 4장 — brand → help → features → privacy (피그마 좌→우 순서) */
    slides: [
      {
        key: 'brand' as const,
        title: '마음을 돌보는 친구\n힐링펫',
        body: '매일 스스로를 돌보는 습관을 만들고\n마음을 함께 나누어요.',
      },
      {
        key: 'help' as const,
        title: '힘들 땐 언제든\n도움받을 수 있어요',
        body: '마음이 무거운 날엔 아래로 바로 연결할 수 있어요.\n언제든지 혼자가 아니에요.',
      },
      {
        key: 'features' as const,
        title: '펫과 함께\n매일 나의 마음을 돌봐요',
        body: '다섯 가지 방법으로 마음을 살펴요!',
      },
      {
        key: 'privacy' as const,
        title: '일기와 대화 내용을\n안전하게 보관해요',
        body: '이름 없이 익명으로 이용할 수 있어요.\n힐링펫은 마음을 돌보는 친구일 뿐, 전문 치료를 대신하지 않아요.',
      },
    ],
    features: [
      {
        key: 'pet',
        title: '나만의 펫 키우기',
        body: '매일매일 사료를 주고 놀아주면서 펫을 무럭무럭 성장시켜요',
      },
      {
        key: 'chat',
        title: '나의 펫과 대화하기',
        body: '공감형 펫과 대화하며 마음을 나누며 위로와 공감을 받아요',
      },
      {
        key: 'diary',
        title: '마음 기록하기',
        body: '하루의 기분과 감정을 돌아보고 일기장에 마음을 글로 풀어내요',
      },
      {
        key: 'fill',
        title: '마음 채우기',
        body: '나를 다독여주고 변화할 수 있도록 돕는 영상 콘텐츠를 만나요',
      },
      {
        key: 'check',
        title: '마음 살피기',
        body: '현재 나의 감정 상태를 스스로 체크하고 객관적으로 마음을 들여다 봐요',
      },
    ],
    helpLines: [
      {
        name: '자살예방 상담전화',
        phone: '109',
        phoneDisplay: '109',
        note: '24시간 자살예방 및 위기상황 전문 상담',
      },
      {
        name: '생명의 전화',
        phone: '15889191',
        phoneDisplay: '1588-9191',
        note: '24시간 마음을 다독이는 위기 극복 상담',
      },
      {
        name: '정신건강 위기상담 전화',
        phone: '15770199',
        phoneDisplay: '1577-0199',
        note: '24시간 정신건강 상담 및 마음 지킴 지원',
      },
    ],
    helpConnect: '연결',
  },

  diaryRecord: {
    bubble: '오늘 기분은 어땠어?\n같이 짧게 적어보자.',
    title: '마음 일기',
    body: '하루의 감정을 남기고,\n한 달의 흐름을 돌아볼 수 있어요.',
    image: 'soft' as const,
    skip: '건너뛰기',
    cta: '다음',
  },

  healingContent: {
    bubble: '지친 날엔 이런 소리랑\n이야기가 있어.',
    title: '힐링 콘텐츠',
    body: '자연 소리, 음악, 가이드로\n마음을 다독여 보세요.',
    image: 'tired' as const,
    skip: '건너뛰기',
    cta: '계속하기',
  },

  mindCheck: {
    bubble: '오늘 마음은 어떤지\n같이 살펴볼까?',
    title: '마음 체크',
    body: '간단한 질문으로 상태를 확인하고,\n필요할 때 도움을 받을 수 있어요.',
    image: 'wink' as const,
    skip: '건너뛰기',
    cta: '다음',
  },

  terms: {
    header: '약관 및 정책 동의',
    headline: '서비스 이용을 위해\n약관 및 정책에 동의해 주세요',
    sub: '',
    allAgree: '전체 동의',
    allAgreeHint: '',
    footerNote:
      "아래의 '동의하고 계속하기' 버튼을 누르면 [개인정보처리방침]을 확인하거나 동의한 것으로 간주해요.",
    ctaNudge: '필수 약관에 동의해 주세요.',
    ctaDisabled: '동의하고 계속하기',
    cta: '동의하고 계속하기',
    dummyBodies: {
      service:
        '힐링펫 이용약관(더미)\n\n본 약관은 하남이네 힐링펫 서비스 이용과 관련하여 필요한 사항을 정합니다.\n\n1. 서비스는 마음챙김·펫 케어·대화·감정일기 기능을 제공합니다.\n2. 이용자는 서비스 목적에 맞게 성실히 이용해 주세요.\n3. 서비스 내용은 운영상 필요에 따라 변경될 수 있습니다.\n4. 자세한 조항은 추후 정식 약관 문서로 연결됩니다.\n\n끝까지 읽어 주셔서 감사합니다.',
      privacy:
        '개인정보 수집·이용 동의(더미)\n\n서비스 제공을 위해 닉네임, 이용 기록 등 최소한의 정보를 처리할 수 있어요.\n\n· 수집 목적: 맞춤 케어, 서비스 개선\n· 보유 기간: 회원 탈퇴 또는 관련 법령에 따른 기간\n· 동의 거부 시: 일부 기능 이용이 제한될 수 있어요\n\n자세한 내용은 개인정보처리방침에서 확인할 수 있어요.',
      sensitive:
        '민감정보 수집·이용 동의(더미)\n\n감정일기·대화 등에서 건강·정서와 관련된 민감정보가 포함될 수 있어요.\n\n· 이용 목적: 정서 지원 서비스 제공\n· 보호 조치: 불필요한 식별정보는 최소화해요\n· 동의는 필수이며, 거부 시 관련 기능을 쓰기 어려울 수 있어요\n\n민감정보는 서비스 목적 범위에서만 처리됩니다.',
      marketing:
        '마케팅 정보 수신(선택, 더미)\n\n이벤트·새 기능·마음챙김 팁 등 유용한 소식을 가끔 알려드릴 수 있어요.\n\n· 수신 거부: 설정에서 언제든 끌 수 있어요\n· 동의하지 않아도 서비스 이용에는 문제가 없어요\n\n원하지 않으면 체크하지 않아도 됩니다.',
    },
    items: [
      { key: 'service' as const, label: '[필수] 이용약관 동의', required: true },
      {
        key: 'privacy' as const,
        label: '[필수] 개인정보 수집·이용 동의',
        required: true,
      },
      {
        key: 'sensitive' as const,
        label: '[필수] 민감정보 수집·이용 동의',
        required: true,
      },
    ],
  },

  profile: {
    header: '기본 정보',
    headline: '나만을 위한 맞춤 케어를 위해\n정보를 입력해 주세요',
    sub: '이 정보는 설정 메뉴에서 언제든지 바꿀 수 있어요.',
    label: '내 닉네임',
    placeholder: '닉네임을 입력해 주세요',
    hintInvalid: '2자 이상 입력해 주세요',
    maxHint: '최대 8글자까지 입력할 수 있어요',
    ageLabel: '연령대',
    ageOptions: [
      { id: '10s' as const, label: '10대' },
      { id: '20s' as const, label: '20대' },
      { id: '30s' as const, label: '30대' },
      { id: '40s' as const, label: '40대' },
      { id: '50plus' as const, label: '50대 이상' },
    ],
    genderLabel: '성별',
    genderOptions: [
      { id: 'female' as const, label: '여성' },
      { id: 'male' as const, label: '남성' },
      { id: 'unspecified' as const, label: '선택 안 함' },
    ],
    cheerEmpty: '닉네임이 궁금해요!',
    cheerWith: (name: string) => `반가워, ${name}!`,
    cta: '다음',
  },

  restoreCode: {
    header: '나의 번호 챙기기',
    headline:
      "기존 내 정보를 그대로 쓸 수 있도록\n'기록 가져오기 번호'를 만들었어요",
    body: "이 '기록 가져오기 번호'가 있으면 지금 쓰는 휴대폰을 바꾸거나 앱을 다시 설치해도 다시 가입하지 않고 계속 이어서 쓸 수 있어요.",
    codeLabel: '나의 번호',
    dummyCode: '48291736',
    tip: '메모장에 적어두거나 스크린샷으로 보관해 주세요.',
    cta: '번호 복사하고 계속하기',
    ctaBusy: '복사 중…',
    savingMessage: '번호를 클립보드에 복사하는 중이에요',
    copiedToast: '클립보드에 복사되었어요!',
    sheetTitle: '번호를 안전하게 보관해요',
    sheetBody:
      '클립보드에 번호를 복사해 드릴게요. 메모장에 붙여 넣거나, 이 화면을 스크린샷으로 남겨 두세요.',
    sheetPrimary: '복사하고 계속하기',
    sheetAlt: '나중에 할게요',
  },

  welcome: {
    title: (name: string) => `이제 ${name}와\n인사해볼까요?`,
    body: (_name: string) =>
      '오늘의 무료 활동이 기다리고 있어요. 배운 그대로, 편하게 시작해 보세요.',
    cta: '시작하기',
  },

  petSelect: {
    header: '추가 정보',
    headline: '나와 함께 할\n펫 친구를 골라주세요',
    sub: '펫의 종류와 이름은 언제든지 바꿀 수 있어요.',
    speciesLabel: '펫 친구',
    nameLabel: '펫 이름',
    namePlaceholder: '펫 이름을 입력해 주세요',
    nameHint: '지어준 이름으로 앞으로 펫을 부를 거예요.',
    nameHintInvalid: '2자 이상 입력해 주세요',
    nameMaxHint: '최대 8글자까지 입력할 수 있어요',
    cta: '다음',
    ctaWith: (_name: string) => '다음',
    pets: [
      {
        id: 'mongi' as const,
        name: '하치',
        species: '강아지',
        tag: '든든한 강아지 친구',
        greeting: '기다리고 있었어! 멍!',
        traits: [
          { emoji: '🧡', label: '든든함' },
          { emoji: '🌿', label: '차분함' },
        ],
      },
      {
        id: 'nami' as const,
        name: '나미',
        species: '고양이',
        tag: '포근한 고양이 친구',
        greeting: '나랑 같이 갈래? 냥!',
        traits: [
          { emoji: '💛', label: '포근함' },
          { emoji: '☁️', label: '편안함' },
        ],
      },
    ],
  },

  resume: {
    header: '기록 가져오기',
    code: {
      headline: '이전 기록 그대로 이어하고 싶다면\n기록 가져오기 번호를 입력해 주세요',
      body: "첫 회원가입 때 알려 드린 8자리 가져오기 번호는 휴대폰 사진첩(갤러리)에 자동 저장된 안내 카드 또는 예전 휴대폰의 '하남이네 힐링펫' 앱 [설정 > 내 정보]에서 확인할 수 있어요.",
      placeholder: '예: 48291736',
      lostLink: '번호가 기억나지 않아요',
      cta: '기록 가져오기',
      ctaBusy: '불러오는 중…',
      loadingMessage: '기록을 안전하게 불러오는 중이에요',
      wrongCode: '번호가 맞지 않아요. 다시 확인해 주세요.',
    },
    lost: {
      headline: '번호를 잊으셨나요?',
      body: '괜찮아요. 아래 방법을 천천히 확인해 보세요. 개인정보(이름·연락처)는 묻지 않는 익명 서비스예요.',
      tips: [
        {
          key: 'gallery',
          title: '갤러리에서 사진을 확인해 보세요',
          body: '가입할 때 스크린샷으로 남겨 둔 8자리 번호가 사진첩에 있을 수 있어요.',
        },
        {
          key: 'device',
          title: '기기 변경을 하셨나요?',
          body: '예전 휴대폰 앱의 [설정 > 내 정보]에서 가져오기 번호를 확인할 수 있어요.',
        },
      ],
      note: '번호를 찾으시면 다시 입력해 주세요. 찾지 못했다면 새 마음 기록을 시작해 주세요.',
      retry: '번호 다시 입력하기',
      restart: '처음부터 새로 시작하기',
      cantFind: '찾을 수가 없어요',
      giveUp: {
        title: '번호가 기억나지 않으시나요?',
        privacyTitle: '개인정보를 묻지 않아요.',
        privacyParagraphs: [
          [
            {
              text: '하남이네 힐링펫은 소중한 개인정보(이름, 연락처 등)를 일절 수집하지 않는 익명 서비스예요.',
            },
          ],
          [
            {
              text: '개인정보를 보호하기 위해 시스템에 개인 식별 정보를 저장하지 않으므로, 센터 관리자도 가져오기 번호를 따로 찾아드릴 수 없어요.',
            },
          ],
          [
            {
              text: '만약 사진첩에서 번호 안내 카드나 예전 휴대폰 앱에서 번호를 찾지 못하셨다면, 기록을 가져오는 건 불가능해요. 아쉽지만 새로운 마음 기록을 시작해야 해요.',
            },
          ],
        ],
        restart: '처음부터 새로 시작하기',
        lookAgain: '한 번 더 찾아볼게요',
      },
    },
    restored: {
      headline: '이전 기록을 모두 가져왔어요',
      body: '기존에 사용하던 대화와 마음일기 내용, 기본정보를 모두 성공적으로 복원했어요!',
      cta: '이어서 시작하기',
      homeBubble: '기다리고 있었어! 다시 만나서 정말 기뻐!',
    },
  },
} as const
