/**
 * @fileoverview UI 화면 렌더링 클래스
 * @module rendering/UIRenderer
 * @author 윤현준 (UI 구현, 화면 전환)
 *         손아영 (메시지, 결과 화면)
 */

/**
 * 게임 UI 렌더링 담당
 * 시작 화면, 난이도 선택, 게임 UI, 결과 화면
 * @class
 */
class UIRenderer {
    constructor() {
        // 버튼 상태
        this.hoveredButton = null;

        // 향상된 메시지 시스템
        this.currentMessage = null;
        this.messageEndTime = 0;
        this.messageAlpha = 0; // 메시지 투명도 (페이드 효과)
        this.messageQueue = []; // 메시지 큐

        // 헬퍼 메시지 (게임 시작 시)
        this.helperMessage = null;
        this.helperMessageEndTime = 0;

        // 네온 아케이드 스타일
        this.style = {
            // 폰트
            titleSize: 72,
            headingSize: 52,
            bodySize: 26,
            smallSize: 18,

            // 네온 색상
            neonPink: '#FF10F0',
            neonCyan: '#00F0FF',
            neonPurple: '#B026FF',
            neonGreen: '#39FF14',
            neonOrange: '#FF6B35',

            // 다크 베이스
            darkBg: '#0a0a0f',
            darkSurface: '#1a1a2e',
            darkCard: '#16213e',

            textLight: '#FFFFFF',
            textDim: '#AAAAAA',

            // 버튼
            buttonPadding: 20,
            buttonRadius: 15,

            // 효과
            glowIntensity: 20
        };

        // 최고 기록 관리자
        this.highScoreManager = new HighScoreManager();
    }

    // ========== 시작 화면 ==========

    /**
     * 시작 화면 렌더링 (네온 아케이드 스타일)
     */
    drawStartScreen() {
        // 다크 배경
        background(this.style.darkBg);

        // 네온 그리드 배경 효과
        this._drawNeonGrid();

        push();

        // 제목 - 네온 글로우 효과
        textAlign(CENTER, CENTER);
        textSize(this.style.titleSize);
        textStyle(BOLD);

        // 네온 핑크 글로우
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = this.style.neonPink;
        fill(this.style.neonPink);
        text('NEON MEMORY', width / 2, height / 3 - 20);

        // 서브타이틀 - 사이안 글로우
        drawingContext.shadowColor = this.style.neonCyan;
        drawingContext.shadowBlur = 20;
        textSize(this.style.bodySize);
        textStyle(NORMAL);
        fill(this.style.neonCyan);
        text('◢ ARCADE EDITION ◣', width / 2, height / 3 + 40);

        // 설명 텍스트
        drawingContext.shadowBlur = 10;
        textSize(22);
        fill(this.style.textDim);
        text('같은 카드 쌍을 찾아 매칭하세요', width / 2, height / 2 + 20);

        pop();

        // 시작 버튼
        const btnX = width / 2 - 120;
        const btnY = height * 2 / 3;
        const btnW = 240;
        const btnH = 70;

        this._drawNeonButton(btnX, btnY, btnW, btnH, '▶ START', 'start');

        // 깜빡이는 "PRESS START" 텍스트
        if (frameCount % 60 < 40) {
            push();
            textSize(18);
            fill(this.style.neonGreen);
            drawingContext.shadowColor = this.style.neonGreen;
            drawingContext.shadowBlur = 15;
            text('PRESS START', width / 2, height * 0.85);
            pop();
        }
    }

    /**
     * 시작 화면 클릭 처리
     *
     * @param {number} mx - 마우스 x
     * @param {number} my - 마우스 y
     * @returns {string|null} 버튼 ID
     */
    handleStartClick(mx, my) {
        return this._checkButton(width / 2 - 120, height * 2 / 3, 240, 70, 'start');
    }

    // ========== 난이도 선택 화면 ==========

    /**
     * 난이도 선택 화면 렌더링 (네온 스타일)
     */
    drawDifficultyScreen() {
        // 다크 배경
        background(this.style.darkBg);

        // 네온 그리드
        this._drawNeonGrid();

        push();

        // 제목
        textAlign(CENTER, CENTER);
        textSize(this.style.headingSize);
        textStyle(BOLD);
        drawingContext.shadowBlur = 25;
        drawingContext.shadowColor = this.style.neonPurple;
        fill(this.style.neonPurple);
        text('◈ SELECT DIFFICULTY ◈', width / 2, 100);

        pop();

        // 난이도 버튼들
        const difficulties = [
            { key: 'EASY', y: 200, color: this.style.neonGreen },
            { key: 'MEDIUM', y: 320, color: this.style.neonCyan },
            { key: 'HARD', y: 440, color: this.style.neonOrange },
            { key: 'HELL', y: 560, color: this.style.neonPink }
        ];

        difficulties.forEach(({ key, y, color }) => {
            const config = DIFFICULTY[key];
            this._drawNeonDifficultyButton(
                width / 2 - 250,
                y,
                500,
                100,
                config,
                key,
                color
            );
        });
    }

