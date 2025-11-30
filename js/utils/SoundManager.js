/**
 * @fileoverview 사운드 관리자 - 효과음 재생 시스템
 * @module utils/SoundManager
 * @author 손아영 (효과음 선택)
 *         윤현준 (재생 시스템 구현)
 */

/**
 * 사운드 관리자 클래스
 * Web Audio API를 사용한 효과음 재생
 */
class SoundManager {
    constructor() {
        // 사운드 활성화 여부
        this.enabled = true;

        // Web Audio API 컨텍스트
        this.audioContext = null;

        // 로드된 사운드 버퍼
        this.sounds = {};

        // 사운드 경로 매핑
        this.soundPaths = {
            click: null,
            match: null,
            mismatch: null,
            complete: null,
            // 히든 카드 전용 효과음
            hidden_click: 'assets/sounds/hidden_click.wav',
            hidden_match: 'assets/sounds/hidden_match.wav'
        };

        // AudioContext 초기화
        this._initAudioContext();

        // 히든 카드 효과음 로드
        this._loadHiddenSounds();
    }

    /**
     * AudioContext 초기화
     * @private
     */
    _initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioContext initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    /**
     * 히든 카드 효과음 로드
     * @private
     */
    async _loadHiddenSounds() {
        if (HIDDEN_CARD && HIDDEN_CARD.enabled) {
            await this.loadSound('hidden_click', this.soundPaths.hidden_click);
            await this.loadSound('hidden_match', this.soundPaths.hidden_match);
        }
    }

    /**
     * 사운드 파일 로드
     * @param {string} name - 사운드 이름
     * @param {string} path - 파일 경로
     * @returns {Promise}
     */
    async loadSound(name, path) {
        if (!this.audioContext || !path) {
            console.warn(`Cannot load sound '${name}': no path provided`);
            return;
        }

        try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.sounds[name] = audioBuffer;
            console.log(`Sound loaded: ${name}`);
        } catch (e) {
            console.warn(`Failed to load sound '${name}':`, e);
        }
    }

    /**
     * 모든 사운드 로드
     * @returns {Promise}
     */
    async loadAllSounds() {
        const promises = [];

        for (const [name, path] of Object.entries(this.soundPaths)) {
            if (path) {
                promises.push(this.loadSound(name, path));
            }
        }

        await Promise.all(promises);
        console.log('All sounds loaded');
    }

    /**
     * 사운드 재생
     * @param {string} name - 사운드 이름
     * @param {number} [volume=1.0] - 볼륨 (0.0 ~ 1.0)
     */
    play(name, volume = 1.0) {
        if (!this.enabled || !this.audioContext) {
            return;
        }

        // AudioContext resume (브라우저 보안 정책)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // 로드된 사운드가 있으면 재생
        if (this.sounds[name]) {
            this._playBuffer(this.sounds[name], volume);
        } else {
            // 사운드 파일이 없으면 임시 효과음 재생
            this._playTempSound(name, volume);
        }
    }

    /**
     * 버퍼 재생
     * @private
     */
    _playBuffer(buffer, volume) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        gainNode.gain.value = Math.max(0, Math.min(1, volume));

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
    }

    /**
     * 임시 효과음 재생 (Web Audio API 합성음)
     * @private
     */
    _playTempSound(name, volume) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = volume * 0.3; // 볼륨 낮춤

        switch (name) {
            case 'click':
                // 클릭: 짧은 틱 소리
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;

            case 'match':
                // 성공: 높은 음 → 더 높은 음
                oscillator.frequency.setValueAtTime(523, now); // C5
                oscillator.frequency.linearRampToValueAtTime(784, now + 0.1); // G5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume * 0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'mismatch':
                // 실패: 낮은 음
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(volume * 0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case 'complete':
                // 클리어: 상승 아르페지오
                const notes = [523, 659, 784, 1047]; // C-E-G-C
                notes.forEach((freq, i) => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.value = freq;
                    osc.type = 'sine';

                    const startTime = now + i * 0.1;
                    gain.gain.setValueAtTime(volume * 0.3, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

                    osc.start(startTime);
                    osc.stop(startTime + 0.15);
                });
                break;

            default:
                // 기본: 중간 음
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
        }
    }

    /**
     * 사운드 토글
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`Sound ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }

    /**
     * 사운드 활성화
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 사운드 비활성화
     */
    disable() {
        this.enabled = false;
    }

    /**
     * 사운드 활성화 여부 확인
     */
    isEnabled() {
        return this.enabled;
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
