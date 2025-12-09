/**
 * @fileoverview 카드 렌더링 전용 클래스 - 이미지 기반 카드 디자인
 * @module rendering/CardRenderer
 * @description 세로 직사각형 카드 이미지 렌더링
 */

class CardRenderer {
    constructor(config = CARD_CONFIG) {
        this.config = config;
        this.animations = new Map();
        this.hoverAnimations = new Map();

        // 디자인 시스템
        this.colors = {
            back: '#FFB4D1',         // 뒷면 핑크
            border: '#FFFFFF',       // 하얀 테두리
            shadow: 'rgba(0,0,0,0.15)',
            matched: 'rgba(100, 200, 100, 0.3)'
        };

        // 스타일
        this.style = {
            borderRadius: 12,        // 둥근 모서리
            borderWidth: 4,          // 테두리 두께
            shadowOffset: 4,         // 그림자 오프셋
            hoverLift: 8,           // 호버 시 들림
            hoverSpeed: 0.2,        // 호버 애니메이션 속도
            iconScale: 0.4          // 아이콘 크기 비율
        };

        // 카드 이미지 캐시
        this.cardImages = new Map();
        this.hiddenCardImage = null;
        this.bombCardImage = null;
        this.imagesLoaded = false;

        // 이미지 선로드
        this._loadAllCardImages();
        this._loadHiddenCardImage();
        this._loadBombCardImage();
    }

    /**
     * 폭탄 카드 이미지 로드
     * @private
     */
    _loadBombCardImage() {
        loadImage('assets/images/cards/bomb.png', (img) => {
            this.bombCardImage = img;
            console.log('Bomb card image loaded');
        }, (err) => {
            console.warn('Failed to load bomb card image:', err);
        });
    }

