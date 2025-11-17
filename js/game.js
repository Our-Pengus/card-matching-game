/* ====================================
   게임 로직 및 상태 관리
   담당: 방채민 (상태 관리, 카드 비교 로직, 타이머 & 점수 시스템)
   ==================================== */

class GameManager {
    constructor() {
        // 게임 상태
        this.currentState = GAME_STATE.START;
        this.selectedDifficulty = null;

        // 카드 관련
        this.cards = [];
        this.flippedCards = [];  // 현재 뒤집힌 카드들 (2장 또는 3장)
        this.canFlip = true;  // 카드 뒤집기 가능 여부
        this.matchedPairs = 0;

        // 점수 & 타이머
        this.score = 0;
        this.timeRemaining = 0;
        this.timerStarted = false;
        this.startTime = 0;

        // 통계
        this.attempts = 0;  // 시도 횟수
        this.combo = 0;     // 연속 성공 콤보

        // 특수 효과
        this.shuffleEffectActive = false;  // 카드 섞임 효과
        this.bonusCardsRevealed = false;   // 보너스 카드 공개 여부
    }

    /**
     * 게임 초기화
     */
    initGame(difficulty) {
        this.selectedDifficulty = difficulty;
        this.currentState = GAME_STATE.PLAYING;

        // 카드 생성
        this.cards = createCardDeck(difficulty.pairs, difficulty);

        // 변수 초기화
        this.flippedCards = [];
        this.canFlip = true;
        this.matchedPairs = 0;

        this.score = 0;
        this.timeRemaining = difficulty.timeLimit;
        this.timerStarted = false;
        this.startTime = millis();

        this.attempts = 0;
        this.combo = 0;

        this.shuffleEffectActive = false;
        this.bonusCardsRevealed = false;

        // 보너스 카드 자동 공개 타이머 (하, 중 난이도)
        if (difficulty.specialCards && difficulty.specialCards.bonusPairs) {
            setTimeout(() => {
                this.revealBonusCards();
            }, SPECIAL_CARD_CONFIG.BONUS.autoRevealDelay);
        }
    }

    /**
     * 카드 클릭 처리
     */
    handleCardClick(card) {
        // 클릭 불가 조건
        if (!this.canFlip) return;
        if (card.isMatched) return;
        if (card.isFlipped) return;

        // 폭탄 카드 클릭 처리
        if (card.isBomb()) {
            card.flip();
            this.handleBombCard(card);
            return;
        }

        // 카드 뒤집기
        card.flip();
        this.flippedCards.push(card);

        // 매칭 규칙 확인 (2장 또는 3장)
        const matchingRule = this.selectedDifficulty.matchingRule || 2;

        // 필요한 카드 수만큼 뒤집혔을 때 비교
        if (this.flippedCards.length === matchingRule) {
            this.canFlip = false;  // 비교 중에는 클릭 금지
            this.attempts++;

            // 비교 로직 실행
            setTimeout(() => {
                this.checkMatch();
            }, CARD_CONFIG.matchDelay);
        }
    }

    /**
     * 카드 짝 맞추기 비교
     */
    checkMatch() {
        if (this.flippedCards.length === 0) return;

        // 모든 뒤집힌 카드의 ID가 같은지 확인
        const firstId = this.flippedCards[0].id;
        const isMatch = this.flippedCards.every(card => card.id === firstId);

        if (isMatch) {
            // ✅ 성공
            this.handleMatch();
        } else {
            // ❌ 실패
            this.handleMismatch();
        }

        // 카드 참조 초기화
        this.flippedCards = [];
        this.canFlip = true;
    }

    /**
     * 짝 맞추기 성공
     */
    handleMatch() {
        // 모든 매칭된 카드를 matched 상태로 설정
        this.flippedCards.forEach(card => card.setMatched());

        this.matchedPairs++;
        this.combo++;

        // 점수 계산
        const basePoints = this.selectedDifficulty.pointsPerMatch;
        const comboBonus = this.combo > 1 ? (this.combo - 1) * 5 : 0;

        // 보너스 카드 추가 점수
        const bonusPoints = this.flippedCards[0].isBonus() ? SPECIAL_CARD_CONFIG.BONUS.pointsBonus : 0;

        this.score += basePoints + comboBonus + bonusPoints;

        // TODO (손아영): 효과음 재생
        // playSound(this.flippedCards[0].isBonus() ? SOUNDS.bonus : SOUNDS.match);

        // 게임 클리어 체크
        const totalPairs = this.calculateTotalPairs();
        if (this.matchedPairs === totalPairs) {
            this.gameComplete();
        }
    }

    /**
     * 짝 맞추기 실패
     */
    handleMismatch() {
        this.combo = 0;  // 콤보 초기화

        // 시간 페널티
        this.timeRemaining -= this.selectedDifficulty.timePenalty;
        if (this.timeRemaining < 0) this.timeRemaining = 0;

        // TODO (손아영): 효과음 재생
        // playSound(SOUNDS.mismatch);

        // 1초 후 카드 뒤집기
        setTimeout(() => {
            this.flippedCards.forEach(card => {
                if (!card.isMatched) {
                    card.flip();
                }
            });
        }, CARD_CONFIG.mismatchDelay);
    }

