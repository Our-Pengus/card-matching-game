/**
 * @fileoverview 게임 로직 및 규칙 관리 (리팩토링 버전)
 * @module logic/GameManager
 * @author 방채민 (원본), Claude (리팩토링)
 * @description EventEmitter 패턴, 에러 핸들링, 메모리 관리 강화
 */

/**
 * 게임의 핵심 비즈니스 로직 담당
 * EventEmitter를 상속하여 이벤트 기반 통신
 * @class
 * @extends EventEmitter
 */
class GameManager extends EventEmitter {
    /**
     * @param {GameState} gameState - 게임 상태 객체
     * @param {CardManager} cardManager - 카드 관리자
     * @param {Object} [options={}] - 추가 옵션
     */
    constructor(gameState, cardManager, options = {}) {
        super();

        if (!gameState || !cardManager) {
            throw new TypeError('GameState and CardManager are required');
        }

        this.state = gameState;
        this.cardManager = cardManager;
        this.options = {
            autoCleanup: true,
            errorRecovery: true,
            ...options
        };

        // 타이머 관련
        this.timerInterval = null;
        this.previewTimeout = null;

        // 리소스 정리 등록
        if (this.options.autoCleanup) {
            this._registerCleanupHandlers();
        }

        // 디버그 모드 (개발 환경에서만)
        this._debug = window.location.hostname === 'localhost' ||
                     window.location.protocol === 'file:';

        if (this._debug) {
            logger.info('[GameManager] Initialized with options:', options);
        }
    }

    // ========== 게임 초기화 ==========

    /**
     * 게임 시작
     * @param {Object} difficulty - 난이도 설정
     * @param {string} [theme='FRUIT'] - 카드 테마
     * @throws {Error} difficulty가 유효하지 않을 경우
     */
    startGame(difficulty, theme = 'FRUIT') {
        try {
            this._validateDifficulty(difficulty);

            // 기존 리소스 정리
            this._cleanup();

            // 상태 초기화
            this.state.reset();
            this.state.setDifficulty(difficulty);

            // 카드 생성
            const cards = this.cardManager.createDeck(difficulty, theme);
            this.state.setCards(cards);

            // 이벤트 발생
            this.emit('game:init', { difficulty, theme, cardCount: cards.length });

            // 미리 보기 처리
            const previewTime = difficulty.previewTime || 0;

            if (previewTime > 0) {
                this._startPreview(cards, previewTime);
            } else {
                this._startPlaying();
            }

            if (this._debug) {
                logger.info('[GameManager] Game started:', {
                    difficulty: difficulty.name,
                    cards: cards.length,
                    preview: previewTime
                });
            }
        } catch (error) {
            this._handleError('startGame', error);
            throw error;
        }
    }

    /**
     * 미리 보기 시작
     * @private
     * @param {Card[]} cards - 카드 배열
     * @param {number} previewTime - 미리 보기 시간 (ms)
     */
    _startPreview(cards, previewTime) {
        this.state.setPhase(GAME_STATE.PREVIEW);

        // 모든 카드 앞면으로 표시
        cards.forEach(card => card.setFlipped(true));

        this.emit('game:preview:start', { duration: previewTime });

        // previewTime 후 게임 시작
        this.previewTimeout = setTimeout(() => {
            this._startPlaying();
        }, previewTime);
    }

    /**
     * 미리 보기 종료 후 게임 시작
     * @private
     */
    _startPlaying() {
        const animDuration = 600;

        // 모든 카드 뒤집기 애니메이션
        this.state.cards.forEach(card => {
            if (!card.isMatched && typeof cardRenderer !== 'undefined') {
                cardRenderer.animateFlip(card, animDuration, false);
            }
        });

        this.emit('game:preview:end');

        // 애니메이션 완료 후 게임 시작
        setTimeout(() => {
            this.state.startGame();
            this._startTimer();
            this.emit('game:playing:start');

            if (this._debug) {
                logger.info('[GameManager] Playing started');
            }
        }, animDuration);
    }

    /**
     * 게임 리셋
     */
    resetGame() {
        try {
            this._cleanup();
            this.cardManager.resetAllCards(this.state.cards);
            this.state.reset();
            this.emit('game:reset');

            if (this._debug) {
                logger.info('[GameManager] Game reset');
            }
        } catch (error) {
            this._handleError('resetGame', error);
        }
    }

    // ========== 카드 클릭 처리 ==========

    /**
     * 카드 클릭 핸들러
     * @param {number} x - 마우스 x 좌표
     * @param {number} y - 마우스 y 좌표
     * @returns {boolean} 클릭이 처리되었는지 여부
     */
    handleClick(x, y) {
        try {
            // PREVIEW 상태에서는 클릭 무시
            if (this.state.isPreview() || !this.state.isPlaying()) {
                return false;
            }

            // 클릭된 카드 찾기
            const card = this.cardManager.findCardAt(this.state.cards, x, y);

            if (!card) {
                return false;
            }

            return this._handleCardClick(card);
        } catch (error) {
            this._handleError('handleClick', error);
            return false;
        }
    }