    /**
     * 네온 난이도 버튼 그리기
     *
     * @private
     */
    _drawNeonDifficultyButton(x, y, w, h, config, id, neonColor) {
        const isHovered = this.hoveredButton === id;

        push();

        // 호버 시 펄스 효과
        const pulseScale = isHovered ? 1 + sin(frameCount * 0.15) * 0.02 : 1;
        translate(x + w / 2, y + h / 2);
        scale(pulseScale);
        translate(-(x + w / 2), -(y + h / 2));

        // 버튼 배경 (다크)
        fill(this.style.darkCard);
        noStroke();
        rect(x, y, w, h, this.style.buttonRadius);

        // 네온 테두리
        noFill();
        strokeWeight(isHovered ? 4 : 2);
        stroke(neonColor);
        drawingContext.shadowBlur = isHovered ? 25 : 15;
        drawingContext.shadowColor = neonColor;
        rect(x, y, w, h, this.style.buttonRadius);

        // 난이도 이름
        drawingContext.shadowBlur = 20;
        noStroke();
        fill(neonColor);
        textAlign(CENTER, CENTER);
        textSize(42);
        textStyle(BOLD);
        text(config.name.toUpperCase(), x + w / 2, y + h / 2 - 18);

        // 상세 정보
        drawingContext.shadowBlur = 10;
        textSize(18);
        textStyle(NORMAL);
        fill(this.style.textDim);
        text(`${config.pairs}쌍 ◆ ${config.timeLimit}초 ◆ ${config.pointsPerMatch}점`,
             x + w / 2, y + h / 2 + 22);

        // 호버 시 추가 글로우
        if (isHovered) {
            noFill();
            strokeWeight(1);
            drawingContext.shadowBlur = 35;
            rect(x + 5, y + 5, w - 10, h - 10, this.style.buttonRadius);
        }

        pop();
    }

    /**
     * 난이도 선택 화면 클릭 처리
     *
     * @param {number} mx
     * @param {number} my
     * @returns {string|null} 선택된 난이도 키
     */
    handleDifficultyClick(mx, my) {
        const difficulties = [
            { key: 'EASY', y: 200 },
            { key: 'MEDIUM', y: 320 },
            { key: 'HARD', y: 440 },
            { key: 'HELL', y: 560 }
        ];

        for (const { key, y } of difficulties) {
            if (this._isInRect(mx, my, width / 2 - 250, y, 500, 100)) {
                return key;
            }
        }

        return null;
    }

    // ========== 게임 플레이 화면 ==========

    /**
     * 게임 UI 렌더링 (상단 바)
     *
     * @param {GameState} gameState - 게임 상태
     */
    drawGameUI(gameState) {
        if (!gameState) return;

        // 배경색 (난이도별)
        if (gameState.difficulty) {
            background(gameState.difficulty.color.bg);
        }

        // 상단 UI 바
        this._drawTopBar(gameState);

        // 헬퍼 메시지 표시 (상단 중앙)
        if (this.helperMessage && millis() < this.helperMessageEndTime) {
            this._drawHelperMessage(this.helperMessage);
        }

        // 메시지 표시 (중앙, 애니메이션 적용)
        if (this.currentMessage) {
            this._updateMessageAnimation();
            if (millis() < this.messageEndTime) {
                this._drawAnimatedMessage(this.currentMessage);
            } else if (this.messageQueue.length > 0) {
                // 큐에 다음 메시지가 있으면 표시
                const nextMsg = this.messageQueue.shift();
                this.showMessage(nextMsg.text, nextMsg.duration, nextMsg.type);
            }
        }
    }

