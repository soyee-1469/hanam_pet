/**
 * 온보딩 버전1 — UX 개선 + 중간 분량
 * 피그마 `만들페이지` 스토리보드 내용을 바탕으로 문장을 살렸되,
 * 한 화면에 읽기 부담이 과하지 않게 다듬은 버전.
 */
export const onboardingCopyV1 = {
  version: 'v1' as const,

  splash: {
    title: '마음챙김의 모든 것',
    body: '언제나 곁에 있는 나만의 펫과 함께\n매일 마음을 힐링해요.\n대화, 감정일기, 작은 미션으로\n하루를 가볍게 돌아볼 수 있어요.',
  },

  gate: {
    bubble: '안녕! 기다리고 있었어.\n오늘도 천천히 함께하자.',
    title: '몽이 & 나미',
    sub: '마음을 돌보는 나의 펫',
    valueLine: '오늘부터 작은 습관으로 마음을 돌봐요',
    primary: '처음 방문했어요',
    secondary: '기존 기록 불러오기',
    hint: '가입 없이 이어보기 번호로 기록을 불러올 수 있어요',
  },

  intro: {
    header: '서비스 소개',
    ctaContinue: '다음',
    ctaNext: '다음',
    skip: '건너뛰기',
    slides: [
      {
        key: 'overview',
        title: '우리가 함께할 일들',
        body: '놀고, 이야기하고, 마음을 적어 봐요.\n천천히 같이 해보자.',
        bubble: '만나서 정말 반가워!\n나랑 이런 거 같이 해볼래?',
        image: 'fun' as const,
      },
      {
        key: 'pet',
        title: '나만의 펫 키우기',
        body: '매일 사료를 주고 놀아주며\n함께 성장해 가요.',
        bubble: '같이 있으면 든든해!\n오늘도 나랑 놀아줄래?',
        image: 'wink' as const,
      },
      {
        key: 'chat',
        title: '펫과 마음 나누기',
        body: '힘든 하루도, 좋은 하루도\n편하게 말해 주세요.',
        bubble:
          '말하기 힘든 하루였다면\n나한테 천천히 말해줘.\n내가 옆에 있을게.',
        image: 'soft' as const,
      },
    ],
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
    header: '약관 동의',
    headline: '서비스 이용을 위해\n약관에 동의해 주세요',
    sub: '필수 항목만 동의하면 바로 시작할 수 있어요.\n마케팅 수신은 선택입니다.',
    allAgree: '필수 항목 모두 동의',
    allAgreeHint: '필수 약관 3개를 한 번에 선택해요',
    footerNote: '계속하면 개인정보 처리방침에 동의한 것으로 안내됩니다.',
    ctaNudge: '필수 약관에 동의해 주세요.',
    ctaDisabled: '필수 약관 동의하기',
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
      { key: 'service' as const, label: '이용약관 동의', required: true },
      {
        key: 'privacy' as const,
        label: '개인정보 수집·이용 동의',
        required: true,
      },
      {
        key: 'sensitive' as const,
        label: '민감정보 수집·이용 동의',
        required: true,
      },
      {
        key: 'marketing' as const,
        label: '마케팅 정보 수신',
        required: false,
      },
    ],
  },

  profile: {
    header: '나를 알려주세요',
    headline: '나만을 위한 맞춤 케어를 위해\n정보를 입력해 주세요',
    sub: '언제든지 설정에서 변경할 수 있어요.',
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
      { id: '50plus' as const, label: '50+' },
    ],
    genderLabel: '성별',
    genderOptions: [
      { id: 'female' as const, label: '여성' },
      { id: 'male' as const, label: '남성' },
      { id: 'unspecified' as const, label: '응답 안 함' },
    ],
    cheerEmpty: '닉네임이 궁금해요!',
    cheerWith: (name: string) => `반가워, ${name}!`,
    cta: '다음',
  },

  restoreCode: {
    header: '나의 번호 챙기기',
    headline: "기록을 이어갈 수 있는\n가져오기 번호를 만들었어요",
    body: '이 번호가 있으면 기기를 바꿔도 이어서 쓸 수 있어요.',
    codeLabel: '나의 번호',
    dummyCode: '48291736',
    tip: '메모장에 적어두거나 스크린샷으로 보관해 주세요.',
    cta: '저장하고 계속하기',
    ctaBusy: '저장 중…',
    savingMessage: '번호를 안전하게 저장하는 중이에요',
    copiedToast: '클립보드에 복사되었어요!',
  },

  welcome: {
    title: '저장이 완료되었어요!',
    body: (name: string) =>
      `이제 ${name}와 함께\n마음 여행을 시작해 볼까요?`,
    cta: '메인 화면으로 이동',
  },

  petSelect: {
    header: '친구 만나기',
    headline: '나와 함께 할 펫 친구를\n골라 주세요',
    sub: '펫의 종류는 나중에 바꿀 수 있어요.\n지금은 한 명을 골라 이야기를 시작해 보세요.',
    cta: '다음',
    ctaWith: (name: string) => `${name} 만나러 가기`,
    pets: [
      {
        id: 'mongi' as const,
        name: '몽이',
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
      headline: '이전 기록을 이어가려면\n가져오기 번호를 입력해 주세요',
      body: '처음 가입할 때 받은 8자리 번호예요.\n사진첩 안내 카드나, 예전 휴대폰 앱의\n[설정 > 내 정보]에서 확인할 수 있어요.',
      tipTitle: '확인해 주세요',
      tipBody:
        "8자리 숫자인 기록 가져오기 번호는\n휴대폰 사진첩(갤러리)에 자동 저장된 안내 카드 또는\n예전 휴대폰의 '하남이네 힐링펫' 앱의 [설정 > 내 정보]에서\n확인할 수 있어요.",
      placeholder: '예: 48291736',
      lostLink: '도움이 필요하신가요?',
      cta: '기록 가져오기',
      ctaBusy: '불러오는 중…',
      loadingMessage: '기록을 안전하게 불러오는 중이에요',
    },
    lost: {
      headline: '번호를 잊으셨나요?',
      body: '괜찮아요. 아래 방법을 천천히 확인해 보세요. 이름·연락처는 묻지 않는 익명 서비스예요.',
      tips: [
        {
          key: 'gallery',
          title: '갤러리에서 사진을 확인해 보세요',
          body: '가입할 때 저장해 둔 8자리 안내 카드가 사진첩에 있을 수 있어요.',
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
            { text: '하남이네 힐링펫은 소중한 개인정보(이름, 연락처 등)를 일절 수집하지 않는 ' },
            { text: '익명 서비스', bold: true },
            { text: '예요.' },
          ],
          [
            { text: '개인 식별정보와 가져오기 번호를 서버에 ' },
            { text: '저장하지 않아', bold: true },
            { text: ', 하남시정신건강복지센터 관리자도 번호를 ' },
            { text: '찾아드릴 수 없어요', bold: true },
            { text: '.' },
          ],
          [
            {
              text: '사진첩의 번호 안내 카드나 예전 휴대폰 앱에서 번호를 찾지 못했다면, 아쉽지만 새 마음 기록을 시작해야 해요.',
            },
          ],
        ],
        restart: '처음부터 새로 시작하기',
        lookAgain: '한 번 더 찾아볼게요',
      },
    },
    restored: {
      headline: '이전 기록을 모두 가져왔어요',
      body: '대화·마음일기·기본 정보를 이어갈 준비가 됐어요. 다시 만나서 반가워요.',
      cta: '이어서 시작하기',
      homeBubble: '기다리고 있었어! 다시 만나서 정말 기뻐!',
    },
  },
} as const

export type OnboardingCopy = typeof onboardingCopyV1
export type TermKeyV1 = (typeof onboardingCopyV1.terms.items)[number]['key']