    /**
     * 카드 클릭 처리 (내부)
     * @private
     * @param {Card} card - 클릭된 카드
     * @returns {boolean}
     */
    _handleCardClick(card) {
        // 클릭 불가 조건
        if (!this.state.canFlip || !card.canFlip()) {
            return false;
        }

        // 카드 뒤집기 애니메이션
        if (typeof cardRenderer !== 'undefined') {
            cardRenderer.animateFlip(card, 300, true);
        } else {
            card.flip();
        }

        this.emit('card:flip', card);

        // 첫 번째 카드 선택
        if (!this.state.firstCard) {
            this.state.selectFirstCard(card);
            return true;
        }

        // 두 번째 카드 선택
        if (!this.state.secondCard && card !== this.state.firstCard) {
            this.state.selectSecondCard(card);

            // 매칭 체크 (지연)
            setTimeout(() => {
                this._checkMatch();
            }, CARD_CONFIG.matchDelay || 500);

            return true;
        }

        return false;
    }

    // ========== 매칭 로직 ==========

    /**
     * 카드 짝 맞추기 확인
     * @private
     */
    _checkMatch() {
        const { firstCard, secondCard } = this.state;

        if (!firstCard || !secondCard) {
            logger.error('[GameManager] Cannot check match: missing cards');
            return;
        }

        const isMatch = firstCard.isMatchWith(secondCard);

        if (isMatch) {
            this._handleMatch(firstCard, secondCard);
        } else {
            this._handleMismatch(firstCard, secondCard);
        }
    }

    /**
     * 매칭 성공 처리
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleMatch(card1, card2) {
        // 히든 카드 매칭인 경우 특별 처리
        if (card1.isHiddenCard) {
            this._handleHiddenMatch(card1, card2);
            return;
        }

        // 카드 상태 업데이트
        card1.setMatched();
        card2.setMatched();

        // 점수 계산
        const basePoints = this.state.difficulty.pointsPerMatch;
        const comboBonus = this.state.combo > 0 ? this.state.combo * 5 : 0;
        const totalPoints = basePoints + comboBonus;

        // 상태 업데이트
        this.state.recordMatch(basePoints);
        if (comboBonus > 0) {
            this.state.addComboBonus(comboBonus);
        }

        // 선택 초기화
        this.state.clearSelection();

        // 이벤트 발생
        this.emit('match:success', {
            card1,
            card2,
            points: totalPoints,
            combo: this.state.combo
        });

        // 게임 클리어 체크
        if (this.state.isAllMatched()) {
            this._completeGame();
        }
    }

    /**
     * 히든 카드 매칭 성공 처리
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleHiddenMatch(card1, card2) {
        // 카드 상태 업데이트
        card1.setMatched();
        card2.setMatched();

        // 점수 계산 (일반 카드와 동일)
        const basePoints = this.state.difficulty.pointsPerMatch;
        const comboBonus = this.state.combo > 0 ? this.state.combo * 5 : 0;
        const totalPoints = basePoints + comboBonus;

        // 상태 업데이트
        this.state.recordMatch(basePoints);
        if (comboBonus > 0) {
            this.state.addComboBonus(comboBonus);
        }

        // 선택 초기화
        this.state.clearSelection();

        // 히든 카드 전용 이벤트 발생
        this.emit('hidden:match', {
            card1,
            card2,
            points: totalPoints,
            combo: this.state.combo
        });

        // 일반 매칭 이벤트도 발생 (기존 로직 호환)
        this.emit('match:success', {
            card1,
            card2,
            points: totalPoints,
            combo: this.state.combo
        });

        // 게임 클리어 체크
        if (this.state.isAllMatched()) {
            this._completeGame();
        }
    }

    /**
     * 매칭 실패 처리
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleMismatch(card1, card2) {
        const timePenalty = this.state.difficulty.timePenalty || 0;
        const previousHearts = this.state.hearts;

        // 상태 업데이트 (하트 감소 포함)
        this.state.recordMismatch(timePenalty);

        // 하트 감소 이벤트
        if (this.state.hearts < previousHearts) {
            this.emit('heart:lost', {
                remaining: this.state.hearts,
                max: this.state.maxHearts
            });
        }

        // 이벤트 발생
        this.emit('match:fail', {
            card1,
            card2,
            penalty: timePenalty
        });

        // 하트가 0이 되면 게임 오버
        if (this.state.isHeartsEmpty()) {
            this._handleHeartsDepleted(card1, card2);
            return;
        }

        // 카드 뒤집기 애니메이션
        this._flipCardsBack(card1, card2);
    }

    /**
     * 하트 소진 처리
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleHeartsDepleted(card1, card2) {
        const flipAnimDuration = 300;

        setTimeout(() => {
            this._flipCardsBack(card1, card2, flipAnimDuration);

            setTimeout(() => {
                this.state.clearSelection();
                this._gameOver('hearts');
            }, flipAnimDuration);
        }, CARD_CONFIG.mismatchDelay || 1000);
    }

    /**
     * 카드 뒷면으로 뒤집기
     * @private
     * @param {Card} card1
     * @param {Card} card2
     * @param {number} [duration=300] - 애니메이션 시간
     */
    _flipCardsBack(card1, card2, duration = 300) {
        setTimeout(() => {
            if (!card1.isMatched && typeof cardRenderer !== 'undefined') {
                cardRenderer.animateFlip(card1, duration, false);
            } else if (!card1.isMatched) {
                card1.flip();
            }

            if (!card2.isMatched && typeof cardRenderer !== 'undefined') {
                cardRenderer.animateFlip(card2, duration, false);
            } else if (!card2.isMatched) {
                card2.flip();
            }

            setTimeout(() => {
                this.state.clearSelection();
            }, duration);
        }, CARD_CONFIG.mismatchDelay || 1000);
    }

