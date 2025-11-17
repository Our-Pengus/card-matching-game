/**
 * @fileoverview 통합 로깅 시스템
 * @module utils/Logger
 * @description 레벨별 로깅, 에러 트래킹, 프로덕션 환경 대응
 */

/**
 * 로그 레벨 상수
 * @enum {number}
 */
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

/**
 * Logger 클래스 - 중앙 집중식 로깅 시스템
 * @class
 */
class Logger {
    /**
     * @param {Object} config - 설정 객체
     * @param {number} [config.level=LogLevel.INFO] - 최소 로그 레벨
     * @param {boolean} [config.enabled=true] - 로깅 활성화 여부
     * @param {boolean} [config.timestamp=true] - 타임스탬프 표시 여부
     */
    constructor(config = {}) {
        this.level = config.level !== undefined ? config.level : LogLevel.INFO;
        this.enabled = config.enabled !== false;
        this.timestamp = config.timestamp !== false;

        /** @type {Array<Object>} 로그 히스토리 (메모리 제한 있음) */
        this.history = [];
        this.maxHistorySize = config.maxHistorySize || 100;

        /** @type {Map<string, number>} 에러 발생 횟수 */
        this.errorCounts = new Map();
    }

    /**
     * 디버그 로그
     * @param {string} message - 로그 메시지
     * @param {...*} args - 추가 인자들
     */
    debug(message, ...args) {
        this._log(LogLevel.DEBUG, message, args);
    }

    /**
     * 정보 로그
     * @param {string} message - 로그 메시지
     * @param {...*} args - 추가 인자들
     */
    info(message, ...args) {
        this._log(LogLevel.INFO, message, args);
    }

    /**
     * 경고 로그
     * @param {string} message - 로그 메시지
     * @param {...*} args - 추가 인자들
     */
    warn(message, ...args) {
        this._log(LogLevel.WARN, message, args);
    }

    /**
     * 에러 로그
     * @param {string} message - 로그 메시지
     * @param {Error} [error] - 에러 객체
     * @param {...*} args - 추가 인자들
     */
    error(message, error, ...args) {
        // 에러 횟수 추적
        const errorKey = error instanceof Error ? error.message : message;
        this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

        this._log(LogLevel.ERROR, message, [error, ...args]);
    }

    /**
     * 내부 로그 처리 메서드
     * @private
     * @param {number} level - 로그 레벨
     * @param {string} message - 메시지
     * @param {Array} args - 인자들
     */
    _log(level, message, args) {
        if (!this.enabled || level < this.level) {
            return;
        }

        const logEntry = {
            level: this._getLevelName(level),
            message,
            timestamp: this.timestamp ? new Date().toISOString() : null,
            args
        };

        // 히스토리 저장 (메모리 제한)
        this.history.push(logEntry);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // 콘솔 출력
        this._output(level, logEntry);
    }

    /**
     * 콘솔 출력
     * @private
     * @param {number} level - 로그 레벨
     * @param {Object} logEntry - 로그 엔트리
     */
    _output(level, logEntry) {
        const prefix = logEntry.timestamp
            ? `[${logEntry.timestamp}] [${logEntry.level}]`
            : `[${logEntry.level}]`;

        const message = `${prefix} ${logEntry.message}`;

        switch (level) {
            case LogLevel.DEBUG:
                // eslint-disable-next-line no-console
                console.log(message, ...logEntry.args);
                break;
            case LogLevel.INFO:
                // eslint-disable-next-line no-console
                console.log(message, ...logEntry.args);
                break;
            case LogLevel.WARN:
                console.warn(message, ...logEntry.args);
                break;
            case LogLevel.ERROR:
                console.error(message, ...logEntry.args);
                break;
        }
    }

    /**
     * 로그 레벨 이름 반환
     * @private
     * @param {number} level - 로그 레벨
     * @returns {string} 레벨 이름
     */
    _getLevelName(level) {
        const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];
        return names[level] || 'UNKNOWN';
    }

    /**
     * 로그 레벨 설정
     * @param {number} level - 로그 레벨
     */
    setLevel(level) {
        this.level = level;
    }

    /**
     * 로깅 활성화/비활성화
     * @param {boolean} enabled - 활성화 여부
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * 히스토리 반환
     * @param {number} [limit] - 제한 개수
     * @returns {Array<Object>} 로그 히스토리
     */
    getHistory(limit) {
        return limit ? this.history.slice(-limit) : [...this.history];
    }

    /**
     * 히스토리 초기화
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * 에러 통계 반환
     * @returns {Object} 에러별 발생 횟수
     */
    getErrorStats() {
        return Object.fromEntries(this.errorCounts);
    }

    /**
     * 성능 측정 시작
     * @param {string} label - 측정 레이블
     * @returns {Function} 종료 함수
     */
    time(label) {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            return duration;
        };
    }

    /**
     * 그룹 로그 시작
     * @param {string} label - 그룹 레이블
     */
    group(label) {
        if (this.enabled && this.level <= LogLevel.DEBUG) {
            // eslint-disable-next-line no-console
            console.group(label);
        }
    }

    /**
     * 그룹 로그 종료
     */
    groupEnd() {
        if (this.enabled && this.level <= LogLevel.DEBUG) {
            // eslint-disable-next-line no-console
            console.groupEnd();
        }
    }
}

// 싱글톤 인스턴스 (전역 사용)
const logger = new Logger({
    level: LogLevel.INFO,
    enabled: true,
    timestamp: false
});

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger, LogLevel, logger };
}