    /**
     * 상단 UI 바 (네온 스타일)
     *
     * @private
     * @param {GameState} gameState
     */
    _drawTopBar(gameState) {
        push();

        // 반투명 다크 배경
        fill(10, 10, 15, 230);
        noStroke();
        rect(0, 0, width, 140, 0, 0, 20, 20);

        // 네온 하단 라인
        strokeWeight(2);
        stroke(this.style.neonCyan);
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = this.style.neonCyan;
        line(20, 138, width - 20, 138);

        textAlign(LEFT, TOP);
        textSize(24);
        textStyle(BOLD);

        const padding = 30;
        const lineHeight = 40;

        // 타이머
        const minutes = floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        const timeStr = `${nf(minutes, 2)}:${nf(seconds, 2)}`;

        drawingContext.shadowBlur = 15;
        // 시간 색상 (10초 이하면 네온 핑크 + 깜빡임)
        if (gameState.timeRemaining <= 10) {
            if (frameCount % 30 < 15) {
                drawingContext.shadowColor = this.style.neonPink;
                fill(this.style.neonPink);
            } else {
                drawingContext.shadowColor = this.style.neonOrange;
                fill(this.style.neonOrange);
            }
        } else {
            drawingContext.shadowColor = this.style.neonCyan;
            fill(this.style.neonCyan);
        }
        text(`⏱ ${timeStr}`, padding, padding);

        // 점수 (네온 퍼플)
        drawingContext.shadowColor = this.style.neonPurple;
        fill(this.style.neonPurple);
        text(`◆ ${gameState.score}`, padding, padding + lineHeight);

        // 남은 쌍 (네온 그린)
        drawingContext.shadowColor = this.style.neonGreen;
        fill(this.style.neonGreen);
        text(`▣ ${gameState.getRemainingPairs()} PAIRS`,
             width / 2 - 100, padding);

        // 시도 횟수
        fill(this.style.textDim);
        drawingContext.shadowBlur = 5;
        text(`↻ ${gameState.attempts}`,
             width / 2 - 100, padding + lineHeight);

        // 콤보 (오른쪽 상단, 큰 크기)
        if (gameState.combo > 1) {
            textAlign(RIGHT, TOP);
            drawingContext.shadowBlur = 25;
            drawingContext.shadowColor = this.style.neonOrange;
            fill(this.style.neonOrange);
            textSize(36);
            const comboScale = 1 + sin(frameCount * 0.2) * 0.1;
            push();
            translate(width - padding - 100, padding + lineHeight / 2);
            scale(comboScale);
            text(`× ${gameState.combo} COMBO`, 0, 0);
            pop();
        }

        pop();
    }

    // ========== 결과 화면 ==========

    /**
     * 결과 화면 렌더링
     *
     * @param {Object} stats - 게임 결과 통계
     */
    drawResultScreen(stats) {
        if (!stats) return;

        background(this.style.bgLight);

        const centerX = width / 2;
        const isWin = stats.isWin;

        // 결과 메시지
        fill(isWin ? '#4CAF50' : '#F44336');
        textAlign(CENTER, CENTER);
        textSize(this.style.titleSize);
        textStyle(BOLD);
        text(isWin ? '🎉 게임 클리어!' : '⏰ 시간 초과', centerX, 80);

        // 신기록 표시
        if (isWin && stats.difficulty) {
            const isNewRecord = this.highScoreManager.isNewRecord(
                stats.difficulty.name,
                stats.score
            );

            if (isNewRecord) {
                fill('#FFD700'); // 금색
                textSize(36);
                textStyle(BOLD);
                text('✨ 신기록! ✨', centerX, 145);

                // 신기록 저장
                this.highScoreManager.saveScore(
                    stats.difficulty.name,
                    stats.score,
                    stats.elapsedTime,
                    stats.accuracy
                );
            }
        }

        // 통계 표시 (좌측)
        fill(this.style.textDark);
        textSize(28);
        textStyle(NORMAL);
        textAlign(RIGHT, CENTER);

        const leftX = centerX - 50;
        const statsY = 220;
        const lineSpacing = 50;

        text('최종 점수:', leftX, statsY);
        text('소요 시간:', leftX, statsY + lineSpacing);
        text('시도 횟수:', leftX, statsY + lineSpacing * 2);
        text('정확도:', leftX, statsY + lineSpacing * 3);
        text('최고 콤보:', leftX, statsY + lineSpacing * 4);

        // 통계 값 (우측)
        textAlign(LEFT, CENTER);
        textStyle(BOLD);
        const rightX = centerX - 40;

        fill('#1976D2');
        text(`${stats.score}`, rightX, statsY);
        text(this._formatTime(stats.elapsedTime), rightX, statsY + lineSpacing);
        text(`${stats.attempts}`, rightX, statsY + lineSpacing * 2);
        text(`${stats.accuracy}%`, rightX, statsY + lineSpacing * 3);
        text(`${stats.maxCombo}`, rightX, statsY + lineSpacing * 4);

        // 최고 기록 표시
        if (isWin && stats.difficulty) {
            this._drawHighScore(stats.difficulty.name, statsY + lineSpacing * 5 + 30);
        }

        // 다시하기 버튼
        this._drawNeonButton(centerX - 120, 680, 240, 70, '◀ RETRY', 'retry');
    }

