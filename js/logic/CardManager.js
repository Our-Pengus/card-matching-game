/**
 * @fileoverview 카드 생성 및 관리 로직
 * @module logic/CardManager
 * @author 방채민
 */

/**
 * 카드 덱 생성 및 관리 담당
 * @class
 */
class CardManager {
    /**
     * @param {Object} config - CARD_CONFIG 설정 객체
     */
    constructor(config = CARD_CONFIG) {
        this.config = config;
        this.imageCache = new Map(); // 이미지 캐싱
    }

    /**
     * 난이도에 맞는 카드 덱 생성
     *
     * @param {Object} difficulty - 난이도 설정 객체
     * @param {string} [theme='FRUIT'] - 카드 테마
     * @returns {Card[]} 생성된 카드 배열
     *
     * @example
     * const manager = new CardManager();
     * const cards = manager.createDeck(DIFFICULTY.EASY);
     */
    createDeck(difficulty, theme = 'FRUIT') {
        if (!difficulty || !difficulty.pairs) {
            throw new Error('Invalid difficulty configuration');
        }

        // 3장 매칭인지 2장 매칭인지 확인
        const matchingRule = difficulty.matchingRule || 2;
        const sets = difficulty.sets || difficulty.pairs;
        
        if (!sets) {
            throw new Error('Invalid difficulty configuration: missing pairs or sets');
        }

        // 1. 카드 생성 (2장 또는 3장 매칭)
        const cards = matchingRule === 3 
            ? this._generateCardSets(sets, theme)
            : this._generateCardPairs(sets, theme);

        // 2. 폭탄 카드 추가
        if (difficulty.specialCards && difficulty.specialCards.bombs) {
            for (let i = 0; i < difficulty.specialCards.bombs; i++) {
                const bombId = -(i + 1);
                cards.push(new Card(bombId, 0, 0, '', true));
            }
        }

        // 3. 카드 섞기
        const shuffled = ArrayUtils.shuffle(cards);

        // 4. 그리드 좌표 계산 및 할당
        this._assignPositions(shuffled, difficulty);

        return shuffled;
    }

    /**
     * 카드 쌍 생성 (내부 메서드)
     *
     * @private
     * @param {number} pairs - 생성할 쌍의 개수
     * @param {string} theme - 카드 테마
     * @returns {Card[]} 카드 배열 (섞이지 않음)
     */
    _generateCardPairs(pairs, theme) {
        const cards = [];
        const imagePaths = this._getImagePaths(theme, pairs);

        // 히든 카드 활성화 시 일반 카드 쌍 수를 1개 줄임
        const normalPairs = HIDDEN_CARD.enabled ? pairs - 1 : pairs;

        for (let id = 0; id < normalPairs; id++) {
            const imagePath = imagePaths[id] || `assets/images/cards/placeholder_${id}.png`;

            // 같은 ID를 가진 카드 2개 생성 (짝)
            for (let j = 0; j < 2; j++) {
                const card = new Card(id, 0, 0, imagePath);
                cards.push(card);
            }
        }

        // 히든 카드 1쌍 추가
        if (HIDDEN_CARD.enabled) {
            for (let j = 0; j < 2; j++) {
                const hiddenCard = new Card(
                    HIDDEN_CARD.cardId,
                    0, 0,
                    HIDDEN_CARD.imagePath
                );
                cards.push(hiddenCard);
            }
        }

        return cards;
    }

    /**
     * 카드 세트 생성 (3장 매칭용)
     *
     * @private
     * @param {number} sets - 생성할 세트의 개수
     * @param {string} theme - 카드 테마
     * @returns {Card[]} 카드 배열 (섞이지 않음)
     */
    _generateCardSets(sets, theme) {
        const cards = [];
        const imagePaths = this._getImagePaths(theme, sets);

        for (let id = 0; id < sets; id++) {
            const imagePath = imagePaths[id] || `assets/images/cards/placeholder_${id}.png`;

            // 같은 ID를 가진 카드 3개 생성 (세트)
            for (let j = 0; j < 3; j++) {
                const card = new Card(id, 0, 0, imagePath);
                cards.push(card);
            }
        }

        return cards;
    }

    /**
     * 테마에 따른 이미지 경로 반환
     *
     * @private
     * @param {string} theme - 테마 이름
     * @param {number} count - 필요한 이미지 개수
     * @returns {string[]} 이미지 경로 배열
     */
    _getImagePaths(theme, count) {
        // CARD_THEMES는 현재 구현되지 않음 - 향후 확장용
        // 현재는 플레이스홀더 사용
        return ArrayUtils.range(0, count).map(i =>
            `assets/images/cards/placeholder_${i}.png`
        );
    }

