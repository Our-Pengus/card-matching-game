/**
 * @fileoverview 엔딩 크레딧 렌더링
 * @module rendering/screens/EndingCredits
 * @description 게임 클리어 시 화면 우측에 표시되는 엔딩 크레딧
 */

class EndingCredits {
    constructor() {
        this.element = null;
        this.toggleBtn = null;
        this.overlay = null;
        this.isOpen = false;
        this.initialized = false;
    }

    /**
     * 엔딩 크레딧 초기화 (토글 버튼과 패널 생성)
     */
    init() {
        if (this.initialized) return;

        // 오버레이 배경 생성
        this._createOverlay();

        // 토글 버튼 생성
        this._createToggleButton();

        // 크레딧 패널 생성 (숨김 상태)
        this._createCreditsPanel();

        this.initialized = true;
        console.log('Ending credits initialized');
    }

    /**
     * 오버레이 배경 생성
     * @private
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'credits-overlay';
        this.overlay.addEventListener('click', () => this.close());
        document.body.appendChild(this.overlay);
    }

    /**
     * 토글 버튼 생성
     * @private
     */
    _createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'credits-toggle-btn';
        this.toggleBtn.innerHTML = '<span>CREDITS</span>';
        this.toggleBtn.style.display = 'none'; // 초기에는 숨김
        this.toggleBtn.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.toggleBtn);
    }

    /**
     * 크레딧 패널 생성
     * @private
     */
    _createCreditsPanel() {
        this.element = document.createElement('div');
        this.element.id = 'ending-credits';
        this.element.innerHTML = this._generateHTML();

        // 닫기 버튼 이벤트
        const closeBtn = this.element.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        document.body.appendChild(this.element);
    }

    /**
     * 토글 (열기/닫기)
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 엔딩 크레딧 열기
     */
    open() {
        if (!this.initialized) this.init();

        this.overlay.classList.add('visible');
        this.element.classList.add('visible');
        this.isOpen = true;

        console.log('Ending credits opened');
    }

    /**
     * 엔딩 크레딧 닫기
     */
    close() {
        this.overlay.classList.remove('visible');
        this.element.classList.remove('visible');
        this.isOpen = false;

        console.log('Ending credits closed');
    }

    /**
     * 엔딩 크레딧 표시 (결과 화면 진입 시 호출)
     */
    show() {
        if (!this.initialized) this.init();

        // 토글 버튼 보이기
        if (this.toggleBtn) {
            this.toggleBtn.style.display = 'flex';
        }
    }

    /**
     * 엔딩 크레딧 숨기기 (결과 화면 이탈 시 호출)
     */
    hide() {
        if (this.initialized) {
            this.close();

            // 토글 버튼 숨기기
            if (this.toggleBtn) {
                this.toggleBtn.style.display = 'none';
            }
        }
    }

    /**
     * 완전히 제거
     */
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.toggleBtn) {
            this.toggleBtn.remove();
            this.toggleBtn = null;
        }
        this.isOpen = false;
        this.initialized = false;
    }

    /**
     * 표시 상태 확인
     * @returns {boolean}
     */
    isVisible() {
        return this.visible;
    }

    /**
     * 크레딧 HTML 생성
     * @returns {string}
     * @private
     */
    _generateHTML() {
        return `
            <button class="close-btn" aria-label="닫기">✕</button>
            <h2>메모리 카드 게임</h2>
            <p class="subtitle">숭실대학교 디지털미디어학과</p>

            <!-- 제작진 -->
            <div class="section">
                <div class="section-title">제작</div>
                <div class="team-members">
                    <span class="team-member">윤현준</span>
                    <span class="team-member">방채민</span>
                    <span class="team-member">손아영</span>
                </div>
            </div>

            <!-- AI 사용 안내 -->
            <div class="ai-notice">
                <div class="ai-badge">🤖 AI 활용 안내</div>
                <div class="section-content">
                    본 프로젝트는 AI 도구를 활용하여 제작되었습니다.
                    <br><br>
                    <strong>AI 코드 생성 비율:</strong> 약 70%<br>
                    <strong>사용 도구:</strong> Claude Code, Cursor, Google Gemini
                </div>
            </div>

            <!-- 사용 기술 -->
            <div class="section">
                <div class="section-title">사용 기술</div>
                <div class="tech-list">
                    <span class="tech-tag">JavaScript (ES6+)</span>
                    <span class="tech-tag">p5.js 1.7.0</span>
                    <span class="tech-tag">HTML5</span>
                    <span class="tech-tag">CSS3</span>
                </div>
            </div>

            <!-- p5.js 기능 -->
            <div class="section">
                <div class="section-title">p5.js 기능</div>
                <ul class="feature-list">
                    <li>Canvas: createCanvas</li>
                    <li>그리기: background, fill, stroke, rect, ellipse</li>
                    <li>텍스트: textFont, textAlign, textSize, text</li>
                    <li>변환: push, pop, translate, scale</li>
                    <li>이벤트: mouseClicked, mouseMoved, keyPressed</li>
                    <li>입력: mouseX, mouseY, keyIsPressed</li>
                </ul>
            </div>

            <!-- JavaScript 기능 -->
            <div class="section">
                <div class="section-title">JavaScript 문법</div>
                <ul class="feature-list">
                    <li>ES6 클래스 (class, constructor)</li>
                    <li>화살표 함수 (=>)</li>
                    <li>템플릿 리터럴 (\`\${}\`)</li>
                    <li>구조 분해 할당 (destructuring)</li>
                    <li>spread 연산자 (...)</li>
                    <li>Array 메서드 (forEach, filter, find, map)</li>
                    <li>EventEmitter 패턴</li>
                    <li>setTimeout, setInterval</li>
                    <li>Web Audio API</li>
                </ul>
            </div>
        `;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndingCredits;
}
