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

        // 중앙: 시간
        this._drawTimeDisplay(width / 2, 40, gameState.timeRemaining);

        // 오른쪽: 하트 (남은 시도)
        this._drawHeartDisplay(width - 120, 40, gameState.hearts, gameState.maxHearts);
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

        // 시간 배경 (둥근 박스)
        const boxWidth = 140;
        const boxHeight = 50;

        fill(255, 255, 255);
        stroke(this.ui.colors.text.primary);
        strokeWeight(3);
        rect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 25);

        // 시간 텍스트
        noStroke();
        fill(this.ui.colors.text.primary);
        textSize(this.ui.fonts.ui);
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
