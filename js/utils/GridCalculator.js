/**
 * @fileoverview 그리드 레이아웃 계산 유틸리티
 * @module utils/GridCalculator
 * @author 방채민
 */

/**
 * 그리드 레이아웃 계산기
 * 카드 배치를 위한 좌표 계산 담당
 * @namespace
 */
const GridCalculator = {
    /**
     * 그리드 시작 위치 계산 (중앙 정렬)
     *
     * @param {Object} config - 설정 객체
     * @param {number} config.canvasWidth - 캔버스 너비
     * @param {number} config.canvasHeight - 캔버스 높이
     * @param {number} config.cols - 열 개수
     * @param {number} config.rows - 행 개수
     * @param {number} config.cardWidth - 카드 너비
     * @param {number} config.cardHeight - 카드 높이
     * @param {number} config.margin - 카드 간 여백
     * @param {number} [config.topOffset=200] - 상단 오프셋 (UI 공간)
     * @returns {{x: number, y: number}} 시작 좌표
     */
    calculateStartPosition(config) {
        const {
            canvasWidth,
            canvasHeight,
            cols,
            rows,
            cardWidth,
            cardHeight,
            margin,
            topOffset = 100  // 레퍼런스처럼 상단 UI 축소
        } = config;

        // 그리드 전체 크기 계산
        const gridWidth = cols * cardWidth + (cols - 1) * margin;
        const gridHeight = rows * cardHeight + (rows - 1) * margin;

        // 중앙 정렬을 위한 시작 위치
        const startX = (canvasWidth - gridWidth) / 2;
        const startY = topOffset + (canvasHeight - topOffset - gridHeight) / 2;

        return { x: startX, y: startY };
    },

    /**
     * 인덱스를 기반으로 카드 좌표 계산
     *
     * @param {number} index - 카드 인덱스 (0부터 시작)
     * @param {Object} config - 설정 객체
     * @param {number} config.cols - 열 개수
     * @param {number} config.startX - 그리드 시작 X
     * @param {number} config.startY - 그리드 시작 Y
     * @param {number} config.cardWidth - 카드 너비
     * @param {number} config.cardHeight - 카드 높이
     * @param {number} config.margin - 카드 간 여백
     * @returns {{x: number, y: number, col: number, row: number}}
     */
    getCardPosition(index, config) {
        const { cols, startX, startY, cardWidth, cardHeight, margin } = config;

        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = startX + col * (cardWidth + margin);
        const y = startY + row * (cardHeight + margin);

        return { x, y, col, row };
    },

    /**
     * 모든 카드의 좌표 일괄 계산
     *
     * @param {number} totalCards - 전체 카드 개수
     * @param {Object} gridConfig - 그리드 설정
     * @returns {Array<{x: number, y: number, col: number, row: number}>}
     */
    calculateAllPositions(totalCards, gridConfig) {
        const positions = [];

        const startPos = this.calculateStartPosition(gridConfig);

        for (let i = 0; i < totalCards; i++) {
            const pos = this.getCardPosition(i, {
                ...gridConfig,
                startX: startPos.x,
                startY: startPos.y
            });
            positions.push(pos);
        }

        return positions;
    },

    /**
     * 최적의 그리드 크기 계산
     * 주어진 카드 개수에 대해 가장 정사각형에 가까운 그리드 찾기
     *
     * @param {number} cardCount - 카드 개수
     * @returns {{cols: number, rows: number}}
     *
     * @example
     * GridCalculator.calculateOptimalGrid(12); // { cols: 4, rows: 3 }
     * GridCalculator.calculateOptimalGrid(16); // { cols: 4, rows: 4 }
     * GridCalculator.calculateOptimalGrid(20); // { cols: 5, rows: 4 }
     */
    calculateOptimalGrid(cardCount) {
        // 정사각형에 가까운 형태 선호
        const sqrt = Math.sqrt(cardCount);
        let cols = Math.ceil(sqrt);
        let rows = Math.ceil(cardCount / cols);

        // 가로가 더 길도록 조정
        if (cols < rows) {
            [cols, rows] = [rows, cols];
        }

        return { cols, rows };
    },

    /**
     * 반응형 그리드 설정 계산
     * 화면 크기에 따라 카드 크기와 여백 조정
     *
     * @param {number} canvasWidth - 캔버스 너비
     * @param {number} canvasHeight - 캔버스 높이
     * @param {number} cardCount - 카드 개수
     * @returns {Object} 반응형 그리드 설정
     */
    calculateResponsiveGrid(canvasWidth, canvasHeight, cardCount) {
        const optimal = this.calculateOptimalGrid(cardCount);

        // 화면 크기에 따라 카드 크기 조정
        const availableWidth = canvasWidth * 0.9; // 좌우 여백 10%
        const availableHeight = (canvasHeight - 200) * 0.9; // 상단 UI 200px, 여백 10%

        const maxCardWidth = Math.floor(availableWidth / optimal.cols);
        const maxCardHeight = Math.floor(availableHeight / optimal.rows);

        // 카드 정사각형 비율 (1:1, 레퍼런스 스타일)
        const aspectRatio = 1 / 1;
        let cardSize = Math.min(maxCardWidth, maxCardHeight);

        // 최소/최대 크기 제한 (정사각형)
        cardSize = Math.max(80, Math.min(130, cardSize));

        let cardWidth = cardSize;
        let cardHeight = cardSize;

        const margin = Math.max(5, cardWidth * 0.1);

        return {
            cols: optimal.cols,
            rows: optimal.rows,
            cardWidth: Math.floor(cardWidth),
            cardHeight: Math.floor(cardHeight),
            margin: Math.floor(margin)
        };
    },

    /**
     * 카드 간 거리 계산
     *
     * @param {{x: number, y: number}} pos1 - 첫 번째 카드 위치
     * @param {{x: number, y: number}} pos2 - 두 번째 카드 위치
     * @returns {number} 유클리드 거리
     */
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 그리드 내 유효한 위치인지 확인
     *
     * @param {number} col - 열 인덱스
     * @param {number} row - 행 인덱스
     * @param {number} maxCols - 최대 열 개수
     * @param {number} maxRows - 최대 행 개수
     * @returns {boolean}
     */
    isValidPosition(col, row, maxCols, maxRows) {
        return col >= 0 && col < maxCols &&
               row >= 0 && row < maxRows;
    }
};

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridCalculator;
}
