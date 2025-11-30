/**
 * @fileoverview 배열 유틸리티 함수
 * @module utils/ArrayUtils
 * @author 방채민
 */

/**
 * 배열 관련 유틸리티 함수 모음
 * @namespace
 */
const ArrayUtils = {
    /**
     * Fisher-Yates 셔플 알고리즘
     * 배열을 무작위로 섞음 (in-place)
     *
     * @param {Array} array - 섞을 배열
     * @returns {Array} 섞인 배열 (원본 배열 수정됨)
     *
     * @example
     * const arr = [1, 2, 3, 4, 5];
     * ArrayUtils.shuffle(arr);
     * console.log(arr); // [3, 1, 5, 2, 4] (무작위)
     */
    shuffle(array) {
        if (!Array.isArray(array)) {
            throw new TypeError('Input must be an array');
        }

        const arr = array.slice(); // 복사본 생성

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
        }

        return arr;
    },

    /**
     * 배열을 청크로 분할
     *
     * @param {Array} array - 분할할 배열
     * @param {number} size - 청크 크기
     * @returns {Array<Array>} 청크 배열
     *
     * @example
     * ArrayUtils.chunk([1, 2, 3, 4, 5], 2);
     * // [[1, 2], [3, 4], [5]]
     */
    chunk(array, size) {
        if (!Array.isArray(array)) {
            throw new TypeError('Input must be an array');
        }

        if (size <= 0) {
            throw new RangeError('Size must be positive');
        }

        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }

        return chunks;
    },

    /**
     * 배열에서 무작위 요소 선택
     *
     * @param {Array} array - 대상 배열
     * @returns {*} 무작위 요소
     */
    random(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return undefined;
        }

        const index = Math.floor(Math.random() * array.length);
        return array[index];
    },

    /**
     * 배열에서 중복 제거
     *
     * @param {Array} array - 대상 배열
     * @returns {Array} 중복 제거된 배열
     */
    unique(array) {
        return [...new Set(array)];
    },

    /**
     * 배열의 특정 범위 생성
     *
     * @param {number} start - 시작 값
     * @param {number} end - 종료 값
     * @param {number} [step=1] - 증가 값
     * @returns {Array<number>} 범위 배열
     *
     * @example
     * ArrayUtils.range(0, 5);     // [0, 1, 2, 3, 4]
     * ArrayUtils.range(0, 10, 2); // [0, 2, 4, 6, 8]
     */
    range(start, end, step = 1) {
        const result = [];
        for (let i = start; i < end; i += step) {
            result.push(i);
        }
        return result;
    },

    /**
     * 배열을 그룹화
     *
     * @param {Array} array - 대상 배열
     * @param {Function} keyFn - 키 추출 함수
     * @returns {Object} 그룹화된 객체
     *
     * @example
     * const items = [
     *   { type: 'fruit', name: 'apple' },
     *   { type: 'fruit', name: 'banana' },
     *   { type: 'vegetable', name: 'carrot' }
     * ];
     * ArrayUtils.groupBy(items, item => item.type);
     * // {
     * //   fruit: [{ type: 'fruit', name: 'apple' }, { type: 'fruit', name: 'banana' }],
     * //   vegetable: [{ type: 'vegetable', name: 'carrot' }]
     * // }
     */
    groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }
};

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArrayUtils;
}
