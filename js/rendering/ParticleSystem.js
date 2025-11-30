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
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Particle, ParticleSystem };
}
