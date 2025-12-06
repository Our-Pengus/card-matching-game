/**
 * @fileoverview 결과 화면 렌더링
 * @module rendering/screens/ResultScreen
 * @description 게임 종료 후 결과 화면 및 통계 표시
 */

class ResultScreen {
    constructor(uiRenderer) {
        // UIRenderer의 공통 유틸리티 참조
        this.ui = uiRenderer;
    }

    /**
     * 결과 화면 그리기
     * @param {Object} stats - 게임 통계 정보
     */
    drawResultScreen(stats) {
        // 배경
        this.ui._drawGradientBackground();
        this.ui._drawWaves(height - 150);

        // 승리 여부 판단
        const isWin = stats.isWin;

        // 캐릭터 (크게) - 표정은 승리 여부에 따라
        this.ui._drawBearCharacter(width / 2, height / 2 + 100, 1.5, isWin);

        // 결과 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(80);
        textStyle(BOLD);

        const titleText = isWin ? '성공!' : '실패!';

        fill(this.ui.colors.text.white);
        stroke(this.ui.colors.text.primary);
        strokeWeight(8);
        text(titleText, width / 2, 150);
        pop();

        // 버튼들
        // 재시도 버튼 (같은 난이도)
        this.ui._drawPillButton(
            width / 2 - 120,
            height - 120,
            200,
            70,
            '재시도',
            this.ui.colors.button.normal,
            'retry'
        );

        // 난이도 선택 버튼
        this.ui._drawPillButton(
            width / 2 + 120,
            height - 120,
            200,
            70,
            '난이도 선택',
            this.ui.colors.button.hard,
            'difficulty'
        );
    }

    /**
     * 결과 화면 클릭 처리
     * @param {number} mx - 마우스 x 좌표
     * @param {number} my - 마우스 y 좌표
     * @returns {string|null} 클릭된 버튼 ID
     */
    handleResultClick(mx, my) {
        const btnY = height - 120;
        const btnWidth = 200;
        const btnHeight = 70;

        // 재시도 버튼 (왼쪽)
        if (mx > width / 2 - 120 - btnWidth / 2 &&
            mx < width / 2 - 120 + btnWidth / 2 &&
            my > btnY - btnHeight / 2 &&
            my < btnY + btnHeight / 2) {
            return 'retry';
        }

        // 난이도 선택 버튼 (오른쪽)
        if (mx > width / 2 + 120 - btnWidth / 2 &&
            mx < width / 2 + 120 + btnWidth / 2 &&
            my > btnY - btnHeight / 2 &&
            my < btnY + btnHeight / 2) {
            return 'difficulty';
        }

        return null;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultScreen;
}
