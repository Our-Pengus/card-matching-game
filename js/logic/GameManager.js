/**
 * @fileoverview 게임 로직 및 규칙 관리
 * @module logic/GameManager
 * @author 방채민
 */

/**
 * 게임의 핵심 비즈니스 로직 담당
 * 상태 관리는 GameState, 카드 관리는 CardManager에 위임
 * @class
 */
class GameManager {
    /**
     * @param {GameState} gameState - 게임 상태 객체
     * @param {CardManager} cardManager - 카드 관리자
     */
    constructor(gameState, cardManager) {
        this.state = gameState;
        this.cardManager = cardManager;

        // 콜백 함수들 (UI 업데이트용)
        this.onCardFlip = null;
        this.onMatch = null;
        this.onMismatch = null;
        this.onGameComplete = null;
        this.onGameOver = null;
        this.onScoreChange = null;
        this.onTimeUpdate = null;

        // 타이머 관련
        this.timerInterval = null;
        this.previewTimeout = null;
    }

    // ========== 게임 초기화 ==========

    /**
     * 게임 시작
     *
     * @param {Object} difficulty - 난이도 설정
     * @param {string} [theme='FRUIT'] - 카드 테마
     */
    startGame(difficulty, theme = 'FRUIT') {
        if (!difficulty) {
            throw new Error('Difficulty is required');
        }

        // 상태 초기화
        this.state.reset();
        this.state.setDifficulty(difficulty);

        // 카드 생성
        const cards = this.cardManager.createDeck(difficulty, theme);
        this.state.setCards(cards);

        // 미리 보기 처리
        const previewTime = difficulty.previewTime || 0;

        if (previewTime > 0) {
            // PREVIEW 상태로 설정
            this.state.setPhase(GAME_STATE.PREVIEW);

            // 모든 카드 앞면으로 표시
            cards.forEach(card => card.setFlipped(true));

            // previewTime 후 게임 시작
            this.previewTimeout = setTimeout(() => {
                this._startPlaying();
            }, previewTime);

            console.log(`Game preview started: ${difficulty.name} difficulty, ${previewTime}ms preview`);
        } else {
            // 미리 보기 없음 - 즉시 게임 시작
            this.state.startGame();
            this._startTimer();
            console.log(`Game started: ${difficulty.name} difficulty, ${cards.length} cards (no preview)`);
        }
    }

    /**
     * 미리 보기 종료 후 게임 시작
     *
     * @private
     */
    _startPlaying() {
        const animDuration = 600;  // 애니메이션 시간 (ms)

        // 모든 카드에 뒤집기 애니메이션 시작
        this.state.cards.forEach(card => {
            if (!card.isMatched) {
                // cardRenderer는 main.js에서 전역으로 선언됨
                if (typeof cardRenderer !== 'undefined') {
                    cardRenderer.animateFlip(card, animDuration, false);  // false = 뒷면으로
                }
            }
        });

        // 애니메이션 완료 후 게임 시작
        setTimeout(() => {
            // PLAYING 상태로 전환
            this.state.startGame();

            // 타이머 시작
            this._startTimer();

            console.log('Preview ended, game playing started');
        }, animDuration);
    }

    /**
     * 게임 리셋
     */
    resetGame() {
        this._stopTimer();
        this._clearPreviewTimeout();
        this.cardManager.resetAllCards(this.state.cards);
        this.state.reset();
    }

    // ========== 카드 클릭 처리 ==========

    /**
     * 카드 클릭 핸들러
     *
     * @param {number} x - 마우스 x 좌표
     * @param {number} y - 마우스 y 좌표
     * @returns {boolean} 클릭이 처리되었는지 여부
     */
    handleClick(x, y) {
        // PREVIEW 상태에서는 클릭 무시
        if (this.state.isPreview()) {
            return false;
        }

        if (!this.state.isPlaying()) {
            return false;
        }

        // 클릭된 카드 찾기
        const card = this.cardManager.findCardAt(this.state.cards, x, y);

        if (!card) {
            return false;
        }

        // 카드 클릭 처리
        return this._handleCardClick(card);
    }

    /**
     * 카드 클릭 처리 (내부)
     *
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
            cardRenderer.animateFlip(card, 300, true);  // true = 앞면으로, 300ms
        } else {
            // fallback: 애니메이션 없이 즉시 뒤집기
            try {
                card.flip();
            } catch (error) {
                console.error('Failed to flip card:', error);
                return false;
            }
        }

        this._notifyCardFlip(card);

        // 첫 번째 카드 선택
        if (!this.state.firstCard) {
            this.state.selectFirstCard(card);
            return true;
        }

        // 두 번째 카드 선택 (같은 카드는 제외)
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
     *
     * @private
     */
    _checkMatch() {
        const { firstCard, secondCard } = this.state;

        if (!firstCard || !secondCard) {
            console.error('Cannot check match: missing cards');
            return;
        }

        // 짝 비교
        const isMatch = firstCard.isMatchWith(secondCard);

        if (isMatch) {
            this._handleMatch(firstCard, secondCard);
        } else {
            this._handleMismatch(firstCard, secondCard);
        }
    }

