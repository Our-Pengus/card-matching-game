/* ====================================
   게임 설정 파일
   담당: 방채민 (난이도 옵션 정의, 점수 시스템 설계)
   ==================================== */

// 게임 난이도 설정
const DIFFICULTY = {
    EASY: {
        name: '하',
        pairs: 4,           // 4쌍 = 8장
        timeLimit: 60,      // 1분
        gridCols: 4,
        gridRows: 2,
        pointsPerMatch: 10,
        timePenalty: 5,     // 실패 시 5초 감점
        previewTime: 2500,  // 2.5초 미리 보기
        hearts: 5,          // 하트 5개
        specialCards: {
            bonusPairs: 2   // 정답 짝 카드 2장
        },
        color: {
            bg: '#E8F5E9',
            card: '#81C784',
            text: '#2E7D32'
        }
    },
    MEDIUM: {
        name: '중',
        pairs: 8,           // 8쌍 = 16장
        timeLimit: 90,      // 1.5분
        gridCols: 4,
        gridRows: 4,
        pointsPerMatch: 15,
        timePenalty: 10,
        previewTime: 4000,  // 4초 미리 보기
        hearts: 10,         // 하트 10개
        specialCards: {
            bonusPairs: 2   // 정답 짝 카드 2장
        },
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
        specialCards: {
            bombs: 2        // 폭탄 카드 2장
        },
        color: {
            bg: '#FFEBEE',
            card: '#E57373',
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
    backgroundColor: '#FFFFFF'
};

// 카드 설정 (정사각형, 레퍼런스 스타일)
const CARD_CONFIG = {
    width: 110,             // 정사각형
    height: 110,            // 정사각형
    cornerRadius: 20,       // 둥근 모서리
    margin: 18,             // 카드 간격 증가
    backColor: '#FFB4D1',   // 파스텔 핑크
    flipDuration: 300,      // ms
    matchDelay: 500,        // 성공 시 대기
    mismatchDelay: 1000     // 실패 시 대기
};

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
// FUTURE: BOMB 카드 - 폭탄 카드 (페널티)
const CARD_TYPE = {
    NORMAL: 'normal'        // 일반 카드 (현재 유일하게 구현된 타입)
};
