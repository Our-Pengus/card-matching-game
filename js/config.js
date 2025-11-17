/* ====================================
   게임 설정 파일
   담당: 방채민 (난이도 옵션 정의, 점수 시스템 설계)
   ==================================== */

// 카드 타입 정의
const CARD_TYPE = {
    NORMAL: 'normal',           // 일반 카드 (2장 짝)
    ANSWER_PAIR: 'answer_pair', // 정답 짝 카드 (2장 또는 3장)
    BOMB: 'bomb'                // 폭탄 카드
};

// 게임 난이도 설정
const DIFFICULTY = {
    EASY: {
        name: '하',
        pairs: 4,               // 4쌍 = 8장
        answerPairs: 1,         // 정답 짝 세트 개수 (1개)
        answerPairCount: 2,      // 정답 짝 카드 매칭 개수 (2장)
        bombCount: 0,            // 폭탄 카드 개수
        totalCards: 8,           // 총 카드 개수 (4쌍 * 2 = 8장)
        timeLimit: 180,         // 3분
        gridCols: 4,
        gridRows: 2,
        pointsPerMatch: 10,
        timePenalty: 5,         // 실패 시 5초 감점
        color: {
            bg: '#E8F5E9',
            card: '#81C784',
            text: '#2E7D32'
        }
    },
    MEDIUM: {
        name: '중',
        pairs: 8,               // 8쌍 = 16장
        answerPairs: 1,         // 정답 짝 세트 개수 (1개)
        answerPairCount: 2,      // 정답 짝 카드 매칭 개수 (2장)
        bombCount: 0,            // 폭탄 카드 개수
        totalCards: 16,          // 총 카드 개수 (8쌍 * 2 = 16장)
        timeLimit: 120,         // 2분
        gridCols: 4,
        gridRows: 4,
        pointsPerMatch: 15,
        timePenalty: 10,
        color: {
            bg: '#FFF3E0',
            card: '#FFB74D',
            text: '#E65100'
        }
    },
    HARD: {
        name: '상',
        pairs: 15,               // 15쌍 = 30장
        answerPairs: 1,          // 정답 짝 세트 개수 (1개)
        answerPairCount: 2,       // 정답 짝 카드 매칭 개수 (2장)
        bombCount: 2,            // 폭탄 카드 2장
        totalCards: 32,          // 총 카드 개수 (15쌍 * 2 + 정답짝 2 + 폭탄 2 = 34장, 실제로는 32장)
        timeLimit: 90,          // 1.5분
        gridCols: 5,
        gridRows: 4,
        pointsPerMatch: 20,
        timePenalty: 15,
        color: {
            bg: '#FFEBEE',
            card: '#E57373',
            text: '#C62828'
        }
    },
    HELL: {
        name: '지옥',
        pairs: 22,               // 22쌍 = 44장
        answerPairs: 1,          // 정답 짝 세트 개수 (1개)
        answerPairCount: 3,       // 정답 짝 카드 매칭 개수 (3장)
        bombCount: 4,            // 폭탄 카드 4장
        totalCards: 48,          // 총 카드 개수 (22쌍 * 2 + 정답짝 3 + 폭탄 4 = 51장, 실제로는 48장)
        timeLimit: 60,           // 1분 (엄격한 제한 시간)
        gridCols: 6,
        gridRows: 5,
        pointsPerMatch: 30,
        timePenalty: 20,
        bombTimePenalty: 10,     // 폭탄 클릭 시 시간 감소 (초)
        bombShuffleChance: 0.03, // 폭탄 클릭 시 카드 섞임 확률 (3%)
        bombInstantDeathChance: 0.01, // 폭탄 클릭 시 즉사 확률 (1%)
        color: {
            bg: '#212121',
            card: '#D32F2F',
            text: '#FFEBEE'
        }
    }
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
    PLAYING: 'playing',     // 게임 중
    RESULT: 'result'        // 결과 화면
};

// TODO (방채민): 점수 계산 공식
// - 기본 점수: 매칭 성공 시 난이도별 점수
// - 보너스: 남은 시간에 비례
// - 콤보: 연속 성공 시 배수 증가
// - 페널티: 실패 시 점수 감점

// TODO (방채민): 카드 테마 이미지 경로
const CARD_THEMES = {
    FRUIT: [
        'assets/images/cards/apple.png',
        'assets/images/cards/banana.png',
        'assets/images/cards/cherry.png',
        // ... 추가 필요
    ],
    COFFEE: [
        // 손아영: 커피 테마 이미지 경로 추가
    ],
    FASHION: [
        // 손아영: 패션 아이템 이미지 경로 추가
    ]
};

// 효과음 경로 (손아영)
const SOUNDS = {
    click: 'assets/sounds/click.mp3',
    match: 'assets/sounds/match.mp3',
    mismatch: 'assets/sounds/mismatch.mp3',
    complete: 'assets/sounds/complete.mp3'
};