    /**
     * 최고 기록 표시
     *
     * @private
     * @param {string} difficultyName - 난이도 이름
     * @param {number} y - Y 좌표
     */
    _drawHighScore(difficultyName, y) {
        const highScore = this.highScoreManager.getHighScore(difficultyName);
        if (!highScore) return;

        const centerX = width / 2;

        push();

        // 구분선
        stroke(200);
        strokeWeight(2);
        line(centerX - 200, y - 10, centerX + 200, y + 10);

        // 제목
        noStroke();
        fill(this.style.textDark);
        textAlign(CENTER, TOP);
        textSize(22);
        textStyle(BOLD);
        text('🏆 최고 기록', centerX, y + 20);

        // 최고 기록 정보
        textSize(18);
        textStyle(NORMAL);
        textAlign(LEFT, TOP);

        fill(100);
        const infoY = y + 55;
        const infoSpacing = 25;

        text(`최고 점수: ${highScore.score}점`, centerX - 150, infoY);
        text(`최단 시간: ${this._formatTime(highScore.time)}`,
             centerX - 150, infoY + infoSpacing);
        text(`최고 정확도: ${highScore.accuracy}%`,
             centerX - 150, infoY + infoSpacing * 2);

        pop();
    }

    /**
     * 결과 화면 클릭 처리
     *
     * @param {number} mx
     * @param {number} my
     * @returns {string|null}
     */
    handleResultClick(mx, my) {
        return this._checkButton(width / 2 - 120, 680, 240, 70, 'retry');
    }

    // ========== 메시지 시스템 ==========

    /**
     * 화면에 메시지 표시 (중앙, 애니메이션)
     *
     * @param {string} message - 메시지 텍스트
     * @param {number} [duration=1500] - 표시 시간(ms)
     * @param {string} [type='info'] - 메시지 타입 ('success', 'error', 'info')
     * @param {boolean} [queue=false] - 큐에 추가할지 여부
     */
    showMessage(message, duration = 1500, type = 'info', queue = false) {
        // 현재 메시지가 있고 큐 옵션이 활성화되어 있으면 큐에 추가
        if (queue && this.currentMessage) {
            this.messageQueue.push({ text: message, duration, type });
            return;
        }

        this.currentMessage = { text: message, type: type };
        this.messageEndTime = millis() + duration;
        this.messageAlpha = 0; // 페이드인 시작
    }

    /**
     * 헬퍼 메시지 표시 (상단 중앙, 힌트 메시지용)
     *
     * @param {string} message - 메시지 텍스트
     * @param {number} [duration=3000] - 표시 시간(ms)
     */
    showHelperMessage(message, duration = 3000) {
        this.helperMessage = message;
        this.helperMessageEndTime = millis() + duration;
    }

    /**
     * 메시지 애니메이션 업데이트
     *
     * @private
     */
    _updateMessageAnimation() {
        if (!this.currentMessage) return;

        const now = millis();
        const timeLeft = this.messageEndTime - now;
        const fadeDuration = 200; // 페이드 효과 시간

        if (timeLeft > fadeDuration) {
            // 페이드 인
            this.messageAlpha = min(this.messageAlpha + 0.15, 1.0);
        } else {
            // 페이드 아웃
            this.messageAlpha = max(timeLeft / fadeDuration, 0);
        }
    }

    /**
     * 애니메이션이 적용된 메시지 그리기
     *
     * @private
     * @param {Object} msg
     */
    _drawAnimatedMessage(msg) {
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3'
        };

        push();

        // 애니메이션: 약간 위로 떠오르는 효과
        const yOffset = (1 - this.messageAlpha) * -20;
        translate(0, yOffset);

        textAlign(CENTER, CENTER);
        textSize(48);
        textStyle(BOLD);

        // 반투명 배경
        const textW = textWidth(msg.text);
        const bgAlpha = 180 * this.messageAlpha;
        fill(0, 0, 0, bgAlpha);
        rect(width / 2 - textW / 2 - 30, height / 2 - 50,
             textW + 60, 100, 15);

