/**
 * @fileoverview 시작 화면 및 난이도 선택 화면 렌더링
 * @module rendering/screens/StartScreen
 * @description 시작 화면과 난이도 선택 화면을 담당하는 클래스
 */

class StartScreen {
    constructor(uiRenderer) {
        // UIRenderer의 공통 유틸리티 참조
        this.ui = uiRenderer;
    }

    /**
     * 시작 화면 그리기
     */
    drawStartScreen() {
        // 배경 그라데이션
        this.ui._drawGradientBackground();

        // 장식 요소
        this.ui._drawWaves(height - 150);
        this.ui._drawClouds();

        // 캐릭터 (곰) - 웃는 표정
        this.ui._drawBearCharacter(width / 2, height / 2 + 100, 1.5, true);

        // 말풍선
        this.ui._drawSpeechBubble(
            width / 2 + 180,
            height / 2 - 20,
            '카드를 두 장씩 뒤집어\n짝을 맞춰요!',
            200
        );

        // 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(this.ui.fonts.title);
        textStyle(BOLD);

        // 타이틀 그림자
        fill(0, 0, 0, 30);
        text('카드 쿵쿵\n매칭 짝짝!', width / 2 + 4, height / 2 - 154);

        // 타이틀 (하얀 테두리)
        fill(this.ui.colors.text.white);
        stroke(this.ui.colors.text.primary);
        strokeWeight(8);
        text('카드 쿵쿵\n매칭 짝짝!', width / 2, height / 2 - 150);
        pop();

        // 시작 버튼 (큰 둥근 버튼)
        this.ui._drawPillButton(
            width / 2,
            height - 120,
            200,
            70,
            '시작',
            this.ui.colors.button.easy,
            'start'
        );
    }

    /**
     * 시작 화면 클릭 처리
     * @param {number} mx - 마우스 x 좌표
     * @param {number} my - 마우스 y 좌표
     * @returns {string|null} 클릭된 버튼 ID
     */
    handleStartClick(mx, my) {
        // 시작 버튼 영역 체크
        const btnY = height - 120;
        const btnWidth = 200;
        const btnHeight = 70;

        if (mx > width / 2 - btnWidth / 2 &&
            mx < width / 2 + btnWidth / 2 &&
            my > btnY - btnHeight / 2 &&
            my < btnY + btnHeight / 2) {
            return 'start';
        }
        return null;
    }

    /**
     * 난이도 선택 화면 그리기
     */
    drawDifficultyScreen() {
        // 배경
        this.ui._drawGradientBackground();
        this.ui._drawWaves(height - 150);
        this.ui._drawClouds();

        // 캐릭터 (작게) - 웃는 표정
        this.ui._drawBearCharacter(150, height - 100, 0.8, true);

        // 말풍선
        this.ui._drawSpeechBubble(
            280,
            height - 180,
            '카드를 두 장씩 뒤집어\n짝을 맞춰요!',
            180
        );

        // 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(this.ui.fonts.title);
        textStyle(BOLD);

        fill(this.ui.colors.text.white);
        stroke(this.ui.colors.text.primary);
        strokeWeight(8);
        text('난이도 선택', width / 2, 100);
        pop();

        // 난이도 버튼들 (세로 배치)
        const buttons = [
            { key: 'EASY', label: '쉬움', color: this.ui.colors.button.easy, y: 220 },
            { key: 'MEDIUM', label: '보통', color: this.ui.colors.button.normal, y: 320 },
            { key: 'HARD', label: '어려움', color: this.ui.colors.button.hard, y: 420 }
        ];

        buttons.forEach(btn => {
            this.ui._drawPillButton(
                width / 2,
                btn.y,
                300,
                70,
                btn.label,
                btn.color,
                btn.key
            );
        });
    }

    /**
     * 난이도 선택 화면 클릭 처리
     * @param {number} mx - 마우스 x 좌표
     * @param {number} my - 마우스 y 좌표
     * @returns {string|null} 선택된 난이도 키
     */
    handleDifficultyClick(mx, my) {
        const buttons = [
            { key: 'EASY', y: 220 },
            { key: 'MEDIUM', y: 320 },
            { key: 'HARD', y: 420 }
        ];

        for (let btn of buttons) {
            if (mx > width / 2 - 150 &&
                mx < width / 2 + 150 &&
                my > btn.y - 35 &&
                my < btn.y + 35) {
                return btn.key;
            }
        }
        return null;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StartScreen;
}
