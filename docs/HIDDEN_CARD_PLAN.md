# 🎭 히든 카드 구현 계획

## 컨셉
- 게임에 **딱 한 쌍**만 존재하는 희귀 카드
- 매칭 성공 시 **1초간 모든 카드 공개** + 특별 효과음
- 렌더링은 기존 카드와 동일 (이모지 대신 히든 이미지)

---

## 🎯 핵심 기능

### 매칭 성공 시
- ✨ **전체 카드 1초간 공개** (찬스 효과)
- 🎵 **특별 효과음** 재생

### 카드 클릭 시
- 🎵 **특별 효과음** 재생

---

## 🔧 수정 파일 목록

### 1. `js/config.js`
```javascript
// 히든 카드 설정 추가
const HIDDEN_CARD = {
    enabled: true,
    cardId: 99,  // 특수 ID
    imagePath: 'assets/images/cards/hidden.jpg',
    revealDuration: 1000,  // 전체 카드 공개 시간 (ms)
};
```

### 2. `js/core/Card.js`
```javascript
// 히든 카드 여부 확인 getter 추가
get isHiddenCard() {
    return this._id === HIDDEN_CARD.cardId;
}
```

### 3. `js/logic/CardManager.js`
```javascript
// createDeck() 수정
// - 일반 카드 쌍 생성 후 히든 카드 1쌍 추가
// - 히든 카드는 특수 ID(99) 부여
```

### 4. `js/utils/SoundManager.js`
```javascript
// 히든 카드 전용 효과음 - 외부 파일 로드 방식
this.soundPaths = {
    // 기존 효과음...
    hidden_click: 'assets/sounds/hidden_click.wav',
    hidden_match: 'assets/sounds/hidden_match.wav',
};
```

### 5. `js/logic/GameManager.js`
```javascript
// _handleMatch() 수정
if (card1.isHiddenCard) {
    this._handleHiddenMatch(card1, card2);
    return;
}

// 새 메서드 추가
_handleHiddenMatch(card1, card2) {
    // 1. 기본 매칭 처리
    // 2. 전체 카드 1초간 공개 이벤트 발생
    // 3. 1초 후 다시 뒤집기
    this.emit('hidden:match', { card1, card2 });
}
```

### 6. `js/rendering/CardRenderer.js`
```javascript
// 히든 카드 전용 렌더링 (이모지 대신 사진)
_drawHiddenCard(card) {
    // 히든 이미지 표시
}
```

### 7. `js/main.js`
```javascript
// 히든 카드 이벤트 핸들러 추가
gameManager.on('hidden:match', (data) => {
    // 1. 특별 효과음 재생
    soundManager.play('hidden_match');

    // 2. 전체 카드 공개
    revealAllCards(1000);
});
```

---

## 🎨 에셋 목록

### 이미지
- [x] `assets/images/cards/hidden.jpg` - 히든 카드 이미지 ✅

### 효과음
- [x] `assets/sounds/hidden_match.wav` - 매칭 성공 효과음 ✅
- [x] `assets/sounds/hidden_click.wav` - 클릭 효과음 ✅

---

## 🎮 게임 밸런스

| 항목                 | 값                       |
|---------------------|--------------------------|
| 전체 카드 공개 시간   | 1초                      |
| 점수 보너스          | 없음 (기존과 동일)         |
| 출현 확률            | 100% (모든 게임에 1쌍)    |

---

## 📐 구현 순서

1. **config.js** - 히든 카드 설정 추가
2. **Card.js** - `isHiddenCard` getter 추가
3. **CardManager.js** - 덱 생성 시 히든 카드 포함
4. **SoundManager.js** - 특별 효과음 로드
5. **CardRenderer.js** - 히든 카드 렌더링 (사진)
6. **GameManager.js** - 매칭 시 특별 로직
7. **main.js** - 이벤트 연결 및 전체 카드 공개 기능