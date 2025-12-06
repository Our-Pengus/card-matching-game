/**
 * @fileoverview 파티클 시스템 - 축하 효과 및 이펙트
 * @module rendering/ParticleSystem
 * @author 손아영 (파티클 디자인)
 *         윤현준 (애니메이션 구현)
 */

/**
 * 단일 파티클 클래스
 */
class Particle {
    /**
     * @param {number} x - 시작 x 좌표
     * @param {number} y - 시작 y 좌표
     * @param {Object} options - 파티클 설정
     */
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 10;
        this.vy = options.vy || (Math.random() - 0.5) * 10 - 2;
        this.life = options.life || 1.0;
        this.decay = options.decay || 0.02;
        this.size = options.size || random(4, 12);
        this.color = options.color || color(255, 220, 0);
        this.gravity = options.gravity || 0.3;
        this.shape = options.shape || 'circle'; // 'circle', 'star', 'confetti'
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || random(-0.2, 0.2);
    }

    /**
     * 파티클 업데이트
     */
    update() {
        this.vx *= 0.98; // 공기 저항
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
    }

    /**
     * 파티클 그리기
     */
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);

        const alpha = this.life * 255;

        switch (this.shape) {
            case 'star':
                this._drawStar(this.size, alpha);
                break;

            case 'confetti':
                this._drawConfetti(this.size, alpha);
                break;

            case 'circle':
            default:
                noStroke();
                fill(red(this.color), green(this.color), blue(this.color), alpha);
                ellipse(0, 0, this.size);
                break;
        }

        pop();
    }

    /**
     * 별 그리기
     * @private
     */
    _drawStar(size, alpha) {
        fill(red(this.color), green(this.color), blue(this.color), alpha);
        noStroke();

        beginShape();
        for (let i = 0; i < 5; i++) {
            const angle1 = (i * TWO_PI / 5) - HALF_PI;
            const angle2 = ((i + 0.5) * TWO_PI / 5) - HALF_PI;

            const x1 = cos(angle1) * size;
            const y1 = sin(angle1) * size;
            const x2 = cos(angle2) * size * 0.5;
            const y2 = sin(angle2) * size * 0.5;

            vertex(x1, y1);
            vertex(x2, y2);
        }
        endShape(CLOSE);
    }

    /**
     * 색종이 그리기
     * @private
     */
    _drawConfetti(size, alpha) {
        fill(red(this.color), green(this.color), blue(this.color), alpha);
        noStroke();
        rect(-size / 2, -size / 4, size, size / 2, 2);
    }

    /**
     * 파티클이 살아있는지 확인
     */
    isDead() {
        return this.life <= 0 || this.y > height + 50;
    }
}

/**
 * 파티클 시스템 관리자
 */
class ParticleSystem {
    constructor() {
        this.particles = [];

        // 히든 카드 효과 상태
        this.screenFlash = { active: false, alpha: 0, color: null };
        this.screenShake = { active: false, intensity: 0, duration: 0, startTime: 0 };
        this.cardZoom = { active: false, card: null, scale: 1, startTime: 0 };
    }

