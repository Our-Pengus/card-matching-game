/**
 * @fileoverview 카드 렌더링 전용 클래스
 * @module rendering/CardRenderer
 * @author 윤현준 (렌더링, 애니메이션)
 */

/**
 * 카드 렌더링 담당
 * p5.js를 사용하여 카드를 화면에 그림
 * @class
 */
class CardRenderer {
    /**
     * @param {Object} config - CARD_CONFIG 설정
     */
    constructor(config = CARD_CONFIG) {
        this.config = config;

        // 애니메이션 상태
        this.animations = new Map(); // card -> animation state

        // 호버 애니메이션 상태
        this.hoverAnimations = new Map(); // card -> hover progress

        // 부드럽고 귀여운 파스텔 스타일
        this.style = {
            // 파스텔 색상
            pastelBlue: '#B4D4FF',
            pastelPink: '#FFB4D1',
            pastelYellow: '#FFF4B7',
            pastelMint: '#B4F8C8',
            pastelLavender: '#E5D4FF',
            pastelPeach: '#FFD4B4',

            // 베이스 색상
            surfaceWhite: '#FFFFFF',
            textPrimary: '#2C3E50',

            // 카드 뒷면 색상
            cardBackColor: '#B4D4FF',

            // 매칭 완료
            matchedOpacity: 0.7,
            matchedScale: 0.95,

            // 호버 효과
            hoverScale: 1.08,
            hoverElevation: 10,
            hoverSpeed: 0.15,

            // 보더 라디우스
            borderRadius: 24
        };

        // 카드 이모지 (임시 이미지)
        this.cardEmojis = ['🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓', '🍒',
                           '🍑', '🥝', '🥥', '🥭', '🍍', '🍈', '🥑'];

        // 카드 색상 팔레트
        this.cardColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6',
            '#EC7063', '#AF7AC5', '#5DADE2', '#58D68D', '#F4D03F'
        ];
    }

    // ========== 메인 렌더링 ==========

    /**
     * 카드 한 장 렌더링
     *
     * @param {Card} card - 렌더링할 카드
     * @param {boolean} [isHovered=false] - 호버 상태
     */
    drawCard(card, isHovered = false) {
        if (!card) return;

        // 호버 애니메이션 진행도 업데이트
        let hoverProgress = this.hoverAnimations.get(card) || 0;
        if (isHovered && !card.isMatched) {
            hoverProgress = Math.min(hoverProgress + this.style.hoverSpeed, 1.0);
        } else {
            hoverProgress = Math.max(hoverProgress - this.style.hoverSpeed, 0);
        }
        this.hoverAnimations.set(card, hoverProgress);

        push();

        // 카드 중심으로 이동
        translate(
            card.x + this.config.width / 2,
            card.y + this.config.height / 2
        );

        // 호버 그림자 효과
        if (hoverProgress > 0 && !card.isMatched) {
            const elevation = hoverProgress * this.style.hoverElevation;
            push();
            translate(0, elevation / 2);
            fill(0, 0, 0, 30 * hoverProgress);
            noStroke();
            ellipse(0, 0, this.config.width * 0.9, this.config.height * 0.3);
            pop();
        }

        // 호버 스케일 효과 (부드럽게)
        const scaleAmount = 1 + (this.style.hoverScale - 1) * hoverProgress;
        scale(scaleAmount);

        // 호버 Y축 이동 (위로)
        translate(0, -hoverProgress * this.style.hoverElevation);

        // 애니메이션 적용
        const animState = this._getAnimationState(card);
        if (animState) {
            this._applyAnimation(animState, card);
        }

        // 카드 그리기
        if (card.isFlipped) {
            this._drawFrontFace(card);
        } else {
            this._drawBackFace(card);
        }

        pop();
    }

    /**
     * 모든 카드 렌더링
     *
     * @param {Card[]} cards - 카드 배열
     * @param {Card|null} [hoveredCard=null] - 호버 중인 카드
     */
    drawAllCards(cards, hoveredCard = null) {
        if (!cards || cards.length === 0) return;

        cards.forEach(card => {
            const isHovered = card === hoveredCard;
            this.drawCard(card, isHovered);
        });
    }

    // ========== 카드 앞면/뒷면 ==========

    /**
     * 카드 앞면 그리기 (3D Toy 스타일)
     *
     * @private
     * @param {Card} card
     */
    _drawFrontFace(card) {
        rectMode(CENTER);

        push();

        const cardColor = this.cardColors[card.id % this.cardColors.length];
        const cardColorObj = color(cardColor);

        // Layer 1: 깊은 그림자 (3D depth)
        fill(0, 0, 0, 30);
        noStroke();
        rect(3, 7, this.config.width, this.config.height, this.style.borderRadius);

        // Layer 2: 카드 베이스 (약간 어두운 색)
        fill(
            red(cardColorObj) * 0.75,
            green(cardColorObj) * 0.75,
            blue(cardColorObj) * 0.75
        );
        rect(0, 4, this.config.width, this.config.height, this.style.borderRadius);

        // Layer 3: 메인 카드 배경 (그라데이션)
        const gradient = drawingContext.createLinearGradient(
            -this.config.width / 2, -this.config.height / 2,
            this.config.width / 2, this.config.height / 2
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#F5F9FF');

        drawingContext.fillStyle = gradient;
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = cardColor;
        drawingContext.shadowOffsetY = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(
            -this.config.width / 2, -this.config.height / 2,
            this.config.width, this.config.height,
            this.style.borderRadius
        );
        drawingContext.fill();

        // Layer 4: 하이라이트 (상단 빛 반사)
        const highlightGradient = drawingContext.createLinearGradient(
            0, -this.config.height / 2,
            0, 0
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        drawingContext.fillStyle = highlightGradient;
        drawingContext.shadowBlur = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(
            -this.config.width / 2 + 10, -this.config.height / 2 + 8,
            this.config.width - 20, this.config.height / 2.5,
            this.style.borderRadius
        );
        drawingContext.fill();

        // Layer 5: 컬러 테두리 (파스텔)
        noFill();
        strokeWeight(6);
        stroke(cardColor);
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = cardColor;
        rect(0, 0,
             this.config.width - 6,
             this.config.height - 6,
             this.style.borderRadius);

        // Layer 6: 흰색 외곽선
        strokeWeight(3);
        stroke(255);
        drawingContext.shadowBlur = 0;
        rect(0, 0,
             this.config.width - 3,
             this.config.height - 3,
             this.style.borderRadius);

        // 카드 이모지 표시
        const emoji = this.cardEmojis[card.id % this.cardEmojis.length];
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.config.width * 0.5);

        // 이모지 입체감
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = cardColor;
        drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;
        text(emoji, 0, 0);

        // 매칭 완료 시 반짝이는 오버레이
        if (card.isMatched) {
            const sparkle = 1 + sin(frameCount * 0.2) * 0.15;
            fill(180, 248, 200, 100 * sparkle);
            noStroke();
            rect(0, 0,
                 this.config.width - 12,
                 this.config.height - 12,
                 this.style.borderRadius);

            // 별 장식
            push();
            textSize(30);
            fill(255, 255, 255, 200 * sparkle);
            text('✨', -this.config.width / 3, -this.config.height / 3);
            text('✨', this.config.width / 3, this.config.height / 3);
            pop();
        }

        pop();
    }

    /**
     * 카드 뒷면 그리기 (3D Toy 스타일)
     *
     * @private
     * @param {Card} card
     */
    _drawBackFace(card) {
        rectMode(CENTER);

        push();

        // Layer 1: 깊은 그림자
        fill(0, 0, 0, 30);
        noStroke();
        rect(3, 7, this.config.width, this.config.height, this.style.borderRadius);

        // Layer 2: 카드 베이스 (더 어두운 블루)
        const baseColor = color(this.style.cardBackColor);
        fill(
            red(baseColor) * 0.7,
            green(baseColor) * 0.7,
            blue(baseColor) * 0.7
        );
        rect(0, 4, this.config.width, this.config.height, this.style.borderRadius);

        // Layer 3: 메인 카드 배경 (그라데이션)
        const gradient = drawingContext.createLinearGradient(
            -this.config.width / 2, -this.config.height / 2,
            this.config.width / 2, this.config.height / 2
        );
        gradient.addColorStop(0, this.style.cardBackColor);
        gradient.addColorStop(1, '#9AC4FF');

        drawingContext.fillStyle = gradient;
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = this.style.cardBackColor;
        drawingContext.shadowOffsetY = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(
            -this.config.width / 2, -this.config.height / 2,
            this.config.width, this.config.height,
            this.style.borderRadius
        );
        drawingContext.fill();

        // Layer 4: 하이라이트 (상단 빛 반사)
        const highlightGradient = drawingContext.createLinearGradient(
            0, -this.config.height / 2,
            0, 0
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        drawingContext.fillStyle = highlightGradient;
        drawingContext.shadowBlur = 0;

        drawingContext.beginPath();
        drawingContext.roundRect(
            -this.config.width / 2 + 10, -this.config.height / 2 + 8,
            this.config.width - 20, this.config.height / 2.5,
            this.style.borderRadius
        );
        drawingContext.fill();

        // Layer 5: 흰색 외곽선
        noFill();
        strokeWeight(6);
        stroke(255);
        rect(0, 0,
             this.config.width - 6,
             this.config.height - 6,
             this.style.borderRadius);

        // 귀여운 패턴
        this._drawBackPattern();

        pop();
    }

    /**
     * 뒷면 패턴 그리기 (별과 하트 패턴, 입체감)
     *
     * @private
     */
    _drawBackPattern() {
        push();

        const pulse = 1 + sin(frameCount * 0.08) * 0.05;

        // 중앙 회전하는 별
        push();
        rotate(frameCount * 0.02);
        scale(pulse);

        // 별 그림자
        noStroke();
        fill(0, 0, 0, 30);
        textAlign(CENTER, CENTER);
        textSize(this.config.width * 0.35);
        text('⭐', 2, 2);

        // 메인 별
        fill(255, 255, 255, 200);
        drawingContext.shadowBlur = 8;
        drawingContext.shadowColor = 'rgba(255, 255, 255, 0.8)';
        text('⭐', 0, 0);
        pop();

        // 작은 하트들 (회전)
        drawingContext.shadowBlur = 0;
        textSize(this.config.width * 0.15);
        fill(255, 255, 255, 120);
        const positions = [
            { x: -30, y: -30, rotation: frameCount * 0.03 },
            { x: 30, y: -30, rotation: -frameCount * 0.025 },
            { x: -30, y: 30, rotation: -frameCount * 0.02 },
            { x: 30, y: 30, rotation: frameCount * 0.035 }
        ];

        positions.forEach(({ x, y, rotation }) => {
            push();
            translate(x, y);
            rotate(rotation);
            text('♥', 0, 0);
            pop();
        });

        pop();
    }

    // ========== 애니메이션 ==========

    /**
     * 카드 뒤집기 애니메이션 시작
     *
     * @param {Card} card - 애니메이션 대상 카드
     * @param {number} [duration=300] - 애니메이션 지속 시간(ms)
     */
    animateFlip(card, duration = 300) {
        if (!card) return;

        const animState = {
            type: 'flip',
            startTime: millis(),
            duration: duration,
            progress: 0
        };

        this.animations.set(card, animState);
        card.setAnimating(true);

        // 애니메이션 완료 후 정리
        setTimeout(() => {
            this.animations.delete(card);
            card.setAnimating(false);
        }, duration);
    }

    /**
     * 매칭 성공 애니메이션
     *
     * @param {Card} card1
     * @param {Card} card2
     */
    animateMatch(card1, card2) {
        if (!card1 || !card2) return;

        // 반짝임 효과
        const animState = {
            type: 'pulse',
            startTime: millis(),
            duration: 600,
            progress: 0
        };

        this.animations.set(card1, animState);
        this.animations.set(card2, { ...animState });

        setTimeout(() => {
            this.animations.delete(card1);
            this.animations.delete(card2);
        }, 600);
    }

    /**
     * 매칭 실패 애니메이션
     *
     * @param {Card} card1
     * @param {Card} card2
     */
    animateMismatch(card1, card2) {
        if (!card1 || !card2) return;

        // 흔들림 효과
        const animState = {
            type: 'shake',
            startTime: millis(),
            duration: 400,
            progress: 0
        };

        this.animations.set(card1, animState);
        this.animations.set(card2, { ...animState });

        setTimeout(() => {
            this.animations.delete(card1);
            this.animations.delete(card2);
        }, 400);
    }

    /**
     * 애니메이션 상태 가져오기
     *
     * @private
     * @param {Card} card
     * @returns {Object|null}
     */
    _getAnimationState(card) {
        const state = this.animations.get(card);
        if (!state) return null;

        // 진행도 계산
        const elapsed = millis() - state.startTime;
        state.progress = Math.min(elapsed / state.duration, 1.0);

        return state;
    }

    /**
     * 애니메이션 변환 적용
     *
     * @private
     * @param {Object} animState
     * @param {Card} card
     */
    _applyAnimation(animState, card) {
        switch (animState.type) {
            case 'flip':
                // 2D 뒤집기 효과 (scale 사용)
                const angle = animState.progress * Math.PI;
                const scaleX = Math.abs(Math.cos(angle)); // 0 ~ 1 ~ 0으로 변화

                // 가로 축소/확대로 flip 효과
                scale(scaleX, 1);

                // 중간 지점에서 앞면/뒷면 전환
                if (animState.progress > 0.5 && card) {
                    // 카드 상태와 실제 보여지는 면 동기화
                    // (애니메이션만 담당하므로 여기서는 렌더링만)
                }
                break;

            case 'pulse':
                // 부드러운 펄스 효과 (성공 시)
                const pulseScale = 1 + Math.sin(animState.progress * Math.PI * 3) * 0.1;
                scale(pulseScale);

                // 부드러운 그림자
                drawingContext.shadowBlur = 15 + Math.sin(animState.progress * Math.PI * 2) * 10;
                drawingContext.shadowColor = 'rgba(180, 248, 200, 0.5)'; // 파스텔 민트

                // 밝기 변화
                const brightness = 1 + Math.sin(animState.progress * Math.PI * 2) * 0.15;
                tint(255, 255 * brightness);
                break;

            case 'shake':
                // 흔들림 효과 (실패 시)
                const shakeAmount = 8 * Math.sin(animState.progress * Math.PI * 4);
                translate(shakeAmount, 0);

                // 부드러운 핑크 그림자
                drawingContext.shadowBlur = 15;
                drawingContext.shadowColor = 'rgba(255, 180, 209, 0.5)'; // 파스텔 핑크

                // 살짝 붉은 색조
                tint(255, 220, 220);
                break;
        }
    }

    // ========== 디버그 ==========

    /**
     * 카드 히트박스 표시 (디버그용)
     *
     * @param {Card} card
     */
    drawDebugBox(card) {
        push();
        noFill();
        stroke(255, 0, 0);
        strokeWeight(2);
        rectMode(CORNER);
        rect(card.x, card.y, this.config.width, this.config.height);
        pop();
    }

    /**
     * 모든 카드의 히트박스 표시
     *
     * @param {Card[]} cards
     */
    drawAllDebugBoxes(cards) {
        cards.forEach(card => this.drawDebugBox(card));
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardRenderer;
}
