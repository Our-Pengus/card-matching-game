/**
 * @fileoverview 통합 설정 관리 시스템
 * @module core/ConfigManager
 * @description Singleton 패턴으로 전역 설정 관리, 환경별 설정 지원
 */

/**
 * ConfigManager 클래스 - Singleton 패턴
 * @class
 */
class ConfigManager {
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        /** @type {string} 현재 환경 (development, production) */
        this.environment = this._detectEnvironment();

        /** @type {Object} 설정 저장소 */
        this._config = this._loadDefaultConfig();

        /** @type {Set<Function>} 설정 변경 감지 콜백 */
        this._watchers = new Set();

        ConfigManager.instance = this;
    }

    /**
     * 현재 환경 감지
     * @private
     * @returns {string} 환경 이름
     */
    _detectEnvironment() {
        // 로컬 개발: localhost 또는 file://
        if (
            window.location.hostname === 'localhost' ||
            window.location.protocol === 'file:'
        ) {
            return 'development';
        }
        return 'production';
    }

    /**
     * 기본 설정 로드
     * @private
     * @returns {Object} 설정 객체
     */
    _loadDefaultConfig() {
        return {
            // 환경 설정
            environment: this.environment,

            // 캔버스 설정
            canvas: {
                width: 1200,
                height: 800,
                backgroundColor: '#FFFFFF',
                parent: 'canvas-container'
            },

            // 카드 설정
            card: {
                width: 110,
                height: 110,
                cornerRadius: 20,
                margin: 18,
                backColor: '#FFB4D1',
                flipDuration: 300,
                matchDelay: 500,
                mismatchDelay: 1000
            },

            // 난이도 설정
            difficulty: {
                EASY: {
                    name: '하',
                    pairs: 4,
                    timeLimit: 180,
                    gridCols: 4,
                    gridRows: 2,
                    pointsPerMatch: 10,
                    timePenalty: 5,
                    previewTime: 5000,
                    hearts: 5,
                    color: {
                        bg: '#E8F5E9',
                        card: '#81C784',
                        text: '#2E7D32'
                    }
                },
                MEDIUM: {
                    name: '중',
                    pairs: 8,
                    timeLimit: 120,
                    gridCols: 4,
                    gridRows: 4,
                    pointsPerMatch: 15,
                    timePenalty: 10,
                    previewTime: 7000,
                    hearts: 10,
                    color: {
                        bg: '#FFF3E0',
                        card: '#FFB74D',
                        text: '#E65100'
                    }
                },
                HARD: {
                    name: '상',
                    pairs: 15,
                    timeLimit: 90,
                    gridCols: 8,
                    gridRows: 4,
                    pointsPerMatch: 20,
                    timePenalty: 15,
                    previewTime: 0,
                    hearts: 20,
                    color: {
                        bg: '#FFEBEE',
                        card: '#E57373',
                        text: '#C62828'
                    }
                }
            },

            // 게임 상태
            gameState: {
                START: 'start',
                DIFFICULTY: 'difficulty',
                PREVIEW: 'preview',
                PLAYING: 'playing',
                RESULT: 'result'
            },

            // 로깅 설정
            logging: {
                enabled: this.environment === 'development',
                level: this.environment === 'development' ? 0 : 2, // DEBUG : WARN
                timestamp: true
            },

            // 사운드 설정
            sound: {
                enabled: true,
                volume: 0.7,
                paths: {
                    click: 'assets/sounds/click.mp3',
                    match: 'assets/sounds/match.mp3',
                    mismatch: 'assets/sounds/mismatch.mp3',
                    complete: 'assets/sounds/complete.mp3'
                }
            },

            // 성능 설정
            performance: {
                maxFPS: 60,
                enableAnimations: true,
                particleCount: 50
            },

            // 디버그 설정
            debug: {
                enabled: this.environment === 'development',
                showHitboxes: false,
                showFPS: false,
                logEvents: false
            }
        };
    }

    /**
     * 설정 값 가져오기 (dot notation 지원)
     * @param {string} path - 설정 경로 (예: 'canvas.width')
     * @param {*} [defaultValue] - 기본값
     * @returns {*} 설정 값
     *
     * @example
     * config.get('canvas.width') // 1200
     * config.get('card.flipDuration', 300) // 300
     */
    get(path, defaultValue) {
        const keys = path.split('.');
        let value = this._config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * 설정 값 설정하기 (dot notation 지원)
     * @param {string} path - 설정 경로
     * @param {*} value - 설정 값
     *
     * @example
     * config.set('sound.enabled', false);
     * config.set('card.flipDuration', 500);
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this._config;

        // 중첩 객체 생성
        for (const key of keys) {
            if (!(key in target)) {
                target[key] = {};
            }
            target = target[key];
        }

        target[lastKey] = value;

        // 변경 감지 알림
        this._notifyWatchers(path, value);
    }

    /**
     * 전체 설정 객체 반환
     * @returns {Object} 설정 객체 (읽기 전용 복사본)
     */
    getAll() {
        return JSON.parse(JSON.stringify(this._config));
    }

    /**
     * 설정 변경 감지 리스너 등록
     * @param {Function} callback - 콜백 함수 (path, value)
     * @returns {Function} 등록 해제 함수
     */
    watch(callback) {
        this._watchers.add(callback);

        // 등록 해제 함수 반환
        return () => {
            this._watchers.delete(callback);
        };
    }

    /**
     * 변경 감지 알림
     * @private
     * @param {string} path - 변경된 경로
     * @param {*} value - 새로운 값
     */
    _notifyWatchers(path, value) {
        this._watchers.forEach(callback => {
            try {
                callback(path, value);
            } catch (error) {
                console.error('[ConfigManager] Error in watcher:', error);
            }
        });
    }

    /**
     * LocalStorage에서 설정 로드
     * @param {string} [key='game-config'] - 저장소 키
     */
    loadFromStorage(key = 'game-config') {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                this._config = { ...this._config, ...parsed };
                return true;
            }
        } catch (error) {
            console.error('[ConfigManager] Failed to load from storage:', error);
        }
        return false;
    }

    /**
     * LocalStorage에 설정 저장
     * @param {string} [key='game-config'] - 저장소 키
     */
    saveToStorage(key = 'game-config') {
        try {
            localStorage.setItem(key, JSON.stringify(this._config));
            return true;
        } catch (error) {
            console.error('[ConfigManager] Failed to save to storage:', error);
            return false;
        }
    }

    /**
     * 설정 초기화
     */
    reset() {
        this._config = this._loadDefaultConfig();
        this._notifyWatchers('*', this._config);
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        // eslint-disable-next-line no-console
        console.group('[ConfigManager] Current Configuration');
        // eslint-disable-next-line no-console
        console.log('Environment:', this.environment);
        // eslint-disable-next-line no-console
        console.log('Config:', this._config);
        // eslint-disable-next-line no-console
        console.log('Watchers:', this._watchers.size);
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
}

// 싱글톤 인스턴스 생성
const config = new ConfigManager();

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, config };
}