    /**
     * 카드에 그리드 위치 할당
     *
     * @private
     * @param {Card[]} cards - 카드 배열
     * @param {Object} difficulty - 난이도 설정
     */
    _assignPositions(cards, difficulty) {
        // 지옥 모드일 때 캔버스 크기 조정
        const isHell = difficulty.name === '지옥';
        const canvasWidth = isHell && CANVAS_CONFIG.hell ? CANVAS_CONFIG.hell.width : CANVAS_CONFIG.width;
        const canvasHeight = isHell && CANVAS_CONFIG.hell ? CANVAS_CONFIG.hell.height : CANVAS_CONFIG.height;
        
        // 반응형 비율 조정: 그리드가 캔버스에 맞도록 카드 크기와 간격 조정
        let cardWidth = this.config.width;
        let cardHeight = this.config.height;
        let margin = this.config.margin;
        
        if (isHell) {
            // 그리드 전체 크기 계산
            const gridWidth = difficulty.gridCols * cardWidth + (difficulty.gridCols - 1) * margin;
            const gridHeight = difficulty.gridRows * cardHeight + (difficulty.gridRows - 1) * margin;
            
            // 캔버스에 맞도록 스케일 조정
            const availableWidth = canvasWidth - 40; // 좌우 여백
            const availableHeight = canvasHeight - 220; // 상하 여백 (상단 UI 포함)
            
            const scaleX = availableWidth / gridWidth;
            const scaleY = availableHeight / gridHeight;
            const scale = Math.min(scaleX, scaleY, 1.0); // 1.0을 넘지 않도록
            
            if (scale < 1.0) {
                cardWidth = cardWidth * scale;
                cardHeight = cardHeight * scale;
                margin = margin * scale;
            }
        }
        
        const gridConfig = {
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
            cols: difficulty.gridCols,
            rows: difficulty.gridRows,
            cardWidth: cardWidth,
            cardHeight: cardHeight,
            margin: margin,
            topOffset: 180 // 상단 UI 공간
        };

        const positions = GridCalculator.calculateAllPositions(cards.length, gridConfig);

        cards.forEach((card, index) => {
            const { x, y } = positions[index];
            card.setPosition(x, y);
        });
    }

    /**
     * 특정 좌표의 카드 찾기
     *
     * @param {Card[]} cards - 카드 배열
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @returns {Card|null} 찾은 카드 또는 null
     */
    findCardAt(cards, x, y) {
        return cards.find(card => card.contains(x, y)) || null;
    }

    /**
     * 뒤집힌 카드 목록 반환
     *
     * @param {Card[]} cards - 카드 배열
     * @returns {Card[]} 뒤집힌 카드들
     */
    getFlippedCards(cards) {
        return cards.filter(card => card.isFlipped && !card.isMatched);
    }

    /**
     * 매칭된 카드 목록 반환
     *
     * @param {Card[]} cards - 카드 배열
     * @returns {Card[]} 매칭된 카드들
     */
    getMatchedCards(cards) {
        return cards.filter(card => card.isMatched);
    }

    /**
     * 모든 카드 리셋
     *
     * @param {Card[]} cards - 카드 배열
     */
    resetAllCards(cards) {
        cards.forEach(card => card.reset());
    }

    /**
     * 카드 이미지 프리로드 (선택)
     * TODO: 손아영 - 이미지 준비 완료 후 구현
     *
     * @param {string[]} imagePaths - 이미지 경로 배열
     * @returns {Promise<void>}
     */
    async preloadImages(imagePaths) {
        const promises = imagePaths.map(path => {
            return new Promise((resolve, reject) => {
                if (typeof loadImage === 'function') {
                    // p5.js loadImage 사용
                    loadImage(path, img => {
                        this.imageCache.set(path, img);
                        resolve(img);
                    }, reject);
                } else {
                    // 브라우저 기본 Image 사용
                    const img = new Image();
                    img.onload = () => {
                        this.imageCache.set(path, img);
                        resolve(img);
                    };
                    img.onerror = reject;
                    img.src = path;
                }
            });
        });

        try {
            await Promise.all(promises);
            console.log(`Preloaded ${promises.length} images`);
        } catch (error) {
            console.error('Failed to preload some images:', error);
        }
    }

    /**
     * 캐시된 이미지 가져오기
     *
     * @param {string} path - 이미지 경로
     * @returns {*|null} 이미지 객체 또는 null
     */
    getCachedImage(path) {
        return this.imageCache.get(path) || null;
    }

    /**
     * 디버그 정보 출력
     *
     * @param {Card[]} cards - 카드 배열
     */
    debugPrint(cards) {
        console.group('Card Deck Debug Info');
        console.log('Total cards:', cards.length);
        console.log('Unique IDs:', new Set(cards.map(c => c.id)).size);
        console.log('Flipped:', this.getFlippedCards(cards).length);
        console.log('Matched:', this.getMatchedCards(cards).length);

        // ID별 그룹화
        const grouped = ArrayUtils.groupBy(cards, card => card.id);
        console.log('Cards by ID:', grouped);

        console.groupEnd();
    }
}

// ES6 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManager;
}
