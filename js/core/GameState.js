/**
 * @fileoverview 게임 상태 관리 - 불변 상태 객체
 * @module core/GameState
 * @author 방채민 (상태 관리)
 */

/**
 * 게임의 전체 상태를 나타내는 클래스
 * 상태 변경은 새로운 인스턴스를 생성하는 방식 권장 (불변성)
 * @class
 */
class GameState {
    /**
     * @param {Object} config - 초기 설정
     */
    constructor(config = {}) {
        // 게임 페이즈
        this._phase = config.phase || GAME_STATE.START;

        // 난이도 설정
        this._difficulty = config.difficulty || null;

        // 카드 관련
        this._cards = config.cards || [];
        this._firstCard = null;
        this._secondCard = null;
        this._canFlip = true;
        this._matchedPairs = 0;

        // 하트 시스템
        this._hearts = 0;
        this._maxHearts = 0;

        // 점수 및 시간
        this._score = 0;
        this._baseScore = 0;
        this._comboBonus = 0;
        this._timeBonus = 0;

        this._timeRemaining = 0;
        this._timeLimitSeconds = 0;
        this._startTime = null;

        // 통계
        this._attempts = 0;
        this._successCount = 0;
        this._failCount = 0;
        this._combo = 0;
        this._maxCombo = 0;

        // 게임 결과
        this._isWin = false;
        this._endTime = null;
        this._gameOverReason = null; // 'hearts', 'time', 'complete'
    }

    // ========== Phase Management ==========

    /** @returns {string} */
    get phase() { return this._phase; }

    /** @returns {boolean} */
    isPlaying() { return this._phase === GAME_STATE.PLAYING; }

    /** @returns {boolean} */
    isPreview() { return this._phase === GAME_STATE.PREVIEW; }

    /** @returns {boolean} */
    isGameOver() { return this._phase === GAME_STATE.RESULT; }

    // ========== Difficulty ==========

    /** @returns {Object|null} */
    get difficulty() { return this._difficulty; }

    /** @returns {number} 전체 카드 쌍 개수 */
    get totalPairs() {
        return this._difficulty ? this._difficulty.pairs : 0;
    }

    // ========== Hearts ==========

    /** @returns {number} 현재 하트 개수 */
    get hearts() { return this._hearts; }

    /** @returns {number} 최대 하트 개수 */
    get maxHearts() { return this._maxHearts; }

    /** @returns {boolean} 하트가 0개인지 */
    isHeartsEmpty() {
        return this._hearts <= 0;
    }

    // ========== Cards ==========

    /** @returns {Card[]} */
    get cards() { return this._cards; }

    /** @returns {Card|null} */
    get firstCard() { return this._firstCard; }

    /** @returns {Card|null} */
    get secondCard() { return this._secondCard; }

    /** @returns {boolean} */
    get canFlip() { return this._canFlip; }

    /** @returns {number} */
    get matchedPairs() { return this._matchedPairs; }

    /** @returns {number} */
    getRemainingPairs() {
        return this.totalPairs - this._matchedPairs;
    }

    /** @returns {boolean} */
    isAllMatched() {
        return this._matchedPairs === this.totalPairs;
    }

    // ========== Score ==========

    /** @returns {number} */
    get score() { return this._score; }

    /** @returns {number} */
    get baseScore() { return this._baseScore; }

    /** @returns {number} */
    get comboBonus() { return this._comboBonus; }

    /** @returns {number} */
    get timeBonus() { return this._timeBonus; }

    // ========== Time ==========

    /** @returns {number} 남은 시간(초) */
    get timeRemaining() { return this._timeRemaining; }

    /** @returns {number} 제한 시간(초) */
    get timeLimitSeconds() { return this._timeLimitSeconds; }

    /** @returns {number|null} 게임 시작 시각(ms) */
    get startTime() { return this._startTime; }

    /** @returns {number} 경과 시간(초) */
    getElapsedSeconds() {
        if (!this._startTime) return 0;
        const now = this._endTime || Date.now();
        return Math.floor((now - this._startTime) / 1000);
    }

    /** @returns {boolean} */
    isTimeUp() {
        return this._timeRemaining <= 0;
    }

    // ========== Statistics ==========

    /** @returns {number} 시도 횟수 */
    get attempts() { return this._attempts; }

    /** @returns {number} 성공 횟수 */
    get successCount() { return this._successCount; }

    /** @returns {number} 실패 횟수 */
    get failCount() { return this._failCount; }

    /** @returns {number} 현재 콤보 */
    get combo() { return this._combo; }

    /** @returns {number} 최대 콤보 */
    get maxCombo() { return this._maxCombo; }

    /**
     * 정확도 계산
     * @returns {number} 정확도 (0-100)
     */
    getAccuracy() {
        if (this._attempts === 0) return 0;
        return Math.round((this._successCount / this._attempts) * 100);
    }

