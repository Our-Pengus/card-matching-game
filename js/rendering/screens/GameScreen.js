/**
 * @fileoverview 게임 플레이 화면 UI 렌더링
 * @module rendering/screens/GameScreen
 * @description 게임 중 상단 UI 바 (점수, 시간, 하트) 렌더링
 */

class GameScreen {
    constructor(uiRenderer) {
        // UIRenderer의 공통 유틸리티 참조
        this.ui = uiRenderer;
    }

    /**
     * 게임 플레이 UI 그리기
     * @param {GameState} gameState - 게임 상태
     */
    drawGameUI(gameState) {
        // 배경
        background(this.ui.colors.bg.light);

        // 상단 UI 바
        this._drawTopBar(gameState);

        // 헬퍼 메시지
        if (this.ui.helperMessage && millis() < this.ui.helperMessageEndTime) {
            this.ui._drawHelperMessage();
        }

        // 피드백 메시지
        if (this.ui.currentMessage && millis() < this.ui.messageEndTime) {
            this.ui._drawFeedbackMessage();
        }
    }

    /**
     * 상단 UI 바 그리기
     * @private
     * @param {GameState} gameState - 게임 상태
     */
    _drawTopBar(gameState) {
        // 상단 바 배경
        fill(255, 255, 255, 240);
        noStroke();
        rect(0, 0, width, 80);

        // 그림자
        fill(0, 0, 0, 10);
        rect(0, 78, width, 4);

        // 왼쪽: 점수
        this._drawScoreDisplay(60, 40, gameState.score);

        // 중앙: 시간
        this._drawTimeDisplay(width / 2, 40, gameState.timeRemaining);

        // 오른쪽: 하트 (남은 시도)
        this._drawHeartDisplay(width - 120, 40, gameState.hearts, gameState.maxHearts);
    }

    /**
     * 점수 표시
     * @private
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} score - 점수
     */
    _drawScoreDisplay(x, y, score) {
        push();
        textAlign(LEFT, CENTER);

        // 아이콘 (별)
        fill('#FFD700');
        noStroke();
        textSize(28);
        text('⭐', x - 10, y - 2);

        // 점수
        fill(this.ui.colors.text.primary);
        textSize(this.ui.fonts.ui);
        textStyle(BOLD);
        text(`×${score}`, x + 25, y);
        pop();
    }

    /**
     * 시간 표시
     * @private
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} timeRemaining - 남은 시간 (초)
     */
    _drawTimeDisplay(x, y, timeRemaining) {
        push();
        textAlign(CENTER, CENTER);

        // ========== 카운트다운 변수 설정 ==========
        let fontSize = this.ui.fonts.ui; // 기본 크기
        let displayColor = this.ui.colors.text.primary; // 기본 색상
        const isCountingDown = timeRemaining <= 10 && timeRemaining > 0;
        // ========================================

        // 10초 이하 카운트다운 효과
        if (isCountingDown) {
            // 폰트 크기 증가
            fontSize = this.ui.fonts.title * 0.8; // 38.4px (기본 48px의 80%)

            // 깜빡이는 효과를 위해 시간을 이용해 색상 전환 (0.5초마다)
            const flashRate = floor(millis() / 500) % 2; 

            if (flashRate === 0) { 
                // 0, 1, 2, ... 초일 때: 밝은 빨간색 (경고)
                displayColor = color(this.ui.colors.button.hell); 
            } else {
                // 0.5, 1.5, 2.5, ... 초일 때: 흰색 (배경)
                displayColor = color(255, 255, 255); 
            }
        }

        // 시간 배경 (둥근 박스)
        const boxWidth = 140;
        const boxHeight = 50;

        // 배경 테두리 색상도 카운트다운 상태에 따라 변경
        const strokeColor = isCountingDown ? displayColor : this.ui.colors.text.primary;

        fill(255, 255, 255);
        stroke(strokeColor); // 동적 색상 적용
        strokeWeight(3);
        rect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 25);

        // 시간 텍스트
        noStroke();
        fill(displayColor); // 동적 색상 적용
        textSize(fontSize); // 동적 크기 적용
        textStyle(BOLD);

        const minutes = floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeStr = `${minutes}:${nf(seconds, 2)}`;
        text(timeStr, x, y);
        pop();
    }

    /**
     * 하트 표시
     * @private
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} hearts - 남은 하트
     * @param {number} maxHearts - 최대 하트
     */
    _drawHeartDisplay(x, y, hearts, maxHearts) {
        push();
        textAlign(CENTER, CENTER);

        // 하트 아이콘 (하트가 적으면 회색으로)
        const heartColor = hearts > maxHearts * 0.3 ? this.ui.colors.heart : '#999999';
        fill(heartColor);
        noStroke();
        textSize(28);
        text('❤️', x - 30, y - 2);

        // 개수 (하트가 0이면 회색으로)
        const textColor = hearts > 0 ? this.ui.colors.text.primary : '#999999';
        fill(textColor);
        textSize(this.ui.fonts.ui);
        textStyle(BOLD);
        text(`×${hearts}`, x + 15, y);

        // 하트가 적을 때 경고 효과 (펄스 애니메이션)
        if (hearts <= maxHearts * 0.3 && hearts > 0) {
            push();
            const pulseAlpha = map(sin(millis() * 0.01), -1, 1, 50, 150);
            fill(255, 0, 0, pulseAlpha);
            noStroke();
            ellipse(x, y, 80, 40);
            pop();
        }
        pop();
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameScreen;
}
