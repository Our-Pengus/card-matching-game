/**
 * @fileoverview UI 화면 렌더링 오케스트레이터 - 귀여운 파스텔 스타일
 * @module rendering/UIRenderer
 * @description 레퍼런스 이미지 기반 Soft Toy/Plushie aesthetic 구현
 *              Screen 객체들을 관리하고 공통 유틸리티 제공
 */

class UIRenderer {
    constructor() {
        // 버튼 상태
        this.hoveredButton = null;
        this.buttonHoverProgress = new Map();

        // 메시지 시스템
        this.currentMessage = null;
        this.messageEndTime = 0;
        this.messageAlpha = 0;
        this.messageQueue = [];
        this.helperMessage = null;
        this.helperMessageEndTime = 0;
        this.previewStartTime = null;  // 미리보기 시작 시간

        // 디자인 시스템 - 레퍼런스 기반 파스텔 컬러
        this.colors = {
            // 배경색
            bg: {
                main: '#C8D8F0',      // 연한 파란색 배경
                light: '#E5EDF7',     // 더 연한 배경
                gradient1: '#C8D8F0',
                gradient2: '#E5EDF7'
            },
            // 버튼 색상 (레퍼런스의 초록/주황/보라)
            button: {
                easy: '#7DD87D',      // 밝은 초록 (쉬움)
                normal: '#FFB76B',    // 주황 (보통)
                hard: '#D77DD7',      // 보라 (어려움)
                hell: '#FF6B6B'       // 빨강 (지옥)
            },
            // 캐릭터 색상
            bear: {
                body: '#E8D4B8',      // 베이지색 곰
                face: '#4A3728',      // 갈색 눈/코
                blush: '#FFB4D1'      // 핑크 볼
            },
            // UI 요소
            text: {
                primary: '#2E5C8A',   // 진한 파란색
                white: '#FFFFFF',
                dark: '#4A3728'
            },
            // 카드 관련
            card: {
                back: '#FFB4D1',      // 핑크 뒷면
                border: '#FFFFFF',    // 하얀 테두리
                shadow: 'rgba(0, 0, 0, 0.1)'
            },
            // 하트/라이프
            heart: '#FF6B9D'
        };

        // 폰트 설정 (Cute Font용 +8 사이즈 업)
        this.fonts = {
            title: 56,
            button: 40,
            ui: 32,
            small: 26
        };

        // 애니메이션
        this.waveOffset = 0;
        this.cloudOffset = 0;

        // Screen 객체 초기화 (자기 자신을 전달)
        this.startScreen = new StartScreen(this);
        this.gameScreen = new GameScreen(this);
        this.resultScreen = new ResultScreen(this);
    }

    // ========================================
    // 화면 렌더링 위임
    // ========================================

    drawStartScreen() {
        return this.startScreen.drawStartScreen();
    }

    handleStartClick(mx, my) {
        return this.startScreen.handleStartClick(mx, my);
    }

    drawDifficultyScreen() {
        return this.startScreen.drawDifficultyScreen();
    }

    handleDifficultyClick(mx, my) {
        return this.startScreen.handleDifficultyClick(mx, my);
    }

    drawGameUI(gameState) {
        return this.gameScreen.drawGameUI(gameState);
    }

    drawResultScreen(stats) {
        return this.resultScreen.drawResultScreen(stats);
    }

    handleResultClick(mx, my) {
        return this.resultScreen.handleResultClick(mx, my);
    }

    // ========================================
    // 공통 UI 컴포넌트 (모든 Screen에서 사용)
    // ========================================

    /**
     * 둥근 알약 모양 버튼 그리기
     */
    _drawPillButton(x, y, w, h, label, color, id) {
        // 호버 애니메이션
        let hoverProgress = this.buttonHoverProgress.get(id) || 0;
        const isHovered = this._isPointInRect(mouseX, mouseY, x, y, w, h);

        if (isHovered) {
            hoverProgress = min(hoverProgress + 0.15, 1);
        } else {
            hoverProgress = max(hoverProgress - 0.15, 0);
        }
        this.buttonHoverProgress.set(id, hoverProgress);

        push();
        translate(x, y);

        // 호버 시 약간 위로
        translate(0, -hoverProgress * 5);

        // 그림자 (호버 시 더 크게)
        const shadowY = 6 + hoverProgress * 4;
        fill(0, 0, 0, 20 + hoverProgress * 10);
        noStroke();
        ellipse(-w / 2 + h / 2, shadowY, h, h);
        ellipse(w / 2 - h / 2, shadowY, h, h);
        rect(-w / 2 + h / 2, shadowY - h / 2, w - h, h);

        // 버튼 배경 (알약 모양)
        fill(color);
        stroke(this.colors.card.border);
        strokeWeight(6);

        // 양쪽 반원
        ellipse(-w / 2 + h / 2, 0, h, h);
        ellipse(w / 2 - h / 2, 0, h, h);
        // 중앙 사각형
        noStroke();
        rect(-w / 2 + h / 2, -h / 2, w - h, h);

        // 하이라이트 (광택 효과)
        fill(255, 255, 255, 100);
        ellipse(0, -h / 4, w * 0.6, h * 0.3);

        // 텍스트
        fill(this.colors.text.white);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.button);
        textStyle(BOLD);
        text(label, 0, 0);

