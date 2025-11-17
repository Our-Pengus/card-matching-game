/* ====================================
   Card 클래스
   담당: 방채민 (카드 데이터 구조 설계)
        손아영 (카드 데이터 & 이미지 연결)
   ==================================== */

class Card {
    /**
     * @param {number} id - 카드 고유 ID (같은 ID = 같은 그림)
     * @param {number} x - 캔버스 상의 x 좌표
     * @param {number} y - 캔버스 상의 y 좌표
     * @param {string} imagePath - 카드 앞면 이미지 경로
     * @param {string} type - 카드 타입 (CARD_TYPE.NORMAL | BONUS | BOMB)
     */
    constructor(id, x, y, imagePath, type = CARD_TYPE.NORMAL) {
        this.id = id;               // 카드 ID (짝 찾기용)
        this.x = x;                 // 화면 위치
        this.y = y;
        this.imagePath = imagePath; // 카드 이미지 (손아영)
        this.image = null;          // 로드된 이미지 객체
        this.type = type;           // 카드 타입 (특수 카드 지원)

        // 카드 상태
        this.isFlipped = false;     // 뒤집혔는지
        this.isMatched = false;     // 짝 찾았는지
        this.isFlipping = false;    // 뒤집는 중인지 (애니메이션)

        // 애니메이션 관련 (윤현준)
        this.flipProgress = 0;      // 0~1 사이 값
        this.scale = 1;             // 호버 효과용
    }

    /**
     * 특수 카드 여부 확인
     */
    isSpecialCard() {
        return this.type !== CARD_TYPE.NORMAL;
    }

    /**
     * 폭탄 카드 여부 확인
     */
    isBomb() {
        return this.type === CARD_TYPE.BOMB;
    }

    /**
     * 보너스 카드 여부 확인
     */
    isBonus() {
        return this.type === CARD_TYPE.BONUS;
    }

    /**
     * 카드 이미지 로드 (p5.js loadImage 사용)
     * TODO (손아영): 실제 이미지 파일 준비 후 로드
     */
    loadImage() {
        // this.image = loadImage(this.imagePath);
    }

    /**
     * 카드 뒤집기
     * TODO (방채민): 게임 로직과 연동
     */
    flip() {
        if (this.isMatched || this.isFlipping) return;
        this.isFlipped = !this.isFlipped;
        this.isFlipping = true;
        // 애니메이션은 윤현준이 sketch.js에서 처리
    }

    /**
     * 마우스가 카드 위에 있는지 체크
     * TODO (윤현준): mouseClicked()에서 사용
     */
    contains(mx, my) {
        return mx > this.x &&
               mx < this.x + CARD_CONFIG.width &&
               my > this.y &&
               my < this.y + CARD_CONFIG.height;
    }

    /**
     * 카드 그리기
     * TODO (윤현준): p5.js로 렌더링
     * - 뒤집기 애니메이션 (scale/rotate)
     * - 앞면/뒷면 전환
     * - 호버 효과
     */
    display() {
        push();
        translate(this.x + CARD_CONFIG.width / 2, this.y + CARD_CONFIG.height / 2);

        // TODO: 뒤집기 애니메이션
        // - scale(this.flipProgress, 1)
        // - this.flipProgress < 0.5 ? 뒷면 : 앞면

        // 임시: 사각형으로 표시
        rectMode(CENTER);
        fill(this.isFlipped ? 200 : 80);
        rect(0, 0, CARD_CONFIG.width, CARD_CONFIG.height, CARD_CONFIG.cornerRadius);

        if (this.isFlipped && !this.isMatched) {
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(32);
            text(this.id, 0, 0);  // 임시: ID 표시
        }

        pop();
    }

    /**
     * 짝 맞춤 완료 처리
     * TODO (방채민): 게임 로직에서 호출
     */
    setMatched() {
        this.isMatched = true;
        this.isFlipped = true;
        // TODO (윤현준): 성공 애니메이션 추가
    }

    /**
     * 카드 리셋 (다시하기)
     */
    reset() {
        this.isFlipped = false;
        this.isMatched = false;
        this.isFlipping = false;
        this.flipProgress = 0;
    }
}

/**
 * 카드 배열 생성 및 섞기
 * @param {number} pairs - 카드 쌍의 개수
 * @param {Object} difficulty - 난이도 설정 객체
 * @returns {Array<Card>} 섞인 카드 배열
 */
function createCardDeck(pairs, difficulty) {
    let cards = [];
    const matchingRule = difficulty.matchingRule || 2; // 기본 2장 매칭
    const specialCards = difficulty.specialCards || {};

    // 1. 일반 카드 생성 (쌍 생성)
    for (let i = 0; i < pairs; i++) {
        let imagePath = `assets/images/cards/card_${i}.png`;

        // matchingRule에 따라 카드 개수 결정 (2장 또는 3장)
        for (let j = 0; j < matchingRule; j++) {
            cards.push(new Card(i, 0, 0, imagePath, CARD_TYPE.NORMAL));
        }
    }

    // 2. 보너스 카드 추가 (정답 짝 카드)
    if (specialCards.bonusPairs) {
        for (let i = 0; i < specialCards.bonusPairs; i++) {
            const bonusId = pairs + 1000 + i; // 일반 카드와 구별되는 ID
            cards.push(new Card(bonusId, 0, 0, 'assets/images/cards/bonus.png', CARD_TYPE.BONUS));
            cards.push(new Card(bonusId, 0, 0, 'assets/images/cards/bonus.png', CARD_TYPE.BONUS));
        }
    }

    // 3. 폭탄 카드 추가
    if (specialCards.bombs) {
        for (let i = 0; i < specialCards.bombs; i++) {
            const bombId = pairs + 2000 + i; // 일반 카드와 구별되는 ID
            cards.push(new Card(bombId, 0, 0, 'assets/images/cards/bomb.png', CARD_TYPE.BOMB));
        }
    }

    // 4. Fisher-Yates 알고리즘으로 섞기
    shuffleArray(cards);

    // 5. 그리드 레이아웃 계산하여 x, y 좌표 할당
    const gridCols = difficulty.gridCols;
    const gridRows = difficulty.gridRows;
    const cardWidth = CARD_CONFIG.width;
    const cardHeight = CARD_CONFIG.height;
    const margin = CARD_CONFIG.margin;

    // 그리드 전체 크기 계산
    const gridWidth = gridCols * (cardWidth + margin) - margin;
    const gridHeight = gridRows * (cardHeight + margin) - margin;

    // 그리드 시작 위치 (중앙 정렬)
    const startX = (CANVAS_CONFIG.width - gridWidth) / 2;
    const startY = (CANVAS_CONFIG.height - gridHeight) / 2 + 50; // 상단 여백

    // 각 카드에 위치 할당
    cards.forEach((card, index) => {
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        card.x = startX + col * (cardWidth + margin);
        card.y = startY + row * (cardHeight + margin);
    });

    return cards;
}

/**
 * 배열 섞기 (Fisher-Yates)
 * TODO (방채민): 구현
 */
function shuffleArray(array) {
    // Fisher-Yates shuffle 알고리즘
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
