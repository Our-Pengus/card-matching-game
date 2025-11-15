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

        // 부드럽고 귀여운 파스텔 스타일
        this.style = {
            // 폰트
            titleSize: 68,
            headingSize: 48,
            bodySize: 24,
            smallSize: 18,

            // 파스텔 색상
            pastelBlue: '#B4D4FF',
            pastelPink: '#FFB4D1',
            pastelYellow: '#FFF4B7',
            pastelMint: '#B4F8C8',
            pastelLavender: '#E5D4FF',
            pastelPeach: '#FFD4B4',
            pastelCoral: '#FFB4B4',

            // 베이스 색상
            bgPrimary: '#E8F4FF',
            surfaceWhite: '#FFFFFF',
            textPrimary: '#2C3E50',
            textSecondary: '#5A6C7D',
            textLight: '#8696A7',

            // 버튼
            buttonPadding: 20,
            buttonRadius: 24,

            // 그림자 (부드러운 3D)
            shadowSoft: '0 6px 16px rgba(0, 0, 0, 0.1)',
            shadowMedium: '0 8px 24px rgba(0, 0, 0, 0.12)',
            shadowHover: '0 10px 28px rgba(0, 0, 0, 0.15)'
        };

        // 최고 기록 관리자
        this.highScoreManager = new HighScoreManager();
    }

    // ========== 시작 화면 ==========

    /**
     * 시작 화면 렌더링 (부드럽고 귀여운 스타일)
     */
    drawStartScreen() {
        // 밝은 파스텔 배경
        background(this.style.bgPrimary);

        // 부드러운 장식 요소
        this._drawSoftDecorations();

        push();

        // 제목
        textAlign(CENTER, CENTER);
        textSize(this.style.titleSize);
        textStyle(BOLD);

        // 부드러운 그림자
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.15)';
        drawingContext.shadowOffsetY = 4;

        fill(this.style.textPrimary);
        text('가볍고 귀여운 그림', width / 2, height / 3 - 15);
        text('맞추기!', width / 2, height / 3 + 40);

        // 서브타이틀
        drawingContext.shadowBlur = 4;
        drawingContext.shadowOffsetY = 2;
        textSize(this.style.bodySize);
        textStyle(NORMAL);
        fill(this.style.textSecondary);
        text('같은 카드 쌍을 찾아보세요', width / 2, height / 2 + 20);

        pop();

        // 시작 버튼
        const btnX = width / 2 - 120;
        const btnY = height * 2 / 3;
        const btnW = 240;
        const btnH = 70;

        this._drawSoftButton(btnX, btnY, btnW, btnH, '시작하기 ♥', 'start');

        // 부드럽게 떠오르는 힌트 텍스트
        const floatY = sin(frameCount * 0.05) * 5;
        push();
        textSize(16);
        fill(this.style.textLight);
        drawingContext.shadowBlur = 0;
        text('탭하여 시작', width / 2, height * 0.85 + floatY);
        pop();
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
     * 난이도 선택 화면 렌더링 (파스텔 스타일)
     */
    drawDifficultyScreen() {
        // 밝은 파스텔 배경
        background(this.style.bgPrimary);

        // 부드러운 장식
        this._drawSoftDecorations();

        push();

        // 제목
        textAlign(CENTER, CENTER);
        textSize(this.style.headingSize);
        textStyle(BOLD);
        drawingContext.shadowBlur = 6;
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.15)';
        drawingContext.shadowOffsetY = 3;
        fill(this.style.textPrimary);
        text('난이도를 선택하세요', width / 2, 100);

        pop();

        // 난이도 버튼들 - 파스텔 컬러
        const difficulties = [
            { key: 'EASY', y: 200, color: this.style.pastelMint },
            { key: 'MEDIUM', y: 320, color: this.style.pastelYellow },
            { key: 'HARD', y: 440, color: this.style.pastelPeach },
            { key: 'HELL', y: 560, color: this.style.pastelCoral }
        ];

        difficulties.forEach(({ key, y, color }) => {
            const config = DIFFICULTY[key];
            this._drawSoftDifficultyButton(
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
     * 3D 난이도 버튼 그리기 (입체감 강화)
     *
     * @private
     */
    _drawSoftDifficultyButton(x, y, w, h, config, id, pastelColor) {
        const isHovered = this.hoveredButton === id;

        push();

        // Spring bounce 효과
        const bounceOffset = isHovered ? sin(frameCount * 0.3) * 3 : 0;
        const hoverOffset = isHovered ? -10 : 0;
        const hoverScale = isHovered ? 1.03 : 1;
        const pressDepth = isHovered ? 3 : 8;

        translate(x + w / 2, y + h / 2 + hoverOffset + bounceOffset);
        scale(hoverScale);
        translate(-(x + w / 2), -(y + h / 2));

        // Layer 1: 깊은 그림자
        fill(0, 0, 0, 25);
        noStroke();
        rect(x + 6, y + pressDepth + 10, w, h, this.style.buttonRadius);

        // Layer 2: 버튼 베이스 (더 어두운 색)
        const baseColor = color(pastelColor);
        fill(
            red(baseColor) * 0.65,
            green(baseColor) * 0.65,
            blue(baseColor) * 0.65
        );
        rect(x, y + pressDepth, w, h, this.style.buttonRadius);

        // Layer 3: 메인 버튼 (그라데이션)
        const gradient = drawingContext.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, pastelColor);
        const darkerColor = color(pastelColor);
        gradient.addColorStop(1, `rgba(${red(darkerColor) * 0.85}, ${green(darkerColor) * 0.85}, ${blue(darkerColor) * 0.85}, 1)`);

        drawingContext.fillStyle = gradient;
        drawingContext.shadowBlur = isHovered ? 20 : 12;
        drawingContext.shadowColor = pastelColor;
        drawingContext.shadowOffsetY = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(x, y, w, h, this.style.buttonRadius);
        drawingContext.fill();

        // Layer 4: 하이라이트 (상단 빛 반사)
        const highlightGradient = drawingContext.createLinearGradient(x, y, x, y + h / 2);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        drawingContext.fillStyle = highlightGradient;
        drawingContext.shadowBlur = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(x + 15, y + 8, w - 30, h / 2.5, this.style.buttonRadius);
        drawingContext.fill();

        // Layer 5: 흰색 외곽선
        noFill();
        stroke(255);
        strokeWeight(7);
        rect(x, y, w, h, this.style.buttonRadius);

        // 난이도 이름
        noStroke();
        fill(this.style.textPrimary);
        textAlign(CENTER, CENTER);
        textSize(42);
        textStyle(BOLD);

        // 텍스트 입체감
        drawingContext.shadowBlur = 4;
        drawingContext.shadowColor = 'rgba(255, 255, 255, 0.9)';
        drawingContext.shadowOffsetX = 1;
        drawingContext.shadowOffsetY = 1;
        text(config.name, x + w / 2, y + h / 2 - 18);

        // 상세 정보
        textSize(19);
        textStyle(NORMAL);
        fill(this.style.textSecondary);
        drawingContext.shadowBlur = 2;
        drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
        text(`${config.pairs}쌍  •  ${config.timeLimit}초  •  ${config.pointsPerMatch}점`,
             x + w / 2, y + h / 2 + 24);

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
     * 상단 UI 바 (부드러운 파스텔 스타일)
     *
     * @private
     * @param {GameState} gameState
     */
    _drawTopBar(gameState) {
        push();

        // 밝은 반투명 배경
        fill(255, 255, 255, 245);
        noStroke();
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.1)';
        drawingContext.shadowOffsetY = 4;
        rect(0, 0, width, 130, 0, 0, 24, 24);

        textAlign(LEFT, TOP);
        textSize(22);
        textStyle(BOLD);

        const padding = 30;
        const lineHeight = 38;

        // 타이머
        const minutes = floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        const timeStr = `${nf(minutes, 2)}:${nf(seconds, 2)}`;

        drawingContext.shadowBlur = 2;
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.1)';
        drawingContext.shadowOffsetY = 1;

        // 시간 색상 (10초 이하면 코랄 + 깜빡임)
        if (gameState.timeRemaining <= 10 && frameCount % 30 < 15) {
            fill(this.style.pastelCoral);
        } else {
            fill(this.style.textPrimary);
        }
        text(`⏱ ${timeStr}`, padding, padding);

        // 점수 (파스텔 핑크)
        fill(this.style.textPrimary);
        text(`♥ ${gameState.score}점`, padding, padding + lineHeight);

        // 남은 쌍
        fill(this.style.textSecondary);
        text(`남은 쌍: ${gameState.getRemainingPairs()}`,
             width / 2 - 80, padding);

        // 시도 횟수
        text(`시도: ${gameState.attempts}`,
             width / 2 - 80, padding + lineHeight);

        // 콤보 (오른쪽 상단, 큰 크기)
        if (gameState.combo > 1) {
            textAlign(RIGHT, TOP);
            fill(this.style.pastelPink);
            textSize(32);
            const comboScale = 1 + sin(frameCount * 0.15) * 0.08;
            push();
            translate(width - padding - 80, padding + lineHeight / 2);
            scale(comboScale);
            text(`${gameState.combo} COMBO! 🎉`, 0, 0);
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
     * 3D 입체 버튼 그리기 (Toy-like design)
     *
     * @private
     */
    _drawSoftButton(x, y, w, h, label, id) {
        const isHovered = this.hoveredButton === id;

        push();

        // Spring bounce 시뮬레이션
        const bounceOffset = isHovered ? sin(frameCount * 0.3) * 2 : 0;
        const hoverOffset = isHovered ? -8 : 0;
        const hoverScale = isHovered ? 1.05 : 1;
        const pressDepth = isHovered ? 2 : 6; // 눌린 느낌

        translate(x + w / 2, y + h / 2 + hoverOffset + bounceOffset);
        scale(hoverScale);
        translate(-(x + w / 2), -(y + h / 2));

        // Layer 1: 깊은 그림자 (3D depth)
        fill(0, 0, 0, 30);
        noStroke();
        rect(x + 4, y + pressDepth + 8, w, h, this.style.buttonRadius);

        // Layer 2: 버튼 베이스 (더 어두운 색상)
        const baseColor = color(this.style.pastelBlue);
        fill(
            red(baseColor) * 0.7,
            green(baseColor) * 0.7,
            blue(baseColor) * 0.7
        );
        rect(x, y + pressDepth, w, h, this.style.buttonRadius);

        // Layer 3: 메인 버튼 (그라데이션 효과)
        const gradient = drawingContext.createLinearGradient(
            x, y, x, y + h
        );
        gradient.addColorStop(0, this.style.pastelBlue);
        gradient.addColorStop(1, '#A0C4FF');
        drawingContext.fillStyle = gradient;
        drawingContext.shadowBlur = isHovered ? 16 : 10;
        drawingContext.shadowColor = 'rgba(180, 212, 255, 0.6)';
        drawingContext.shadowOffsetY = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(x, y, w, h, this.style.buttonRadius);
        drawingContext.fill();

        // Layer 4: 하이라이트 (빛 반사)
        const highlightGradient = drawingContext.createLinearGradient(
            x, y, x, y + h / 2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        drawingContext.fillStyle = highlightGradient;
        drawingContext.shadowBlur = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(x + 10, y + 5, w - 20, h / 3, this.style.buttonRadius);
        drawingContext.fill();

        // Layer 5: 흰색 외곽선 (스티커 느낌)
        noFill();
        stroke(255);
        strokeWeight(6);
        drawingContext.shadowBlur = 0;
        rect(x, y, w, h, this.style.buttonRadius);

        // 텍스트
        noStroke();
        fill(this.style.textPrimary);
        textAlign(CENTER, CENTER);
        textSize(this.style.bodySize + 2);
        textStyle(BOLD);

        // 텍스트 그림자
        drawingContext.shadowBlur = 3;
        drawingContext.shadowColor = 'rgba(255, 255, 255, 0.8)';
        drawingContext.shadowOffsetX = 1;
        drawingContext.shadowOffsetY = 1;
        text(label, x + w / 2, y + h / 2);

        pop();
    }

    /**
     * 유기적 장식 요소 그리기 (별, 하트, 구름)
     *
     * @private
     */
    _drawSoftDecorations() {
        push();

        // 떠다니는 다양한 shape들
        const decorations = [
            { x: width * 0.1, y: height * 0.2, type: 'heart', size: 40, color: this.style.pastelPink, rotation: 0.02 },
            { x: width * 0.9, y: height * 0.3, type: 'star', size: 50, color: this.style.pastelYellow, rotation: 0.03 },
            { x: width * 0.15, y: height * 0.8, type: 'cloud', size: 60, color: this.style.pastelMint, rotation: 0.015 },
            { x: width * 0.85, y: height * 0.7, type: 'star', size: 45, color: this.style.pastelLavender, rotation: -0.025 },
            { x: width * 0.5, y: height * 0.15, type: 'heart', size: 35, color: this.style.pastelPeach, rotation: 0.018 }
        ];

        decorations.forEach((deco, index) => {
            const floatY = sin((frameCount + index * 30) * 0.03) * 15;
            const floatX = cos((frameCount + index * 45) * 0.02) * 8;
            const rotation = (frameCount + index * 60) * deco.rotation;
            const pulse = 1 + sin((frameCount + index * 20) * 0.05) * 0.1;

            push();
            translate(deco.x + floatX, deco.y + floatY);
            rotate(rotation);
            scale(pulse);

            // 3D 그림자
            fill(0, 0, 0, 20);
            noStroke();
            this._drawShape(deco.type, 3, 3, deco.size);

            // 메인 shape
            const shapeColor = color(deco.color);
            const gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, deco.size / 2);
            gradient.addColorStop(0, deco.color);
            gradient.addColorStop(1, `rgba(${red(shapeColor)}, ${green(shapeColor)}, ${blue(shapeColor)}, 0.7)`);

            drawingContext.fillStyle = gradient;
            drawingContext.shadowBlur = 12;
            drawingContext.shadowColor = deco.color;
            this._drawShape(deco.type, 0, 0, deco.size);

            // 하이라이트
            fill(255, 255, 255, 150);
            drawingContext.shadowBlur = 0;
            this._drawShape(deco.type, -deco.size * 0.15, -deco.size * 0.15, deco.size * 0.4);

            pop();
        });

        pop();
    }

    /**
     * Shape 그리기 헬퍼
     *
     * @private
     */
    _drawShape(type, offsetX, offsetY, size) {
        push();
        translate(offsetX, offsetY);

        if (type === 'heart') {
            // 하트 그리기
            beginShape();
            for (let a = 0; a < TWO_PI; a += 0.1) {
                const r = size * 0.4 * (1 - sin(a));
                const x = r * cos(a);
                const y = r * sin(a) - size * 0.2;
                vertex(x, y);
            }
            endShape(CLOSE);
        } else if (type === 'star') {
            // 별 그리기 (5각별)
            beginShape();
            for (let i = 0; i < 10; i++) {
                const angle = (TWO_PI / 10) * i - HALF_PI;
                const r = (i % 2 === 0) ? size * 0.5 : size * 0.2;
                const x = cos(angle) * r;
                const y = sin(angle) * r;
                vertex(x, y);
            }
            endShape(CLOSE);
        } else if (type === 'cloud') {
            // 구름 그리기 (3개의 원)
            ellipse(-size * 0.25, 0, size * 0.6, size * 0.6);
            ellipse(size * 0.25, 0, size * 0.6, size * 0.6);
            ellipse(0, -size * 0.15, size * 0.7, size * 0.7);
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