        pop();
    }

    /**
     * 곰 캐릭터 그리기
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @param {number} bearScale - 크기 배율
     * @param {boolean} isHappy - true: 웃는 표정, false: 우는 표정
     */
    _drawBearCharacter(x, y, bearScale = 1, isHappy = false) {
        push();
        translate(x, y);
        scale(bearScale);

        const faceSize = 80;

        // 귀 (좌우)
        fill(this.colors.bear.body);
        stroke(this.colors.text.white);
        strokeWeight(4);
        ellipse(-faceSize * 0.4, -faceSize * 0.45, faceSize * 0.4, faceSize * 0.4);
        ellipse(faceSize * 0.4, -faceSize * 0.45, faceSize * 0.4, faceSize * 0.4);

        // 귀 안쪽
        fill(this.colors.bear.blush);
        noStroke();
        ellipse(-faceSize * 0.4, -faceSize * 0.45, faceSize * 0.2, faceSize * 0.2);
        ellipse(faceSize * 0.4, -faceSize * 0.45, faceSize * 0.2, faceSize * 0.2);

        // 얼굴 (메인)
        fill(this.colors.bear.body);
        stroke(this.colors.text.white);
        strokeWeight(4);
        ellipse(0, 0, faceSize, faceSize);

        // 눈
        fill(this.colors.bear.face);
        noStroke();
        if (isHappy) {
            // 웃는 눈 (^ ^)
            stroke(this.colors.bear.face);
            strokeWeight(3);
            noFill();
            arc(-faceSize * 0.2, -faceSize * 0.1, 14, 10, 0, PI);
            arc(faceSize * 0.2, -faceSize * 0.1, 14, 10, 0, PI);
        } else {
            // 우는 눈 (ㅠㅠ)
            stroke(this.colors.bear.face);
            strokeWeight(3);
            noFill();
            arc(-faceSize * 0.2, -faceSize * 0.05, 14, 10, PI, TWO_PI);
            arc(faceSize * 0.2, -faceSize * 0.05, 14, 10, PI, TWO_PI);
            // 눈물
            fill('#87CEEB');
            noStroke();
            ellipse(-faceSize * 0.2, faceSize * 0.08, 5, 10);
            ellipse(faceSize * 0.2, faceSize * 0.08, 5, 10);
        }

        // 코
        noStroke();
        fill(this.colors.bear.face);
        ellipse(0, faceSize * 0.1, 14, 12);

        // 입
        stroke(this.colors.bear.face);
        strokeWeight(2);
        noFill();
        if (isHappy) {
            // 웃는 입
            arc(0, faceSize * 0.2, 20, 15, 0, PI);
        } else {
            // 슬픈 입
            arc(0, faceSize * 0.28, 16, 10, PI, TWO_PI);
        }

        // 볼 (핑크)
        fill(this.colors.bear.blush);
        noStroke();
        ellipse(-faceSize * 0.32, faceSize * 0.1, 16, 12);
        ellipse(faceSize * 0.32, faceSize * 0.1, 16, 12);

        pop();
    }

    /**
     * 말풍선 그리기
     */
    _drawSpeechBubble(x, y, message, w) {
        push();

        // 말풍선 배경
        fill(this.colors.text.white);
        stroke(this.colors.text.primary);
        strokeWeight(3);

        const h = 80;
        const tailSize = 15;

        // 메인 박스
        rect(x, y, w, h, 20);

        // 꼬리 (삼각형)
        noStroke();
        triangle(
            x - tailSize, y + h / 2 + 10,
            x, y + h / 2,
            x + tailSize, y + h / 2 + 10
        );

        // 텍스트
        fill(this.colors.text.primary);
        textAlign(CENTER, CENTER);
        textSize(this.fonts.small);
        textStyle(NORMAL);
        text(message, x + w / 2, y + h / 2);

        pop();
    }

    /**
     * 물결 그리기
     */
    _drawWaves(yPos) {
        this.waveOffset += 0.01;

        push();
        noStroke();

        // 뒷쪽 물결 (밝은색)
        fill(255, 255, 255, 100);
        beginShape();
        for (let x = 0; x <= width; x += 10) {
            const y = yPos + sin(x * 0.02 + this.waveOffset) * 15;
            vertex(x, y);
        }
        vertex(width, height);
        vertex(0, height);
        endShape(CLOSE);

        // 앞쪽 물결 (진한색)
        fill(255, 255, 255, 180);
        beginShape();
        for (let x = 0; x <= width; x += 10) {
            const y = yPos + 10 + sin(x * 0.03 + this.waveOffset + 1) * 10;
            vertex(x, y);
        }
        vertex(width, height);
        vertex(0, height);
        endShape(CLOSE);

        pop();
    }

    /**
     * 구름 그리기
     */
    _drawClouds() {
        this.cloudOffset += 0.2;

        this._drawCloud((this.cloudOffset % width) - 100, 80, 1);
        this._drawCloud((this.cloudOffset * 0.7 % width) + 200, 150, 0.8);
        this._drawCloud((this.cloudOffset * 0.5 % width) + 400, 120, 1.2);
    }

    _drawCloud(x, y, cloudSize) {
        push();
        fill(255, 255, 255, 150);
        noStroke();

        ellipse(x, y, 60 * cloudSize, 40 * cloudSize);
        ellipse(x - 25 * cloudSize, y + 5, 50 * cloudSize, 35 * cloudSize);
        ellipse(x + 25 * cloudSize, y + 5, 50 * cloudSize, 35 * cloudSize);

        pop();
    }

    /**
     * 그라데이션 배경
     */
    _drawGradientBackground() {
        push();
        // 간단한 수직 그라데이션 효과
        for (let y = 0; y < height; y++) {
            const inter = map(y, 0, height, 0, 1);
            const c = lerpColor(
                color(this.colors.bg.gradient1),
                color(this.colors.bg.gradient2),
                inter
            );
            stroke(c);
            line(0, y, width, y);
        }
        pop();
    }

    // ========================================
    // 메시지 시스템
    // ========================================

    showMessage(text, duration = 2000, type = 'info') {
        this.currentMessage = { text, type };
        this.messageEndTime = millis() + duration;
    }

    showHelperMessage(message, duration = 3000) {
        this.helperMessage = message;
        this.helperMessageEndTime = millis() + duration;
    }

    _drawFeedbackMessage() {
        const remaining = this.messageEndTime - millis();
        const fadeTime = 300;

        let alpha = 255;
        if (remaining < fadeTime) {
            alpha = map(remaining, 0, fadeTime, 0, 255);
        }

        push();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.title);
        textStyle(BOLD);

        // 배경 (상단 바와 카드 영역 사이 중앙에 위치)
        // 상단 바: ~80px, 카드 시작: ~280px → 중앙: 180px
        const boxWidth = 400;
        const boxHeight = 80;
        const topBarEnd = 80;
        const cardAreaStart = 260;
        const messageY = topBarEnd + (cardAreaStart - topBarEnd - boxHeight) / 2;
        fill(255, 255, 255, alpha * 0.95);
        stroke(this.colors.text.primary);
        strokeWeight(4);
        rect(
            width / 2 - boxWidth / 2,
            messageY,
            boxWidth,
            boxHeight,
            30
        );

        // 텍스트
        noStroke();
        const color = this.currentMessage.type === 'success'
            ? this.colors.button.easy
            : this.colors.button.hell;
        fill(red(color), green(color), blue(color), alpha);
        text(this.currentMessage.text, width / 2, messageY + boxHeight / 2);

        pop();
    }

    _drawHelperMessage() {
        const remaining = this.helperMessageEndTime - millis();
        const fadeTime = 500;

        let alpha = 200;
        if (remaining < fadeTime) {
            alpha = map(remaining, 0, fadeTime, 0, 200);
        }

        push();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.small);

        // 배경
        fill(0, 0, 0, alpha * 0.7);
        noStroke();
        const padding = 20;
        const textW = textWidth(this.helperMessage);
        rect(
            width / 2 - textW / 2 - padding,
            100,
            textW + padding * 2,
            40,
            20
        );

        // 텍스트
        fill(255, 255, 255, alpha);
        text(this.helperMessage, width / 2, 120);

        pop();
    }

    // ========================================
    // 유틸리티
    // ========================================

    updateHover(mx, my) {
        this.hoveredButton = null;
    }

    _formatTime(seconds) {
        const m = floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${nf(s, 2)}`;
    }

    _isPointInRect(px, py, cx, cy, w, h) {
        return px > cx - w / 2 &&
               px < cx + w / 2 &&
               py > cy - h / 2 &&
               py < cy + h / 2;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