    /**
     * 매칭 성공 처리
     *
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleMatch(card1, card2) {
        // 카드 상태 업데이트
        card1.setMatched();
        card2.setMatched();

        // 점수 계산
        const basePoints = this.state.difficulty.pointsPerMatch;
        const comboBonus = this.state.combo > 0 ? this.state.combo * 5 : 0;

        // 상태 업데이트
        this.state.recordMatch(basePoints);
        if (comboBonus > 0) {
            this.state.addComboBonus(comboBonus);
        }

        // 선택 초기화
        this.state.clearSelection();

        // 콜백 호출
        this._notifyMatch(card1, card2, basePoints + comboBonus);
        this._notifyScoreChange();

        // 게임 클리어 체크
        if (this.state.isAllMatched()) {
            this._completeGame();
        }
    }

    /**
     * 매칭 실패 처리
     *
     * @private
     * @param {Card} card1
     * @param {Card} card2
     */
    _handleMismatch(card1, card2) {
        // 시간 페널티
        const timePenalty = this.state.difficulty.timePenalty || 0;
        this.state.recordMismatch(timePenalty);

        // 콜백 호출
        this._notifyMismatch(card1, card2, timePenalty);
        this._notifyTimeUpdate();

        // 카드 뒤집기 애니메이션 (지연)
        const flipAnimDuration = 300;
        setTimeout(() => {
            // 애니메이션으로 뒷면으로 뒤집기
            if (!card1.isMatched && typeof cardRenderer !== 'undefined') {
                cardRenderer.animateFlip(card1, flipAnimDuration, false);
            } else if (!card1.isMatched) {
                card1.flip();  // fallback
            }

            if (!card2.isMatched && typeof cardRenderer !== 'undefined') {
                cardRenderer.animateFlip(card2, flipAnimDuration, false);
            } else if (!card2.isMatched) {
                card2.flip();  // fallback
            }

            // 애니메이션 완료 후 선택 초기화
            setTimeout(() => {
                this.state.clearSelection();
            }, flipAnimDuration);
        }, CARD_CONFIG.mismatchDelay || 1000);
    }

    // ========== 타이머 관리 ==========

    /**
     * 타이머 시작
     *
     * @private
     */
    _startTimer() {
        this._stopTimer(); // 기존 타이머 정리

        this.timerInterval = setInterval(() => {
            const elapsed = this.state.getElapsedSeconds();
            const remaining = this.state.timeLimitSeconds - elapsed;

            this.state.updateTime(remaining);
            this._notifyTimeUpdate();

            // 시간 초과
            if (remaining <= 0) {
                this._gameOver();
            }
        }, 1000);
    }

    /**
     * 타이머 정지
     *
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
     *
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
     *
     * @private
     */
    _completeGame() {
        this._stopTimer();
        this._clearPreviewTimeout();
        this.state.endGameWin();
        this._notifyGameComplete();

        console.log('Game Complete!', this.state.getResultStats());
    }

    /**
     * 게임 오버
     *
     * @private
     */
    _gameOver() {
        this._stopTimer();
        this._clearPreviewTimeout();
        this.state.endGameLose();
        this._notifyGameOver();

        console.log('Game Over!', this.state.getResultStats());
    }

    // ========== 콜백 통지 ==========

    _notifyCardFlip(card) {
        if (this.onCardFlip) {
            this.onCardFlip(card);
        }
    }

    _notifyMatch(card1, card2, points) {
        if (this.onMatch) {
            this.onMatch(card1, card2, points);
        }
    }

    _notifyMismatch(card1, card2, penalty) {
        if (this.onMismatch) {
            this.onMismatch(card1, card2, penalty);
        }
    }

    _notifyScoreChange() {
        if (this.onScoreChange) {
            this.onScoreChange(this.state.score, this.state.combo);
        }
    }

    _notifyTimeUpdate() {
        if (this.onTimeUpdate) {
            this.onTimeUpdate(this.state.timeRemaining);
        }
    }

    _notifyGameComplete() {
        if (this.onGameComplete) {
            this.onGameComplete(this.state.getResultStats());
        }
    }

    _notifyGameOver() {
        if (this.onGameOver) {
            this.onGameOver(this.state.getResultStats());
        }
    }

    // ========== 유틸리티 ==========

    /**
     * 현재 게임 상태 반환
     *
     * @returns {Object}
     */
    getGameInfo() {
        return {
            phase: this.state.phase,
            difficulty: this.state.difficulty ? this.state.difficulty.name : null,
            score: this.state.score,
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
        console.group('Game Manager Debug');
        console.log('State:', this.state.toJSON());
        console.log('Info:', this.getGameInfo());
        this.cardManager.debugPrint(this.state.cards);
        console.groupEnd();
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}