    // ========== 타이머 관리 ==========

    /**
     * 타이머 시작
     * @private
     */
    _startTimer() {
        this._stopTimer();

        this.timerInterval = setInterval(() => {
            const elapsed = this.state.getElapsedSeconds();
            const remaining = this.state.timeLimitSeconds - elapsed;

            this.state.updateTime(remaining);
            this.emit('timer:update', { remaining, elapsed });

            if (remaining <= 0) {
                this._gameOver('time');
            }
        }, 1000);
    }

    /**
     * 타이머 정지
     * @private
     */
    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 미리 보기 타이머 정리
     * @private
     */
    _clearPreviewTimeout() {
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = null;
        }
    }

    // ========== 게임 종료 ==========

    /**
     * 게임 클리어
     * @private
     */
    _completeGame() {
        this._cleanup();
        this.state.endGameWin();

        const stats = this.state.getResultStats();
        this.emit('game:complete', stats);

        if (this._debug) {
            logger.info('[GameManager] Game completed:', stats);
        }
    }

    /**
     * 게임 오버
     * @private
     * @param {string} reason - 'hearts' | 'time'
     */
    _gameOver(reason = 'time') {
        this._cleanup();
        this.state.endGameLose(reason);

        const stats = this.state.getResultStats();
        this.emit('game:over', { reason, stats });

        if (this._debug) {
            logger.info('[GameManager] Game over:', { reason, stats });
        }
    }

    // ========== 리소스 관리 ==========

    /**
     * 리소스 정리
     * @private
     */
    _cleanup() {
        this._stopTimer();
        this._clearPreviewTimeout();

        if (this._debug) {
            logger.debug('[GameManager] Resources cleaned up');
        }
    }

    /**
     * 정리 핸들러 등록 (메모리 누수 방지)
     * @private
     */
    _registerCleanupHandlers() {
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            this._cleanup();
            this.removeAllListeners();
        });

        // 페이지 숨김 시 타이머 정지
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._stopTimer();
            } else if (this.state.isPlaying()) {
                this._startTimer();
            }
        });
    }

    /**
     * 인스턴스 소멸 (명시적 정리)
     */
    destroy() {
        this._cleanup();
        this.removeAllListeners();
        this.state = null;
        this.cardManager = null;

        if (this._debug) {
            logger.info('[GameManager] Instance destroyed');
        }
    }

    // ========== 유틸리티 ==========

    /**
     * 난이도 검증
     * @private
     * @param {Object} difficulty
     * @throws {Error} 유효하지 않은 난이도
     */
    _validateDifficulty(difficulty) {
        if (!difficulty || typeof difficulty !== 'object') {
            throw new TypeError('Difficulty must be an object');
        }

        const required = ['name', 'pairs', 'timeLimit', 'gridCols', 'gridRows'];
        for (const field of required) {
            if (!(field in difficulty)) {
                throw new Error(`Difficulty missing required field: ${field}`);
            }
        }
    }

    /**
     * 에러 처리
     * @private
     * @param {string} method - 메서드 이름
     * @param {Error} error - 에러 객체
     */
    _handleError(method, error) {
        logger.error(`[GameManager] Error in ${method}:`, error);
        this.emit('error', { method, error });

        if (this.options.errorRecovery) {
            // 자동 복구 시도
            try {
                this.resetGame();
            } catch (recoveryError) {
                logger.error('[GameManager] Error recovery failed:', recoveryError);
            }
        }
    }

    /**
     * 현재 게임 상태 반환
     * @returns {Object}
     */
    getGameInfo() {
        return {
            phase: this.state.phase,
            difficulty: this.state.difficulty ? this.state.difficulty.name : null,
            score: this.state.score,
            hearts: this.state.hearts,
            maxHearts: this.state.maxHearts,
            timeRemaining: this.state.timeRemaining,
            matchedPairs: this.state.matchedPairs,
            totalPairs: this.state.totalPairs,
            remainingPairs: this.state.getRemainingPairs(),
            attempts: this.state.attempts,
            accuracy: this.state.getAccuracy(),
            combo: this.state.combo
        };
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        logger.group('[GameManager] Debug Info');
        logger.info('State:', this.state.toJSON());
        logger.info('Info:', this.getGameInfo());
        logger.info('Events:', this.eventNames());
        this.cardManager.debugPrint(this.state.cards);
        logger.groupEnd();
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}
