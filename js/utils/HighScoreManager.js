/**
 * @fileoverview 최고 기록 관리자 - localStorage 기반 기록 저장
 * @module utils/HighScoreManager
 * @author 윤현준 (기록 저장 시스템)
 */

/**
 * 최고 기록 관리 클래스
 * localStorage를 사용하여 난이도별 최고 기록을 저장하고 관리
 */
class HighScoreManager {
    constructor() {
        // localStorage 키
        this.storageKey = 'memoryCardGame_highScores';

        // 최고 기록 데이터 로드
        this.scores = this._loadScores();
    }

    /**
     * localStorage에서 기록 로드
     *
     * @private
     * @returns {Object} 난이도별 기록 객체
     */
    _loadScores() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load high scores:', e);
        }

        // 기본 구조 반환
        return {
            '하': null,
            '중': null,
            '상': null,
            '지옥': null
        };
    }

    /**
     * localStorage에 기록 저장
     *
     * @private
     */
    _saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            console.warn('Failed to save high scores:', e);
        }
    }

    /**
     * 신기록 여부 확인
     *
     * @param {string} difficultyName - 난이도 이름 ('하', '중', '상', '지옥')
     * @param {number} score - 점수
     * @returns {boolean} 신기록이면 true
     */
    isNewRecord(difficultyName, score) {
        const current = this.scores[difficultyName];

        // 기록이 없으면 신기록
        if (!current) {
            return true;
        }

        // 점수가 더 높으면 신기록
        return score > current.score;
    }

    /**
     * 최고 기록 저장
     *
     * @param {string} difficultyName - 난이도 이름
     * @param {number} score - 점수
     * @param {number} time - 소요 시간 (초)
     * @param {number} accuracy - 정확도 (%)
     */
    saveScore(difficultyName, score, time, accuracy) {
        const current = this.scores[difficultyName];

        // 신기록이면 저장
        if (!current || score > current.score) {
            this.scores[difficultyName] = {
                score: score,
                time: time,
                accuracy: accuracy,
                date: new Date().toISOString()
            };

            this._saveScores();
            console.log(`New high score for ${difficultyName}:`, score);
            return true;
        }

        return false;
    }

    /**
     * 최고 기록 조회
     *
     * @param {string} difficultyName - 난이도 이름
     * @returns {Object|null} 최고 기록 객체 또는 null
     */
    getHighScore(difficultyName) {
        return this.scores[difficultyName] || null;
    }

    /**
     * 모든 최고 기록 조회
     *
     * @returns {Object} 난이도별 기록 객체
     */
    getAllHighScores() {
        return { ...this.scores };
    }

    /**
     * 특정 난이도 기록 초기화
     *
     * @param {string} difficultyName - 난이도 이름
     */
    clearScore(difficultyName) {
        this.scores[difficultyName] = null;
        this._saveScores();
        console.log(`Cleared high score for ${difficultyName}`);
    }

    /**
     * 모든 기록 초기화
     */
    clearAllScores() {
        this.scores = {
            '하': null,
            '중': null,
            '상': null,
            '지옥': null
        };
        this._saveScores();
        console.log('Cleared all high scores');
    }

    /**
     * 디버그: 현재 저장된 기록 출력
     */
    debug() {
        console.log('=== High Scores ===');
        console.log(this.scores);
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HighScoreManager;
}
