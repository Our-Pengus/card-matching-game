/**
 * @fileoverview UI 화면 렌더링 클래스 - 귀여운 파스텔 스타일
 * @module rendering/UIRenderer
 * @description 레퍼런스 이미지 기반 Soft Toy/Plushie aesthetic 구현
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

        // 하이스코어
        this.highScoreManager = new HighScoreManager();

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

        // 폰트 설정
        this.fonts = {
            title: 48,
            button: 32,
            ui: 24,
            small: 18
        };

        // 애니메이션
        this.waveOffset = 0;
        this.cloudOffset = 0;
    }

    // ========================================
    // 시작 화면
    // ========================================

    drawStartScreen() {
        // 배경 그라데이션
        this._drawGradientBackground();

        // 장식 요소
        this._drawWaves(height - 150);
        this._drawClouds();

        // 캐릭터 (곰)
        this._drawBearCharacter(width / 2, height / 2 + 100, 1.5);

        // 말풍선
        this._drawSpeechBubble(
            width / 2 + 180,
            height / 2 - 20,
            '카드를 두 장씩 뒤집어\n짝을 맞춰요!',
            200
        );

        // 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.title);
        textStyle(BOLD);

        // 타이틀 그림자
        fill(0, 0, 0, 30);
        text('카드 쿵쿵\n매칭 짝짝!', width / 2 + 4, height / 2 - 154);

        // 타이틀 (하얀 테두리)
        fill(this.colors.text.white);
        stroke(this.colors.text.primary);
        strokeWeight(8);
        text('카드 쿵쿵\n매칭 짝짝!', width / 2, height / 2 - 150);
        pop();

        // 시작 버튼 (큰 둥근 버튼)
        const startBtn = this._drawPillButton(
            width / 2,
            height - 120,
            200,
            70,
            '시작',
            this.colors.button.easy,
            'start'
        );
    }

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

    // ========================================
    // 난이도 선택 화면
    // ========================================

    drawDifficultyScreen() {
        // 배경
        this._drawGradientBackground();
        this._drawWaves(height - 150);
        this._drawClouds();

        // 캐릭터 (작게)
        this._drawBearCharacter(150, height - 100, 0.8);

        // 말풍선
        this._drawSpeechBubble(
            280,
            height - 180,
            '카드를 두 장씩 뒤집어\n짝을 맞춰요!',
            180
        );

        // 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.title);
        textStyle(BOLD);

        fill(this.colors.text.white);
        stroke(this.colors.text.primary);
        strokeWeight(8);
        text('난이도 선택', width / 2, 100);
        pop();

        // 난이도 버튼들 (세로 배치)
        const buttons = [
            { key: 'EASY', label: '쉬움', color: this.colors.button.easy, y: 220 },
            { key: 'MEDIUM', label: '보통', color: this.colors.button.normal, y: 320 },
            { key: 'HARD', label: '어려움', color: this.colors.button.hard, y: 420 },
            { key: 'HELL', label: '지옥', color: this.colors.button.hell, y: 520 }
        ];

        buttons.forEach(btn => {
            this._drawPillButton(
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

    handleDifficultyClick(mx, my) {
        const buttons = [
            { key: 'EASY', y: 220 },
            { key: 'MEDIUM', y: 320 },
            { key: 'HARD', y: 420 },
            { key: 'HELL', y: 520 }
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

    // ========================================
    // 게임 플레이 화면
    // ========================================

    drawGameUI(gameState) {
        // 배경
        background(this.colors.bg.light);

        // 상단 UI 바
        this._drawTopBar(gameState);

        // 헬퍼 메시지
        if (this.helperMessage && millis() < this.helperMessageEndTime) {
            this._drawHelperMessage();
        }

        // 피드백 메시지
        if (this.currentMessage && millis() < this.messageEndTime) {
            this._drawFeedbackMessage();
        }
    }

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

    _drawScoreDisplay(x, y, score) {
        push();
        textAlign(LEFT, CENTER);

        // 아이콘 (별)
        fill('#FFD700');
        noStroke();
        textSize(28);
        text('⭐', x - 10, y - 2);

        // 점수
        fill(this.colors.text.primary);
        textSize(this.fonts.ui);
        textStyle(BOLD);
        text(`×${score}`, x + 25, y);
        pop();
    }

    _drawTimeDisplay(x, y, timeRemaining) {
        push();
        textAlign(CENTER, CENTER);

        // 시간 배경 (둥근 박스)
        const boxWidth = 140;
        const boxHeight = 50;

        fill(255, 255, 255);
        stroke(this.colors.text.primary);
        strokeWeight(3);
        rect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 25);

        // 시간 텍스트
        noStroke();
        fill(this.colors.text.primary);
        textSize(this.fonts.ui);
        textStyle(BOLD);

        const minutes = floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const timeStr = `${minutes}:${nf(seconds, 2)}`;
        text(timeStr, x, y);
        pop();
    }

    _drawHeartDisplay(x, y, hearts, maxHearts) {
        push();
        textAlign(CENTER, CENTER);

        // 하트 아이콘 (하트가 적으면 회색으로)
        const heartColor = hearts > maxHearts * 0.3 ? this.colors.heart : '#999999';
        fill(heartColor);
        noStroke();
        textSize(28);
        text('❤️', x - 30, y - 2);

        // 개수 (하트가 0이면 회색으로)
        const textColor = hearts > 0 ? this.colors.text.primary : '#999999';
        fill(textColor);
        textSize(this.fonts.ui);
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

    // ========================================
    // 결과 화면
    // ========================================

    drawResultScreen(stats) {
        // 배경
        this._drawGradientBackground();
        this._drawWaves(height - 150);

        // 승리 여부 및 원인 판단
        const isWin = stats.isWin;
        const reason = stats.gameOverReason;

        // 캐릭터 (크게) - 표정은 승리 여부에 따라
        this._drawBearCharacter(width / 2, height / 2 + 50, 1.3, isWin);

        // 아이콘 표시 (승리/실패에 따라)
        let icon = '🎉';
        if (!isWin) {
            if (reason === 'hearts') {
                icon = '💔';
            } else if (reason === 'time') {
                icon = '⏰';
            }
        }

        // 아이콘 그리기
        push();
        textAlign(CENTER, CENTER);
        textSize(60);
        noStroke();
        const iconBounce = sin(millis() * 0.005) * 5;
        text(icon, width / 2, 150 + iconBounce);
        pop();

        // 결과 타이틀
        push();
        textAlign(CENTER, CENTER);
        textSize(this.fonts.title);
        textStyle(BOLD);

        let titleText;
        if (isWin) {
            titleText = '성공!';
        } else if (reason === 'hearts') {
            titleText = '실패!';
        } else {
            titleText = '시간 초과!';
        }

        fill(this.colors.text.white);
        stroke(this.colors.text.primary);
        strokeWeight(8);
        text(titleText, width / 2, 100);
        pop();

        // 통계 박스
        this._drawStatsBox(width / 2, 250, stats);

        // 버튼들
        // 재시도 버튼 (같은 난이도)
        this._drawPillButton(
            width / 2 - 120,
            height - 120,
            200,
            70,
            '재시도',
            this.colors.button.normal,
            'retry'
        );
        
        // 난이도 선택 버튼
        this._drawPillButton(
            width / 2 + 120,
            height - 120,
            200,
            70,
            '난이도 선택',
            this.colors.button.hard,
            'difficulty'
        );
    }

    _drawStatsBox(x, y, stats) {
        const isWin = stats.isWin;
        const boxWidth = 400;
        const boxHeight = isWin ? 320 : 300;

        push();
        // 박스 배경
        fill(255, 255, 255, 250);
        stroke(this.colors.text.primary);
        strokeWeight(4);
        rect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 30);

        // 통계 텍스트
        textAlign(CENTER, CENTER);
        noStroke();
        fill(this.colors.text.primary);

        const statY = y - 90;
        const lineHeight = 40;

        // 난이도
        textSize(this.fonts.ui - 2);
        textStyle(NORMAL);
        text(`난이도: ${stats.difficulty}`, x, statY + lineHeight * 0);

        // 점수
        textSize(this.fonts.ui);
        textStyle(BOLD);
        text(`점수: ${stats.score}점`, x, statY + lineHeight * 1);

        // 하트 정보
        textSize(this.fonts.ui - 2);
        textStyle(NORMAL);
        const heartText = isWin 
            ? `남은 하트: ${stats.heartsRemaining}/${stats.maxHearts}`
            : `하트: 0/${stats.maxHearts}`;
        text(heartText, x, statY + lineHeight * 2);

        // 시간
        const minutes = floor(stats.elapsedTime / 60);
        const seconds = stats.elapsedTime % 60;
        text(`플레이 시간: ${minutes}분 ${seconds}초`, x, statY + lineHeight * 3);

        // 맞춘 카드 쌍
        text(`맞춘 짝: ${stats.matchedPairs}/${stats.totalPairs}`, x, statY + lineHeight * 4);

        // 시도 횟수
        text(`시도: ${stats.attempts}회`, x, statY + lineHeight * 5);

        // 정확도
        text(`정확도: ${stats.accuracy}%`, x, statY + lineHeight * 6);

        // 최대 콤보 (승리 시에만)
        if (isWin && stats.maxCombo > 0) {
            text(`최대 콤보: ${stats.maxCombo}`, x, statY + lineHeight * 7);
        }

        pop();
    }

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

    // ========================================
    // 공통 UI 컴포넌트
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
     */
    _drawBearCharacter(x, y, bearScale = 1, isHappy = false) {
        push();
        translate(x, y);
        scale(bearScale);

        const bodySize = 80;

        // 몸통
        fill(this.colors.bear.body);
        stroke(this.colors.text.white);
        strokeWeight(4);
        ellipse(0, 0, bodySize, bodySize * 1.2);

        // 귀 (좌우)
        ellipse(-bodySize * 0.4, -bodySize * 0.45, bodySize * 0.35, bodySize * 0.35);
        ellipse(bodySize * 0.4, -bodySize * 0.45, bodySize * 0.35, bodySize * 0.35);

        // 귀 안쪽
        fill(this.colors.bear.blush);
        noStroke();
        ellipse(-bodySize * 0.4, -bodySize * 0.45, bodySize * 0.2, bodySize * 0.2);
        ellipse(bodySize * 0.4, -bodySize * 0.45, bodySize * 0.2, bodySize * 0.2);

        // 얼굴
        fill(this.colors.bear.body);
        stroke(this.colors.text.white);
        strokeWeight(4);
        ellipse(0, -bodySize * 0.1, bodySize * 0.85, bodySize * 0.75);

        // 눈
        fill(this.colors.bear.face);
        noStroke();
        if (isHappy) {
            // 웃는 눈
            stroke(this.colors.bear.face);
            strokeWeight(3);
            noFill();
            arc(-bodySize * 0.2, -bodySize * 0.2, 12, 8, 0, PI);
            arc(bodySize * 0.2, -bodySize * 0.2, 12, 8, 0, PI);
        } else {
            // 기본 눈
            ellipse(-bodySize * 0.2, -bodySize * 0.2, 8, 8);
            ellipse(bodySize * 0.2, -bodySize * 0.2, 8, 8);
        }

        // 코
        noStroke();
        fill(this.colors.bear.face);
        ellipse(0, 0, 12, 10);

        // 입
        stroke(this.colors.bear.face);
        strokeWeight(2);
        noFill();
        if (isHappy) {
            arc(0, 5, 20, 15, 0, PI);
        } else {
            arc(0, 8, 16, 10, 0, PI);
        }

        // 볼 (핑크)
        fill(this.colors.bear.blush);
        noStroke();
        ellipse(-bodySize * 0.35, 0, 15, 12);
        ellipse(bodySize * 0.35, 0, 15, 12);

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
            x - tailSize, y + h * 0.6,
            x, y + h * 0.4,
            x, y + h * 0.8
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
     * 물결 장식 그리기
     */
    _drawWaves(yPos) {
        this.waveOffset += 0.5;

        push();
        noStroke();

        // 뒤쪽 물결 (연한 색)
        fill(255, 255, 255, 100);
        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width; x += 20) {
            const y = yPos + sin((x + this.waveOffset) * 0.02) * 15;
            vertex(x, y);
        }
        vertex(width, height);
        endShape(CLOSE);

        // 앞쪽 물결 (하얀색)
        fill(255, 255, 255);
        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width; x += 20) {
            const y = yPos + 30 + sin((x + this.waveOffset + 50) * 0.025) * 20;
            vertex(x, y);
        }
        vertex(width, height);
        endShape(CLOSE);

        pop();
    }

    /**
     * 구름 장식 그리기
     */
    _drawClouds() {
        this.cloudOffset += 0.2;

        const clouds = [
            { x: (this.cloudOffset % (width + 200)) - 100, y: 80, size: 1 },
            { x: ((this.cloudOffset * 0.7) % (width + 250)) - 125, y: 150, size: 0.8 },
            { x: ((this.cloudOffset * 1.3) % (width + 180)) - 90, y: 200, size: 0.6 }
        ];

        clouds.forEach(cloud => {
            this._drawCloud(cloud.x, cloud.y, cloud.size);
        });
    }

    _drawCloud(x, y, cloudSize) {
        push();
        translate(x, y);
        scale(cloudSize);

        fill(255, 255, 255, 200);
        noStroke();

        ellipse(0, 0, 60, 40);
        ellipse(-25, 5, 50, 35);
        ellipse(25, 5, 50, 35);
        ellipse(-15, -10, 40, 30);
        ellipse(15, -10, 40, 30);

        pop();
    }

    /**
     * 그라데이션 배경
     */
    _drawGradientBackground() {
        // 단순한 그라데이션 대신 p5.js의 배경색 사용
        background(this.colors.bg.main);

        // 상단 밝은 영역
        push();
        noStroke();
        for (let y = 0; y < height / 2; y += 5) {
            const alpha = map(y, 0, height / 2, 100, 0);
            fill(229, 237, 247, alpha);
            rect(0, y, width, 5);
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

        // 배경
        const boxWidth = 400;
        const boxHeight = 100;
        fill(255, 255, 255, alpha * 0.95);
        stroke(this.colors.text.primary);
        strokeWeight(4);
        rect(
            width / 2 - boxWidth / 2,
            height / 2 - 200 - boxHeight / 2,
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
        text(this.currentMessage.text, width / 2, height / 2 - 200);

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