    /**
     * 모든 카드 이미지 로드
     * @private
     */
    _loadAllCardImages() {
        if (typeof CARD_IMAGES === 'undefined') {
            console.warn('CARD_IMAGES not defined');
            return;
        }

        let loadedCount = 0;
        const totalImages = CARD_IMAGES.length;

        CARD_IMAGES.forEach((path, index) => {
            loadImage(path, (img) => {
                this.cardImages.set(index, img);
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    console.log(`All ${totalImages} card images loaded`);
                }
            }, (err) => {
                console.warn(`Failed to load card image ${index}:`, path, err);
                loadedCount++;
            });
        });
    }

    /**
     * 히든 카드 이미지 로드
     * @private
     */
    _loadHiddenCardImage() {
        if (typeof HIDDEN_CARD !== 'undefined' && HIDDEN_CARD.enabled) {
            loadImage(HIDDEN_CARD.imagePath, (img) => {
                this.hiddenCardImage = img;
                console.log('Hidden card image loaded');
            }, (err) => {
                console.warn('Failed to load hidden card image:', err);
            });
        }
    }

    // ========================================
    // 메인 렌더링
    // ========================================

    /**
     * 단일 카드 그리기
     */
    drawCard(card, isHovered = false) {
        if (!card) return;

        // 호버 애니메이션 진행도
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

        // 호버 효과 (위로 살짝 들림)
        translate(0, -hoverProgress * this.style.hoverLift);

        // 애니메이션 적용
        const animState = this._getAnimationState(card);
        if (animState) {
            this._applyAnimation(animState, card);
        }

        // 카드 면 그리기
        if (card.isFlipped || card.isMatched) {
            this._drawFrontFace(card);
        } else {
            this._drawBackFace(card, hoverProgress);
        }

        pop();
    }

    /**
     * 모든 카드 그리기
     */
    drawAllCards(cards, hoveredCard = null) {
        if (!cards || cards.length === 0) return;
        cards.forEach(card => {
            const isHovered = card === hoveredCard;
            this.drawCard(card, isHovered);
        });
    }

    // ========================================
    // 카드 앞면/뒷면
    // ========================================

    /**
     * 카드 앞면 (이미지 표시)
     */
    _drawFrontFace(card) {
        // 히든 카드인 경우 별도 렌더링
        if (card.isHiddenCard) {
            this._drawHiddenCardFace(card);
            return;
        }

        // 폭탄 카드인 경우 별도 렌더링
        if (card.isBombCard) {
            this._drawBombCardFace(card);
            return;
        }

        rectMode(CENTER);
        imageMode(CENTER);

        // 그림자
        this._drawCardShadow();

        // 카드 이미지 가져오기 (인덱스 기반)
        const cardImage = this.cardImages.get(card.id % this.cardImages.size);

        if (cardImage) {
            // 이미지를 카드 크기에 맞게 그리기
            image(cardImage, 0, 0, this.config.width, this.config.height);
        } else {
            // 이미지 로드 전 대체 표시
            fill('#E0E0E0');
            stroke(this.colors.border);
            strokeWeight(this.style.borderWidth);
            rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

            // 로딩 표시
            fill(150);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(14);
            text('Loading...', 0, 0);
        }

        // 매칭 완료 시 오버레이
        if (card.isMatched) {
            fill(this.colors.matched);
            noStroke();
            rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

            // 체크 마크
            fill(255, 255, 255);
            textSize(this.config.width * 0.3);
            textAlign(CENTER, CENTER);
            text('✓', 0, 0);
        }
    }

    /**
     * 폭탄 카드 앞면 렌더링
     * @private
     */
    _drawBombCardFace(card) {
        rectMode(CENTER);
        imageMode(CENTER);

        // 그림자
        this._drawCardShadow();

        // 카드 배경 (빨간색 계열)
        fill('#FF4444');
        stroke('#FF0000');
        strokeWeight(this.style.borderWidth + 2);
        rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

        // 폭탄 카드 이미지
        if (this.bombCardImage) {
            // 이미지를 카드 크기에 맞게 그리기
            image(this.bombCardImage, 0, 0, this.config.width, this.config.height);
        } else {
            // 이미지 로드 전 대체 아이콘
            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(this.config.width * this.style.iconScale);
            text('💣', 0, 0);
        }
    }

    /**
     * 히든 카드 앞면 렌더링
     * @private
     */
    _drawHiddenCardFace(card) {
        rectMode(CENTER);
        imageMode(CENTER);

        // 그림자
        this._drawCardShadow();

        // 카드 배경 (금색 계열)
        fill('#FFD700');
        stroke(this.colors.border);
        strokeWeight(this.style.borderWidth);
        rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

        // 히든 카드 이미지
        if (this.hiddenCardImage) {
            // 이미지를 카드 크기에 맞게 그리기
            const imgSize = this.config.width * 0.8;
            image(this.hiddenCardImage, 0, 0, imgSize, imgSize);
        } else {
            // 이미지 로드 전 대체 아이콘
            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(this.config.width * this.style.iconScale);
            text('👤', 0, 0);
        }

        // 매칭 완료 시 오버레이
        if (card.isMatched) {
            fill(this.colors.matched);
            noStroke();
            rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

            // 체크 마크
            fill(255, 255, 255);
            textSize(this.config.width * 0.3);
            textAlign(CENTER, CENTER);
            text('✓', 0, 0);
        }
    }

    /**
     * 카드 뒷면 (핑크색)
     */
    _drawBackFace(card, hoverProgress = 0) {
        rectMode(CENTER);

        // 그림자 (호버 시 더 크게)
        this._drawCardShadow(hoverProgress);

        // 카드 배경 (핑크) - 폭탄 카드도 동일하게 표시
        fill(this.colors.back);
        stroke(this.colors.border);
        strokeWeight(this.style.borderWidth);
        rect(0, 0, this.config.width, this.config.height, this.style.borderRadius);

        // 하이라이트 (광택 효과)
        fill(255, 255, 255, 120);
        noStroke();
        ellipse(
            0,
            -this.config.height * 0.25,
            this.config.width * 0.6,
            this.config.height * 0.3
        );

        // 패턴 (물음표 또는 하트)
        this._drawCardPattern();
    }

    /**
     * 카드 그림자
     */
    _drawCardShadow(hoverProgress = 0) {
        const shadowY = this.style.shadowOffset + hoverProgress * 4;
        const shadowAlpha = 15 + hoverProgress * 10;

        fill(0, 0, 0, shadowAlpha);
        noStroke();
        rectMode(CENTER);
        rect(
            0,
            shadowY,
            this.config.width,
            this.config.height,
            this.style.borderRadius
        );
    }

    /**
     * 카드 뒷면 패턴
     */
    _drawCardPattern() {
        push();

        // 작은 하트 패턴 (4개)
        fill(255, 255, 255, 100);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20);

        const spacing = this.config.width * 0.25;
        text('♥', -spacing, -spacing);
        text('♥', spacing, -spacing);
        text('♥', -spacing, spacing);
        text('♥', spacing, spacing);

        pop();
    }

    // ========================================
    // 애니메이션
    // ========================================

    /**
     * 뒤집기 애니메이션
     * @param {Card} card - 애니메이션 대상 카드
     * @param {number} duration - 애니메이션 시간 (ms)
     * @param {boolean|null} flipToFront - true: 앞면으로, false: 뒷면으로, null: 현재 상태 반전
     */
    animateFlip(card, duration = 300, flipToFront = null) {
        if (!card) return;

        // flipToFront가 명시되지 않으면 현재 상태 반전
        const targetFlipped = flipToFront !== null ? flipToFront : !card.isFlipped;

        const animState = {
            type: 'flip',
            startTime: millis(),
            duration: duration,
            progress: 0,
            initialFlipped: card.isFlipped,   // 시작 시 상태
            targetFlipped: targetFlipped,     // 목표 상태
            switched: false                    // 중간 전환 플래그
        };

        this.animations.set(card, animState);
        card.setAnimating(true);

        setTimeout(() => {
            this.animations.delete(card);
            card.setAnimating(false);
            // 애니메이션 완료 후 최종 상태 보장
            card.setFlipped(targetFlipped);
        }, duration);
    }

    /**
     * 매칭 성공 애니메이션
     */
    animateMatch(card1, card2) {
        if (!card1 || !card2) return;

        const animState = {
            type: 'bounce',
            startTime: millis(),
            duration: 600,
            progress: 0
        };

        this.animations.set(card1, { ...animState });
        this.animations.set(card2, { ...animState });

        setTimeout(() => {
            this.animations.delete(card1);
            this.animations.delete(card2);
        }, 600);
    }

    /**
     * 매칭 실패 애니메이션
     */
    animateMismatch(card1, card2) {
        if (!card1 || !card2) return;

        const animState = {
            type: 'shake',
            startTime: millis(),
            duration: 400,
            progress: 0
        };

        this.animations.set(card1, { ...animState });
        this.animations.set(card2, { ...animState });

        setTimeout(() => {
            this.animations.delete(card1);
            this.animations.delete(card2);
        }, 400);
    }

    /**
     * 애니메이션 상태 가져오기
     */
    _getAnimationState(card) {
        const state = this.animations.get(card);
        if (!state) return null;

        const elapsed = millis() - state.startTime;
        state.progress = Math.min(elapsed / state.duration, 1.0);

        return state;
    }

    /**
     * 애니메이션 적용
     */
    _applyAnimation(animState, card) {
        switch (animState.type) {
            case 'flip':
                // 3D 회전 효과
                const angle = animState.progress * Math.PI;
                const scaleX = Math.abs(Math.cos(angle));

                // scaleX ≈ 0 순간 (progress ≈ 0.5)에 앞면↔뒷면 전환
                if (animState.progress >= 0.5 && !animState.switched) {
                    card.setFlipped(animState.targetFlipped);
                    animState.switched = true;  // 한 번만 전환
                }

                scale(scaleX, 1);
                break;

            case 'bounce':
                // 통통 튀는 효과 (이징 함수 사용)
                const bounceProgress = animState.progress;
                const bounceScale = 1 + Math.sin(bounceProgress * Math.PI * 3) * 0.15;
                scale(bounceScale);
                break;

            case 'shake':
                // 흔들림 효과
                const shakeIntensity = Math.sin(animState.progress * Math.PI);
                const shakeX = Math.sin(animState.progress * Math.PI * 8) * 10 * shakeIntensity;
                const shakeRotation = Math.sin(animState.progress * Math.PI * 6) * 0.1 * shakeIntensity;
                translate(shakeX, 0);
                rotate(shakeRotation);
                break;

            case 'pulse':
                // 맥동 효과
                const pulseScale = 1 + Math.sin(animState.progress * Math.PI * 2) * 0.08;
                scale(pulseScale);
                break;
        }
    }

    // ========================================
    // 디버그
    // ========================================

    /**
     * 디버그 박스 그리기
     */
    drawDebugBox(card) {
        push();
        noFill();
        stroke(255, 0, 0);
        strokeWeight(2);
        rectMode(CORNER);
        rect(card.x, card.y, this.config.width, this.config.height);

        // 카드 ID 표시
        fill(255, 0, 0);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(12);
        text(`ID: ${card.id}`, card.x + 5, card.y + 5);

        pop();
    }

    /**
     * 모든 카드 디버그 박스
     */
    drawAllDebugBoxes(cards) {
        cards.forEach(card => this.drawDebugBox(card));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardRenderer;
}
