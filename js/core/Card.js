/**
 * @fileoverview Card 데이터 모델 - 순수 데이터와 비즈니스 로직만 담당
 * @module core/Card
 * @author 방채민 (데이터 구조, 비즈니스 로직)
 */

/**
 * 카드 상태를 나타내는 불변 객체
 * @class
 */
class Card {
    /**
     * @param {number} id - 카드 식별자 (같은 ID = 짝)
     * @param {number} x - 화면 x 좌표
     * @param {number} y - 화면 y 좌표
     * @param {string} imagePath - 카드 이미지 경로
     * @param {boolean} [isBombCard=false] - 폭탄 카드 여부
     */
    constructor(id, x, y, imagePath, isBombCard = false) {
        // 불변 속성
        this._id = id;
        this._imagePath = imagePath;
        this._isBombCard = isBombCard;

        // 가변 속성 (private)
        this._x = x;
        this._y = y;
        this._isFlipped = false;
        this._isMatched = false;
        this._isAnimating = false;

        // 메타데이터
        this._createdAt = Date.now();
        this._flipCount = 0;
    }

    // ========== Getters (읽기 전용) ==========

    /** @returns {number} */
    get id() { return this._id; }

    /** @returns {number} */
    get x() { return this._x; }

    /** @returns {number} */
    get y() { return this._y; }

    /** @returns {string} */
    get imagePath() { return this._imagePath; }

    /** @returns {boolean} */
    get isFlipped() { return this._isFlipped; }

    /** @returns {boolean} */
    get isMatched() { return this._isMatched; }

    /** @returns {boolean} */
    get isAnimating() { return this._isAnimating; }

    /** @returns {number} */
    get flipCount() { return this._flipCount; }

    /** @returns {boolean} */
    get isBombCard() { return this._isBombCard; }

    // ========== 비즈니스 로직 ==========

    /**
     * 카드 위치 설정 (그리드 배치용)
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     */
    setPosition(x, y) {
        this._x = x;
        this._y = y;
    }

    /**
     * 카드가 클릭 가능한 상태인지 확인
     * @returns {boolean}
     */
    canFlip() {
        return !this._isMatched &&
               !this._isAnimating &&
               !this._isFlipped;
    }

    /**
     * 카드 뒤집기
     * @throws {Error} 뒤집을 수 없는 상태인 경우
     */
    flip() {
        if (this._isMatched) {
            throw new Error(`Card ${this._id} is already matched`);
        }

        if (this._isAnimating) {
            throw new Error(`Card ${this._id} is animating`);
        }

        this._isFlipped = !this._isFlipped;
        this._flipCount++;
    }

    /**
     * 카드를 뒤집힌 상태로 강제 설정 (안전)
     * @param {boolean} flipped - 뒤집힌 상태
     */
    setFlipped(flipped) {
        this._isFlipped = flipped;
    }

    /**
     * 짝 맞춤 완료 처리
     */
    setMatched() {
        this._isMatched = true;
        this._isFlipped = true;
        this._isAnimating = false;
    }

    /**
     * 애니메이션 상태 설정
     * @param {boolean} animating - 애니메이션 중 여부
     */
    setAnimating(animating) {
        this._isAnimating = animating;
    }

    /**
     * 마우스 좌표가 카드 영역 내에 있는지 확인
     * @param {number} mx - 마우스 x 좌표
     * @param {number} my - 마우스 y 좌표
     * @returns {boolean}
     */
    contains(mx, my) {
        return mx >= this._x &&
               mx <= this._x + CARD_CONFIG.width &&
               my >= this._y &&
               my <= this._y + CARD_CONFIG.height;
    }

    /**
     * 카드 상태 초기화 (리셋용)
     */
    reset() {
        this._isFlipped = false;
        this._isMatched = false;
        this._isAnimating = false;
        this._flipCount = 0;
    }

    /**
     * 다른 카드와 짝인지 확인
     * @param {Card} other - 비교할 카드
     * @returns {boolean}
     */
    isMatchWith(other) {
        if (!other || !(other instanceof Card)) {
            return false;
        }
        return this._id === other._id;
    }

    /**
     * 카드의 현재 상태를 직렬화
     * @returns {Object} 카드 상태 객체
     */
    toJSON() {
        return {
            id: this._id,
            x: this._x,
            y: this._y,
            imagePath: this._imagePath,
            isFlipped: this._isFlipped,
            isMatched: this._isMatched,
            isBombCard: this._isBombCard,
            flipCount: this._flipCount
        };
    }

    /**
     * 디버깅용 문자열 표현
     * @returns {string}
     */
    toString() {
        const state = this._isMatched ? 'MATCHED' :
                     this._isFlipped ? 'FLIPPED' : 'FACE_DOWN';
        return `Card(id=${this._id}, state=${state}, pos=(${this._x},${this._y}))`;
    }
}

// ES6 모듈 내보내기 (향후 사용)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Card;
}