    // ========== Result ==========

    /** @returns {boolean} */
    get isWin() { return this._isWin; }

    /** @returns {string|null} 게임 종료 원인 */
    get gameOverReason() { return this._gameOverReason; }

    /**
     * 게임 결과 통계 반환
     * @returns {Object}
     */
    getResultStats() {
        return {
            isWin: this._isWin
        };
    }

    // ========== State Mutations (내부 사용) ==========

    /**
     * 게임 페이즈 변경
     * @param {string} phase
     */
    setPhase(phase) {
        this._phase = phase;
    }

    /**
     * 난이도 설정
     * @param {Object} difficulty
     */
    setDifficulty(difficulty) {
        this._difficulty = difficulty;
        this._timeLimitSeconds = difficulty.timeLimit;
        this._timeRemaining = difficulty.timeLimit;
        this._maxHearts = difficulty.hearts || 5;
        this._hearts = this._maxHearts;
    }

    /**
     * 카드 배열 설정
     * @param {Card[]} cards
     */
    setCards(cards) {
        this._cards = cards;
    }

    /**
     * 게임 시작
     */
    startGame() {
        this._startTime = Date.now();
        this._phase = GAME_STATE.PLAYING;
    }

    /**
     * 첫 번째 카드 선택
     * @param {Card} card
     */
    selectFirstCard(card) {
        this._firstCard = card;
    }

    /**
     * 두 번째 카드 선택
     * @param {Card} card
     */
    selectSecondCard(card) {
        this._secondCard = card;
        this._canFlip = false;
    }

    /**
     * 카드 선택 초기화
     */
    clearSelection() {
        this._firstCard = null;
        this._secondCard = null;
        this._canFlip = true;
    }

    /**
     * 매칭 성공 처리
     * @param {number} points - 획득 점수
     */
    recordMatch(points) {
        this._matchedPairs++;
        this._successCount++;
        this._attempts++;
        this._combo++;
        this._maxCombo = Math.max(this._maxCombo, this._combo);

        this._baseScore += points;
        this._score = this._baseScore + this._comboBonus;
    }

    /**
     * 매칭 실패 처리
     * @param {number} timePenalty - 시간 페널티(초)
     */
    recordMismatch(timePenalty) {
        this._failCount++;
        this._attempts++;
        this._combo = 0;

        this._timeRemaining = Math.max(0, this._timeRemaining - timePenalty);

        // 하트 감소
        this._hearts = Math.max(0, this._hearts - 1);
    }

    /**
     * 콤보 보너스 추가
     * @param {number} bonus
     */
    addComboBonus(bonus) {
        this._comboBonus += bonus;
        this._score = this._baseScore + this._comboBonus + this._timeBonus;
    }

    /**
     * 타이머 업데이트
     * @param {number} remaining - 남은 시간(초)
     */
    updateTime(remaining) {
        this._timeRemaining = Math.max(0, remaining);
    }

    /**
     * 게임 종료 (승리)
     */
    endGameWin() {
        this._phase = GAME_STATE.RESULT;
        this._isWin = true;
        this._endTime = Date.now();
        this._gameOverReason = 'complete';

        // 시간 보너스 계산
        this._timeBonus = this._timeRemaining * 2;

        // 하트 보너스 계산 (남은 하트당 10점)
        const heartBonus = this._hearts * 10;
        this._score += this._timeBonus + heartBonus;
    }

    /**
     * 게임 종료 (패배)
     * @param {string} reason - 'hearts' | 'time'
     */
    endGameLose(reason = 'time') {
        this._phase = GAME_STATE.RESULT;
        this._isWin = false;
        this._endTime = Date.now();
        this._gameOverReason = reason;
    }

    /**
     * 상태 초기화
     */
    reset() {
        this._phase = GAME_STATE.START;
        this._difficulty = null;
        this._cards = [];
        this._firstCard = null;
        this._secondCard = null;
        this._canFlip = true;
        this._matchedPairs = 0;
        this._hearts = 0;
        this._maxHearts = 0;
        this._score = 0;
        this._baseScore = 0;
        this._comboBonus = 0;
        this._timeBonus = 0;
        this._timeRemaining = 0;
        this._timeLimitSeconds = 0;
        this._startTime = null;
        this._attempts = 0;
        this._successCount = 0;
        this._failCount = 0;
        this._combo = 0;
        this._maxCombo = 0;
        this._isWin = false;
        this._endTime = null;
        this._gameOverReason = null;
    }

    /**
     * 직렬화
     * @returns {Object}
     */
    toJSON() {
        return {
            phase: this._phase,
            difficulty: this._difficulty ? this._difficulty.name : null,
            matchedPairs: this._matchedPairs,
            hearts: this._hearts,
            maxHearts: this._maxHearts,
            score: this._score,
            timeRemaining: this._timeRemaining,
            attempts: this._attempts,
            combo: this._combo
        };
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
