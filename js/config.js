/* ====================================
   게임 설정 파일
   담당: 방채민 (난이도 옵션 정의, 점수 시스템 설계)
   ==================================== */

// 게임 난이도 설정
const DIFFICULTY = {
    EASY: {
        name: '하',
        pairs: 3,           // 4쌍 = 8장
        timeLimit: 60,      // 1분
        gridCols: 4,
        gridRows: 2,
        pointsPerMatch: 10,
        timePenalty: 5,     // 실패 시 5초 감점
        previewTime: 2500,  // 2.5초 미리 보기
        hearts: 5,          // 하트 5개
        matchingRule: 2,    // 2장 매칭
        color: {
            bg: '#E8F5E9',
            card: '#81C784',
            text: '#2E7D32'
        }
    },
    MEDIUM: {
        name: '중',
        pairs: 7,           // 8쌍 = 16장
        timeLimit: 90,      // 1.5분
        gridCols: 4,
        gridRows: 4,
        pointsPerMatch: 15,
        timePenalty: 10,
        previewTime: 4000,  // 4초 미리 보기
        hearts: 10,         // 하트 10개
        matchingRule: 2,    // 2장 매칭
        color: {
            bg: '#FFF3E0',
            card: '#FFB74D',
            text: '#E65100'
        }
    },
    HARD: {
        name: '상',
        pairs: 15,          // 15쌍 = 30장 (폭탄 2장 포함하여 총 32장)
        timeLimit: 90,      // 1.5분
        gridCols: 8,
        gridRows: 4,
        pointsPerMatch: 20,
        timePenalty: 15,
        previewTime: 0,     // 미리 보기 없음
        hearts: 20,         // 하트 20개
        matchingRule: 2,    // 2장 매칭
        color: {
            bg: '#FFEBEE',
            card: '#E57373',
            text: '#C62828'
        }
    },
    HELL: {
        name: '지옥',
        sets: 19,           // 19세트 (3장 매칭) = 57장
        pairs: 19,          // 호환성을 위해 pairs도 설정 (실제로는 sets 사용)
        timeLimit: 60,      // 1분
        gridCols: 11,
        gridRows: 6,        // 11x6 = 66장 (57장 + 히든 3장 + 폭탄 6장 = 66장)
        pointsPerMatch: 30,
        timePenalty: 20,
        previewTime: 5000,  // 5초 미리 보기
        hearts: 25,         // 하트 25개
        matchingRule: 3,    // 3장 매칭
        specialCards: {
            bombs: 6,           // 폭탄 카드 6장
            shuffle: true,      // 카드 섞임 효과
            instantDeath: true  // 즉사 메커니즘
        },
        color: {
            bg: '#FFCDD2',   // 어두운 레드
            card: '#D32F2F',
            text: '#C62828'
        }
    },
    // FUTURE FEATURE: 재앙 모드 (3장 매칭 시스템 구현 필요)
    // DISASTER: {
    //     name: '재앙',
    //     pairs: 12,          // 12쌍 = 36장 (3장 매칭)
    //     timeLimit: 75,      // 1분 15초
    //     gridCols: 6,
    //     gridRows: 6,
    //     pointsPerMatch: 25,
    //     timePenalty: 18,
    //     matchingRule: 3,    // 3장 매칭 - 구현 필요
    //     previewTime: 0,
    //     hearts: 25,
    //     specialCards: {
    //         bombs: 2        // 폭탄 카드 기능 구현 필요
    //     },
    //     color: {
    //         bg: '#E1BEE7',
    //         card: '#9C27B0',
    //         text: '#4A148C'
    //     }
    // },

    // FUTURE FEATURE: 지옥 모드 (특수 카드 및 고급 메커니즘 구현 필요)
    // HELL: {
    //     name: '지옥',
    //     pairs: 22,          // 22쌍 = 44장
    //     timeLimit: 60,      // 1분
    //     gridCols: 8,
    //     gridRows: 6,
    //     pointsPerMatch: 30,
    //     timePenalty: 20,
    //     previewTime: 0,
    //     hearts: 25,
    //     specialCards: {
    //         bombs: 4,           // 폭탄 카드 기능 구현 필요
    //         shuffle: true,      // 카드 섞임 효과 구현 필요
    //         instantDeath: true  // 즉사 메커니즘 구현 필요
    //     },
    //     color: {
    //         bg: '#212121',
    //         card: '#D32F2F',
    //         text: '#FFEBEE'
    //     }
    // }
};