    /**
     * 타이머 업데이트
     * TODO (방채민): draw()에서 매 프레임 호출
     */
    updateTimer() {
        if (this.currentState !== GAME_STATE.PLAYING) return;
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.startTime = millis();
        }

        const elapsed = floor((millis() - this.startTime) / 1000);
        this.timeRemaining = this.selectedDifficulty.timeLimit - elapsed;

        // 시간 초과
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.gameOver();
        }
    }

    /**
     * 게임 클리어
     * TODO (방채민):
     * - 최종 점수 계산 (남은 시간 보너스)
     * - 결과 화면으로 전환
     */
    gameComplete() {
        this.currentState = GAME_STATE.RESULT;

        // 남은 시간 보너스
        const timeBonus = this.timeRemaining * 2;
        this.score += timeBonus;

        // TODO (손아영): 클리어 효과음
        // playSound(SOUNDS.complete);

        // TODO (윤현준): 결과 화면 표시
    }

    /**
     * 게임 오버 (시간 초과)
     */
    gameOver() {
        this.currentState = GAME_STATE.RESULT;
        // TODO: 실패 화면 표시
    }

    /**
     * 게임 리셋 (다시하기)
     * TODO (손아영): 결과 화면에서 호출
     */
    resetGame() {
        this.currentState = GAME_STATE.START;
        this.cards = [];
        this.selectedDifficulty = null;
    }

    /**
     * 남은 카드 쌍 수 계산
     * TODO (방채민): UI 표시용
     */
    getRemainingPairs() {
        return this.selectedDifficulty.pairs - this.matchedPairs;
    }

    /**
     * 게임 통계 반환
     */
    getStats() {
        return {
            score: this.score,
            time: this.selectedDifficulty.timeLimit - this.timeRemaining,
            attempts: this.attempts,
            accuracy: this.attempts > 0 ? (this.matchedPairs / this.attempts * 100).toFixed(1) : 0
        };
    }

    /**
     * 폭탄 카드 처리
     */
    handleBombCard(bombCard) {
        const specialCards = this.selectedDifficulty.specialCards || {};

        // 시간 페널티
        this.timeRemaining -= SPECIAL_CARD_CONFIG.BOMB.timePenalty;
        if (this.timeRemaining < 0) this.timeRemaining = 0;

        // TODO (손아영): 폭탄 효과음 재생
        // playSound(SOUNDS.bomb);

        // 카드 섞임 효과 (상, 재앙, 지옥 난이도)
        if (specialCards.shuffle || SPECIAL_CARD_CONFIG.BOMB.shuffleCards) {
            this.shuffleUnmatchedCards();
        }

        // 즉사 메커니즘 (지옥 난이도)
        if (specialCards.instantDeath) {
            this.gameOver();
        } else {
            // 폭탄 카드 제거 (즉사가 아닌 경우)
            bombCard.setMatched();
            setTimeout(() => {
                bombCard.flip();
            }, 1000);
        }

        this.canFlip = true;
    }

    /**
     * 보너스 카드 자동 공개
     */
    revealBonusCards() {
        if (this.bonusCardsRevealed) return;

        this.bonusCardsRevealed = true;
        this.cards.forEach(card => {
            if (card.isBonus() && !card.isMatched) {
                card.flip();
                // 2초 후 다시 뒤집기
                setTimeout(() => {
                    if (!card.isMatched) {
                        card.flip();
                    }
                }, 2000);
            }
        });

        // TODO (손아영): 보너스 효과음 재생
        // playSound(SOUNDS.bonus);
    }

    /**
     * 매칭되지 않은 카드 섞기 (폭탄 효과)
     */
    shuffleUnmatchedCards() {
        if (this.shuffleEffectActive) return;

        this.shuffleEffectActive = true;

        // 매칭되지 않은 카드만 필터링
        const unmatchedCards = this.cards.filter(card => !card.isMatched);

        // 카드 위치만 섞기
        const positions = unmatchedCards.map(card => ({ x: card.x, y: card.y }));
        shuffleArray(positions);

        unmatchedCards.forEach((card, index) => {
            card.x = positions[index].x;
            card.y = positions[index].y;
        });

        // TODO (손아영): 섞임 효과음 재생
        // playSound(SOUNDS.shuffle);

        // 3초 후 다시 섞기 가능
        setTimeout(() => {
            this.shuffleEffectActive = false;
        }, 3000);
    }

    /**
     * 전체 페어 수 계산 (보너스 카드 포함)
     */
    calculateTotalPairs() {
        let totalPairs = this.selectedDifficulty.pairs;
        const specialCards = this.selectedDifficulty.specialCards || {};

        if (specialCards.bonusPairs) {
            totalPairs += specialCards.bonusPairs;
        }

        return totalPairs;
    }
}

// 전역 게임 매니저 인스턴스
// TODO (윤현준): sketch.js에서 초기화
let gameManager;