        // 테두리 (타입별 색상)
        const borderColor = color(colors[msg.type] || colors.info);
        stroke(red(borderColor), green(borderColor), blue(borderColor),
               255 * this.messageAlpha);
        strokeWeight(3);
        noFill();
        rect(width / 2 - textW / 2 - 30, height / 2 - 50,
             textW + 60, 100, 15);

        // 텍스트
        noStroke();
        fill(255, 255, 255, 255 * this.messageAlpha);
        text(msg.text, width / 2, height / 2);

        pop();
    }

    /**
     * 헬퍼 메시지 그리기 (상단 중앙)
     *
     * @private
     * @param {string} message
     */
    _drawHelperMessage(message) {
        push();

        // 페이드 효과 계산
        const now = millis();
        const timeLeft = this.helperMessageEndTime - now;
        const alpha = min(timeLeft / 500, 1.0); // 마지막 500ms 동안 페이드아웃

        textAlign(CENTER, TOP);
        textSize(20);
        textStyle(NORMAL);

        // 반투명 배경
        const textW = textWidth(message);
        fill(100, 100, 255, 80 * alpha);
        rect(width / 2 - textW / 2 - 15, 170, textW + 30, 35, 8);

        // 텍스트
        fill(50, 50, 150, 255 * alpha);
        text(message, width / 2, 180);

        pop();
    }

    // ========== 공통 UI 요소 ==========

    /**
     * 네온 버튼 그리기
     *
     * @private
     */
    _drawNeonButton(x, y, w, h, label, id) {
        const isHovered = this.hoveredButton === id;

        push();

        // 호버 시 펄스
        const pulseScale = isHovered ? 1 + sin(frameCount * 0.15) * 0.03 : 1;
        translate(x + w / 2, y + h / 2);
        scale(pulseScale);
        translate(-(x + w / 2), -(y + h / 2));

        // 버튼 배경
        fill(this.style.darkCard);
        noStroke();
        rect(x, y, w, h, this.style.buttonRadius);

        // 네온 테두리
        noFill();
        strokeWeight(isHovered ? 4 : 3);
        stroke(this.style.neonCyan);
        drawingContext.shadowBlur = isHovered ? 30 : 15;
        drawingContext.shadowColor = this.style.neonCyan;
        rect(x, y, w, h, this.style.buttonRadius);

        // 텍스트
        noStroke();
        fill(this.style.neonCyan);
        textAlign(CENTER, CENTER);
        textSize(this.style.bodySize + 2);
        textStyle(BOLD);
        drawingContext.shadowBlur = 20;
        text(label, x + w / 2, y + h / 2);

        // 호버 시 내부 글로우
        if (isHovered) {
            fill(0, 240, 255, 30);
            noStroke();
            rect(x + 3, y + 3, w - 6, h - 6, this.style.buttonRadius - 3);
        }

        pop();
    }

    /**
     * 네온 그리드 배경 효과
     *
     * @private
     */
    _drawNeonGrid() {
        push();

        // 그리드 라인
        stroke(0, 240, 255, 30);
        strokeWeight(1);

        const gridSize = 50;
        const offsetX = (frameCount * 0.5) % gridSize;
        const offsetY = (frameCount * 0.5) % gridSize;

        // 수직 라인
        for (let x = -offsetX; x < width + gridSize; x += gridSize) {
            line(x, 0, x, height);
        }

        // 수평 라인
        for (let y = -offsetY; y < height + gridSize; y += gridSize) {
            line(0, y, width, y);
        }

        pop();
    }

    // ========== 유틸리티 ==========

    /**
     * 버튼 호버 업데이트
     *
     * @param {number} mx
     * @param {number} my
     */
    updateHover(mx, my) {
        // 구현 필요: 현재 화면에 따라 버튼 체크
        this.hoveredButton = null;
    }

    /**
     * 버튼 클릭 체크
     *
     * @private
     */
    _checkButton(x, y, w, h, id) {
        if (this._isInRect(mouseX, mouseY, x, y, w, h)) {
            return id;
        }
        return null;
    }

    /**
     * 사각형 내부 판정
     *
     * @private
     */
    _isInRect(mx, my, x, y, w, h) {
        return mx >= x && mx <= x + w &&
               my >= y && my <= y + h;
    }

    /**
     * 시간 포맷
     *
     * @private
     * @param {number} seconds
     * @returns {string}
     */
    _formatTime(seconds) {
        const m = floor(seconds / 60);
        const s = seconds % 60;
        return `${m}분 ${s}초`;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