// 캔버스 설정
const CANVAS_CONFIG = {
    width: 1200,
    height: 800,
    backgroundColor: '#FFFFFF',
    // 난이도별 캔버스 크기 (지옥 난이도는 더 큰 배경)
    hell: {
        width: 1600,
        height: 1000
    }
};

// 카드 설정 (세로 직사각형, 에셋 비율 379:529 유지)
const CARD_CONFIG = {
    width: 95,              // 원본 379 → 95 (약 1/4 축소)
    height: 133,            // 원본 529 → 133 (비율 유지)
    cornerRadius: 12,       // 둥근 모서리
    margin: 12,             // 카드 간격
    backColor: '#FFB4D1',   // 파스텔 핑크
    flipDuration: 300,      // ms
    matchDelay: 500,        // 성공 시 대기
    mismatchDelay: 1000     // 실패 시 대기
};

// 카드 이미지 경로 (18종)
const CARD_IMAGES = [
    // 과일 (4종)
    'assets/images/cards/과일/바나나.png',
    'assets/images/cards/과일/사과.png',
    'assets/images/cards/과일/수박.png',
    'assets/images/cards/과일/포도.png',
    // 동물 (8종)
    'assets/images/cards/동물/강아지.png',
    'assets/images/cards/동물/고양이.png',
    'assets/images/cards/동물/곰.png',
    'assets/images/cards/동물/기린.png',
    'assets/images/cards/동물/돼지.png',
    'assets/images/cards/동물/병아리.png',
    'assets/images/cards/동물/코끼리.png',
    'assets/images/cards/동물/펭귄.png',
    // 악기 (6종)
    'assets/images/cards/악기/기타.png',
    'assets/images/cards/악기/드럼.png',
    'assets/images/cards/악기/바이올린.png',
    'assets/images/cards/악기/탬버린.png',
    'assets/images/cards/악기/트럼펫.png',
    'assets/images/cards/악기/피아노.png'
];

// 게임 상태
const GAME_STATE = {
    START: 'start',         // 시작 화면
    DIFFICULTY: 'difficulty', // 난이도 선택
    PREVIEW: 'preview',     // 카드 미리 보기
    PLAYING: 'playing',     // 게임 중
    RESULT: 'result'        // 결과 화면
};

// 점수 계산 시스템 (구현 완료)
// - 기본 점수: 매칭 성공 시 난이도별 점수 (pointsPerMatch)
// - 콤보 보너스: 연속 성공 시 combo * 5 점수 추가
// - 시간 페널티: 실패 시 timePenalty 초 감소
// - 최종 점수: GameState.getResultStats()에서 계산

// 향후 확장 기능
// FUTURE: 카드 테마 시스템 (이미지 기반)
// FUTURE: 효과음 시스템 (현재 SoundManager에서 처리)

// 특수 카드 타입 (향후 확장용)
// FUTURE FEATURE: 현재는 NORMAL 카드만 구현됨
// FUTURE: BONUS 카드 - 정답 짝 카드 (자동 매칭)
const CARD_TYPE = {
    NORMAL: 'normal',       // 일반 카드
    BOMB: 'bomb',           // 폭탄 카드 (페널티) - 구현 완료
    HIDDEN: 'hidden'        // 히든 카드 (보너스) - 구현 완료
};

// 히든 카드 설정
const HIDDEN_CARD = {
    enabled: true,
    cardId: 99,             // 특수 ID
    imagePath: 'assets/images/cards/hidden.jpg',
    revealDuration: 1000    // 전체 카드 공개 시간 (ms)
};