    /**
     * 매칭 성공 시 파티클 생성
     *
     * @param {number} x - 중심 x
     * @param {number} y - 중심 y
     */
    createMatchParticles(x, y) {
        const colors = [
            color(255, 220, 0),   // 금색
            color(255, 180, 0),   // 주황
            color(255, 100, 200)  // 분홍
        ];

        // 별 파티클 10개 생성
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * TWO_PI;
            const speed = random(3, 6);
            const particle = new Particle(x, y, {
                vx: cos(angle) * speed,
                vy: sin(angle) * speed,
                size: random(6, 14),
                color: random(colors),
                shape: 'star',
                decay: 0.015,
                gravity: 0.15
            });
            this.particles.push(particle);
        }
    }

    /**
     * 게임 클리어 시 축하 폭죽
     *
     * @param {number} [count=50] - 파티클 개수
     */
    createCelebrationParticles(count = 50) {
        const colors = [
            color(255, 100, 150), // 분홍
            color(100, 200, 255), // 파랑
            color(255, 220, 100), // 금색
            color(150, 255, 150), // 초록
            color(200, 150, 255)  // 보라
        ];

        // 화면 여러 위치에서 폭죽
        const positions = [
            { x: width * 0.25, y: height * 0.3 },
            { x: width * 0.5, y: height * 0.2 },
            { x: width * 0.75, y: height * 0.3 }
        ];

        positions.forEach(pos => {
            for (let i = 0; i < count / 3; i++) {
                const angle = random(TWO_PI);
                const speed = random(5, 12);
                const particle = new Particle(pos.x, pos.y, {
                    vx: cos(angle) * speed,
                    vy: sin(angle) * speed - 5, // 위로 발사
                    size: random(8, 16),
                    color: random(colors),
                    shape: random(['star', 'confetti', 'circle']),
                    decay: random(0.008, 0.015),
                    gravity: 0.25
                });
                this.particles.push(particle);
            }
        });
    }

    /**
     * 지속적인 색종이 효과 (게임 클리어 후)
     */
    createConfettiRain() {
        if (frameCount % 5 === 0) { // 5프레임마다
            const colors = [
                color(255, 100, 150),
                color(100, 200, 255),
                color(255, 220, 100),
                color(150, 255, 150),
                color(200, 150, 255)
            ];

            const particle = new Particle(random(width), -20, {
                vx: random(-1, 1),
                vy: random(1, 3),
                size: random(6, 12),
                color: random(colors),
                shape: 'confetti',
                decay: 0.005,
                gravity: 0.1,
                life: 1.5,
                rotationSpeed: random(-0.3, 0.3)
            });
            this.particles.push(particle);
        }
    }

    /**
     * 모든 파티클 업데이트 및 그리기
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.display();

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 파티클 개수 반환
     */
    getCount() {
        return this.particles.length;
    }

    /**
     * 모든 파티클 제거
     */
    clear() {
        this.particles = [];
    }

    // ========== 히든 카드 특수 효과 ==========

    /**
     * 효과 1: 황금색 화면 플래시
     * @param {number} duration - 지속 시간 (ms)
     */
    triggerGoldenFlash(duration = 500) {
        this.screenFlash = {
            active: true,
            alpha: 200,
            color: color(255, 215, 0), // 골드
            startTime: millis(),
            duration: duration
        };
    }

    /**
     * 효과 2: 히든 카드 위치에서 폭죽 폭발
     * @param {number} x - 중심 x
     * @param {number} y - 중심 y
     */
    triggerHiddenExplosion(x, y) {
        const colors = [
            color(255, 215, 0),   // 골드
            color(255, 180, 0),   // 주황
            color(255, 255, 150), // 밝은 노랑
            color(255, 100, 150), // 핑크
            color(200, 150, 255)  // 보라
        ];

        // 큰 폭발 파티클 30개
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * TWO_PI;
            const speed = random(8, 15);
            const particle = new Particle(x, y, {
                vx: cos(angle) * speed,
                vy: sin(angle) * speed - 3,
                size: random(10, 20),
                color: random(colors),
                shape: random(['star', 'circle']),
                decay: 0.012,
                gravity: 0.2
            });
            this.particles.push(particle);
        }

        // 추가 반짝이 파티클
        for (let i = 0; i < 20; i++) {
            const angle = random(TWO_PI);
            const speed = random(3, 8);
            const particle = new Particle(x, y, {
                vx: cos(angle) * speed,
                vy: sin(angle) * speed,
                size: random(4, 8),
                color: color(255, 255, 200),
                shape: 'circle',
                decay: 0.025,
                gravity: 0.1
            });
            this.particles.push(particle);
        }
    }

    /**
     * 효과 3: 화면 흔들림 (쉐이크)
     * @param {number} intensity - 흔들림 강도
     * @param {number} duration - 지속 시간 (ms)
     */
    triggerScreenShake(intensity = 10, duration = 300) {
        this.screenShake = {
            active: true,
            intensity: intensity,
            duration: duration,
            startTime: millis()
        };
    }

    /**
     * 효과 4: 카드 확대 연출 (중앙에서 확대 후 축소)
     * @param {Card} card - 확대할 카드
     * @param {number} duration - 지속 시간 (ms)
     */
    triggerCardZoom(card, duration = 600) {
        this.cardZoom = {
            active: true,
            card: card,
            scale: 1,
            startTime: millis(),
            duration: duration
        };
    }

    /**
     * 화면 플래시 효과 업데이트 및 렌더링
     */
    updateScreenFlash() {
        if (!this.screenFlash.active) return;

        const elapsed = millis() - this.screenFlash.startTime;
        const progress = elapsed / this.screenFlash.duration;

        if (progress >= 1) {
            this.screenFlash.active = false;
            return;
        }

        // 페이드 아웃 효과
        const alpha = this.screenFlash.alpha * (1 - progress);

        push();
        noStroke();
        fill(red(this.screenFlash.color), green(this.screenFlash.color), blue(this.screenFlash.color), alpha);
        rect(0, 0, width, height);
        pop();
    }

    /**
     * 화면 흔들림 오프셋 계산
     * @returns {{x: number, y: number}}
     */
    getShakeOffset() {
        if (!this.screenShake.active) return { x: 0, y: 0 };

        const elapsed = millis() - this.screenShake.startTime;
        const progress = elapsed / this.screenShake.duration;

        if (progress >= 1) {
            this.screenShake.active = false;
            return { x: 0, y: 0 };
        }

        // 감쇠하는 흔들림
        const dampening = 1 - progress;
        const intensity = this.screenShake.intensity * dampening;

        return {
            x: random(-intensity, intensity),
            y: random(-intensity, intensity)
        };
    }

    /**
     * 카드 확대 효과 스케일 계산
     * @returns {number}
     */
    getCardZoomScale() {
        if (!this.cardZoom.active) return 1;

        const elapsed = millis() - this.cardZoom.startTime;
        const progress = elapsed / this.cardZoom.duration;

        if (progress >= 1) {
            this.cardZoom.active = false;
            return 1;
        }

        // 확대 후 축소 (sin 커브)
        return 1 + sin(progress * PI) * 0.5;
    }

    /**
     * 확대 중인 카드 반환
     * @returns {Card|null}
     */
    getZoomingCard() {
        return this.cardZoom.active ? this.cardZoom.card : null;
    }

    /**
     * 현재 활성화된 효과 확인
     */
    hasActiveEffects() {
        return this.screenFlash.active || this.screenShake.active || this.cardZoom.active;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Particle, ParticleSystem };
}
