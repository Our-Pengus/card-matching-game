/**
 * @fileoverview 이벤트 발행/구독 시스템 (Observer 패턴)
 * @module utils/EventEmitter
 * @description 콜백 함수 대신 이벤트 기반 통신으로 결합도 감소
 */

/**
 * EventEmitter 클래스 - Observer 패턴 구현
 * @class
 * @example
 * const emitter = new EventEmitter();
 * emitter.on('match', (card1, card2) => console.log('Match!'));
 * emitter.emit('match', card1, card2);
 */
class EventEmitter {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._events = new Map();

        /** @type {boolean} 디버그 모드 */
        this._debug = false;

        /** @type {Map<string, number>} 이벤트 발생 통계 */
        this._stats = new Map();
    }

    /**
     * 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 콜백 함수
     * @returns {EventEmitter} 체이닝을 위한 this 반환
     * @throws {TypeError} callback이 함수가 아닐 경우
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(`Callback must be a function, got ${typeof callback}`);
        }

        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }

        this._events.get(event).add(callback);

        if (this._debug) {
            console.log(`[EventEmitter] Listener registered: ${event}`);
        }

        return this;
    }

    /**
     * 한 번만 실행되는 이벤트 리스너 등록
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 콜백 함수
     * @returns {EventEmitter} 체이닝을 위한 this 반환
     */
    once(event, callback) {
        const wrapper = (...args) => {
            callback.apply(this, args);
            this.off(event, wrapper);
        };

        return this.on(event, wrapper);
    }

    /**
     * 이벤트 리스너 제거
     * @param {string} event - 이벤트 이름
     * @param {Function} callback - 제거할 콜백 함수
     * @returns {EventEmitter} 체이닝을 위한 this 반환
     */
    off(event, callback) {
        const listeners = this._events.get(event);

        if (listeners) {
            listeners.delete(callback);

            if (listeners.size === 0) {
                this._events.delete(event);
            }
        }

        return this;
    }

    /**
     * 특정 이벤트의 모든 리스너 제거
     * @param {string} event - 이벤트 이름
     * @returns {EventEmitter} 체이닝을 위한 this 반환
     */
    removeAllListeners(event) {
        if (event) {
            this._events.delete(event);
        } else {
            this._events.clear();
        }

        return this;
    }

    /**
     * 이벤트 발생
     * @param {string} event - 이벤트 이름
     * @param {...*} args - 콜백에 전달할 인자들
     * @returns {boolean} 리스너가 실행되었는지 여부
     */
    emit(event, ...args) {
        const listeners = this._events.get(event);

        if (!listeners || listeners.size === 0) {
            if (this._debug) {
                console.warn(`[EventEmitter] No listeners for event: ${event}`);
            }
            return false;
        }

        // 통계 업데이트
        this._stats.set(event, (this._stats.get(event) || 0) + 1);

        // 모든 리스너 실행 (에러 격리)
        listeners.forEach(callback => {
            try {
                callback.apply(this, args);
            } catch (error) {
                console.error(`[EventEmitter] Error in listener for '${event}':`, error);
                // 에러가 발생해도 다른 리스너는 계속 실행
            }
        });

        if (this._debug) {
            console.log(`[EventEmitter] Emitted: ${event}`, args);
        }

        return true;
    }

    /**
     * 특정 이벤트의 리스너 개수 반환
     * @param {string} event - 이벤트 이름
     * @returns {number} 리스너 개수
     */
    listenerCount(event) {
        const listeners = this._events.get(event);
        return listeners ? listeners.size : 0;
    }

    /**
     * 등록된 모든 이벤트 이름 반환
     * @returns {string[]} 이벤트 이름 배열
     */
    eventNames() {
        return Array.from(this._events.keys());
    }

    /**
     * 디버그 모드 토글
     * @param {boolean} enabled - 활성화 여부
     */
    setDebug(enabled) {
        this._debug = enabled;
    }

    /**
     * 이벤트 통계 반환
     * @returns {Object} 이벤트별 발생 횟수
     */
    getStats() {
        return Object.fromEntries(this._stats);
    }

    /**
     * 통계 초기화
     */
    resetStats() {
        this._stats.clear();
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        console.group('[EventEmitter] Debug Info');
        console.log('Registered events:', this.eventNames());
        this.eventNames().forEach(event => {
            console.log(`  - ${event}: ${this.listenerCount(event)} listeners`);
        });
        console.log('Stats:', this.getStats());
        console.groupEnd();
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventEmitter;
}
