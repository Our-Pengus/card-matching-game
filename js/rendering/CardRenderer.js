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

        // 네온 아케이드 스타일
        this.style = {
            // 네온 색상
            neonPink: '#FF10F0',
            neonCyan: '#00F0FF',
            neonPurple: '#B026FF',
            neonGreen: '#39FF14',

            // 다크 베이스
            darkCard: '#16213e',
            darkBack: '#0f3460',

            // 카드 뒷면
            backPattern: 'circuit', // 'circuit', 'grid', 'diagonal'

            // 매칭 완료
            matchedOpacity: 0.5,

            // 호버 효과
            hoverScale: 1.12,
            hoverElevation: 12,
            hoverSpeed: 0.15,

            // 글로우 강도
            glowStrength: 15
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
     * 카드 앞면 그리기 (네온 스타일)
     *
     * @private
     * @param {Card} card
     */
    _drawFrontFace(card) {
        rectMode(CENTER);

        push();

        // 카드 배경색 (다크)
        fill(this.style.darkCard);
        noStroke();
        rect(0, 0,
             this.config.width,
             this.config.height,
             this.config.cornerRadius);

        // 네온 테두리
        const cardColor = this.cardColors[card.id % this.cardColors.length];
        noFill();
        strokeWeight(3);
        stroke(cardColor);

        if (card.isMatched) {
            // 매칭 완료 시 네온 그린 글로우
            drawingContext.shadowBlur = 25;
            drawingContext.shadowColor = this.style.neonGreen;
            stroke(this.style.neonGreen);
        } else {
            drawingContext.shadowBlur = this.style.glowStrength;
            drawingContext.shadowColor = cardColor;
        }

        rect(0, 0,
             this.config.width,
             this.config.height,
             this.config.cornerRadius);

        // 카드 이모지 표시
        const emoji = this.cardEmojis[card.id % this.cardEmojis.length];
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.config.width * 0.5);

        // 이모지 주변 글로우
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = cardColor;
        text(emoji, 0, 0);

        // 매칭 완료 시 오버레이
        if (card.isMatched) {
            fill(57, 255, 20, 30); // 네온 그린 오버레이
            noStroke();
            rect(0, 0,
                 this.config.width - 6,
                 this.config.height - 6,
                 this.config.cornerRadius);
        }

        pop();
    }

    /**
     * 카드 뒷면 그리기 (네온 스타일)
     *
     * @private
     * @param {Card} card
     */
    _drawBackFace(card) {
        rectMode(CENTER);

        push();

        // 다크 배경
        fill(this.style.darkBack);
        noStroke();
        rect(0, 0,
             this.config.width,
             this.config.height,
             this.config.cornerRadius);

        // 네온 시안 테두리
        noFill();
        strokeWeight(2);
        stroke(this.style.neonCyan);
        drawingContext.shadowBlur = 12;
        drawingContext.shadowColor = this.style.neonCyan;
        rect(0, 0,
             this.config.width,
             this.config.height,
             this.config.cornerRadius);

        // 회로 기판 패턴
        this._drawBackPattern();

        pop();
    }

    /**
     * 뒷면 패턴 그리기 (회로 기판 네온 스타일)
     *
     * @private
     */
    _drawBackPattern() {
        const w = this.config.width;
        const h = this.config.height;
        const margin = 15;

        push();

        // 회로 기판 패턴
        noFill();
        stroke(this.style.neonCyan);
        strokeWeight(1.5);
        drawingContext.shadowBlur = 5;
        drawingContext.shadowColor = this.style.neonCyan;

        // 중앙 십자가
        line(0, -h/2 + margin, 0, h/2 - margin);
        line(-w/2 + margin, 0, w/2 - margin, 0);

        // 회로 노드 (작은 원)
        const nodeSize = 4;
        const nodes = [
            [-w/4, -h/4],
            [w/4, -h/4],
            [-w/4, h/4],
            [w/4, h/4]
        ];

        nodes.forEach(([x, y]) => {
            circle(x, y, nodeSize);
        });

        // 연결선
        strokeWeight(1);
        line(-w/4, -h/4, w/4, -h/4);
        line(-w/4, h/4, w/4, h/4);
        line(-w/4, -h/4, -w/4, h/4);
        line(w/4, -h/4, w/4, h/4);

        // 코너 장식
        strokeWeight(2);
        const cornerSize = 12;
        // 좌상단
        line(-w/2 + margin, -h/2 + margin, -w/2 + margin + cornerSize, -h/2 + margin);
        line(-w/2 + margin, -h/2 + margin, -w/2 + margin, -h/2 + margin + cornerSize);
        // 우상단
        line(w/2 - margin, -h/2 + margin, w/2 - margin - cornerSize, -h/2 + margin);
        line(w/2 - margin, -h/2 + margin, w/2 - margin, -h/2 + margin + cornerSize);
        // 좌하단
        line(-w/2 + margin, h/2 - margin, -w/2 + margin + cornerSize, h/2 - margin);
        line(-w/2 + margin, h/2 - margin, -w/2 + margin, h/2 - margin - cornerSize);
        // 우하단
        line(w/2 - margin, h/2 - margin, w/2 - margin - cornerSize, h/2 - margin);
        line(w/2 - margin, h/2 - margin, w/2 - margin, h/2 - margin - cornerSize);

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
                // 네온 펄스 효과 (성공 시)
                const pulseScale = 1 + Math.sin(animState.progress * Math.PI * 3) * 0.2;
                scale(pulseScale);

                // 네온 글로우 증폭
                drawingContext.shadowBlur = 30 + Math.sin(animState.progress * Math.PI * 2) * 20;
                drawingContext.shadowColor = this.style.neonGreen;

                // 밝기 변화
                const brightness = 1 + Math.sin(animState.progress * Math.PI * 2) * 0.3;
                tint(255, 255 * brightness);
                break;

            case 'shake':
                // 흔들림 효과 (실패 시)
                const shakeAmount = 10 * Math.sin(animState.progress * Math.PI * 4);
                translate(shakeAmount, 0);

                // 네온 핑크 글로우 (경고)
                drawingContext.shadowBlur = 25;
                drawingContext.shadowColor = this.style.neonPink;

                // 붉은 색조
                tint(255, 180, 180);
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
