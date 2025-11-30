# Card Matching Game - 프로젝트 종합 가이드

> 이 문서는 프로젝트를 처음 접하는 개발자가 전체 구조와 동작 원리를 이해하고,
> 추가 개발이 가능한 수준까지 학습할 수 있도록 작성되었습니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [아키텍처 개요](#4-아키텍처-개요)
5. [핵심 클래스 상세 설명](#5-핵심-클래스-상세-설명)
6. [게임 흐름 (Flow)](#6-게임-흐름-flow)
7. [이벤트 시스템](#7-이벤트-시스템)
8. [렌더링 시스템](#8-렌더링-시스템)
9. [점수 및 게임 로직](#9-점수-및-게임-로직)
10. [확장 포인트](#10-확장-포인트)
11. [발표 대비 Q&A](#11-발표-대비-qa)

---

## 1. 프로젝트 개요

### 게임 소개
- **이름**: 카드 쿵쿵 매칭 짝짝! (메모리 카드 게임)
- **장르**: 메모리 매칭 퍼즐 게임
- **목표**: 같은 그림의 카드 짝을 모두 찾으면 승리

### 게임 규칙
1. 카드를 클릭하면 앞면이 보임
2. 두 장을 뒤집어 같은 그림이면 "매칭 성공"
3. 다르면 다시 뒷면으로 뒤집힘 (하트 1개 감소)
4. 모든 짝을 찾으면 승리, 하트가 0이 되거나 시간 초과시 패배

### 난이도별 특징

| 난이도 | 카드 수 | 시간 | 하트 | 그리드 | 미리보기 |
|--------|---------|------|------|--------|----------|
| 쉬움(하) | 8장 (4쌍) | 3분 | 5개 | 4x2 | 5초 |
| 보통(중) | 16장 (8쌍) | 2분 | 10개 | 4x4 | 7초 |
| 어려움(상) | 30장 (15쌍) | 1.5분 | 20개 | 8x4 | 없음 |

---

## 2. 기술 스택

### 핵심 기술
- **p5.js**: 캔버스 기반 그래픽 라이브러리 (게임 렌더링 담당)
- **Vanilla JavaScript (ES6+)**: 클래스, 모듈, 화살표 함수 등
- **HTML5 Canvas**: p5.js가 내부적으로 사용

### p5.js 핵심 개념
```javascript
// p5.js는 두 가지 핵심 함수를 제공
function setup() {
    // 게임 시작 시 1번만 실행 (초기화)
    createCanvas(1200, 800);
}

function draw() {
    // 매 프레임마다 실행 (약 60fps)
    // 여기서 화면을 그림
    background(220);
}

// 이벤트 핸들러
function mouseClicked() { /* 마우스 클릭 */ }
function keyPressed() { /* 키보드 입력 */ }
```

### 사용된 디자인 패턴
1. **Observer 패턴**: EventEmitter로 컴포넌트 간 통신
2. **State 패턴**: GameState로 게임 상태 관리
3. **Strategy 패턴**: 난이도별 다른 설정 적용
4. **Facade 패턴**: UIRenderer가 여러 Screen 클래스 통합

---

## 3. 프로젝트 구조

```
card-matching-game/
├── index.html              # 진입점 (스크립트 로드 순서 중요!)
├── css/
│   └── style.css          # 기본 스타일
└── js/
    ├── config.js          # 🔧 설정값 (난이도, 캔버스, 카드 설정)
    ├── main.js            # 🎮 p5.js 통합 및 이벤트 핸들링
    │
    ├── core/              # 📦 데이터 모델 (상태 저장)
    │   ├── Card.js        #   - 카드 한 장의 상태
    │   └── GameState.js   #   - 게임 전체 상태
    │
    ├── logic/             # 🧠 비즈니스 로직
    │   ├── CardManager.js #   - 카드 생성/관리
    │   └── GameManager.js #   - 게임 규칙/진행
    │
    ├── rendering/         # 🎨 화면 렌더링
    │   ├── CardRenderer.js    #   - 카드 그리기
    │   ├── UIRenderer.js      #   - UI 총괄
    │   ├── ParticleSystem.js  #   - 파티클 효과
    │   └── screens/           #   - 화면별 클래스
    │       ├── StartScreen.js
    │       ├── GameScreen.js
    │       └── ResultScreen.js
    │
    └── utils/             # 🔧 유틸리티
        ├── EventEmitter.js    #   - 이벤트 시스템
        ├── ArrayUtils.js      #   - 배열 유틸 (셔플 등)
        ├── GridCalculator.js  #   - 그리드 좌표 계산
        ├── SoundManager.js    #   - 효과음
        ├── HighScoreManager.js #  - 최고점수
        └── Logger.js          #   - 로깅
```

### 레이어 의존성 (중요!)

```
┌─────────────────────────────────────────────┐
│                  main.js                     │  ← p5.js 통합
│            (오케스트레이션)                    │
└─────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────────┐
│ Logic   │   │Rendering│   │   Utils     │
│Layer    │   │ Layer   │   │   Layer     │
└─────────┘   └─────────┘   └─────────────┘
    │               │
    └───────┬───────┘
            ▼
    ┌─────────────┐
    │ Core Layer  │  ← 데이터 모델
    │ (Card,      │
    │ GameState)  │
    └─────────────┘
            │
            ▼
    ┌─────────────┐
    │  config.js  │  ← 설정값
    └─────────────┘
```

---

## 4. 아키텍처 개요

### 전체 데이터 흐름

```
[사용자 입력]
     │
     ▼
[main.js - mouseClicked()]
     │
     ├─ 시작 화면 → handleStartClick() → 난이도 선택으로 전환
     ├─ 난이도 선택 → handleDifficultyClick() → 게임 시작
     ├─ 게임 중 → handleGameClick() → GameManager.handleClick()
     └─ 결과 화면 → handleResultClick() → 재시작/난이도 선택
```

### 게임 상태 머신 (State Machine)

```
[START] ──시작 클릭──▶ [DIFFICULTY] ──난이도 선택──▶ [PREVIEW]
                                                        │
                                                   미리보기 종료
                                                        │
                                                        ▼
[RESULT] ◀──게임 종료── [PLAYING] ◀─────────────────────┘
    │                       │
    │                       ├─ 모든 카드 매칭 → 승리
    │                       ├─ 하트 0 → 패배 (hearts)
    │                       └─ 시간 초과 → 패배 (time)
    │
    └── 재시작 클릭 ──▶ [PLAYING] (같은 난이도)
    └── 난이도 선택 클릭 ──▶ [DIFFICULTY]
```

---

## 5. 핵심 클래스 상세 설명

### 5.1 Card (js/core/Card.js)

**역할**: 카드 한 장의 데이터와 상태 관리

```javascript
class Card {
    // === 속성 ===
    _id           // 카드 ID (같은 ID = 짝)
    _x, _y        // 화면 좌표
    _isFlipped    // 뒤집힌 상태
    _isMatched    // 매칭 완료 상태
    _isAnimating  // 애니메이션 중 여부

    // === 핵심 메서드 ===
    canFlip()           // 클릭 가능 여부 (매칭X, 애니메이션X, 뒤집힘X)
    flip()              // 카드 뒤집기
    setMatched()        // 매칭 완료 처리
    contains(mx, my)    // 마우스가 카드 위에 있는지
    isMatchWith(other)  // 다른 카드와 짝인지 확인
}
```

**중요 포인트**:
- `id`가 같으면 짝! (예: id=0인 카드 2장이 한 쌍)
- `canFlip()`이 `true`여야 클릭 가능

### 5.2 GameState (js/core/GameState.js)

**역할**: 게임 전체 상태 저장소 (Single Source of Truth)

```javascript
class GameState {
    // === 게임 페이즈 ===
    _phase          // 'start' | 'difficulty' | 'preview' | 'playing' | 'result'

    // === 카드 관련 ===
    _cards          // Card[] 배열
    _firstCard      // 첫 번째 선택한 카드
    _secondCard     // 두 번째 선택한 카드
    _canFlip        // 카드 뒤집기 가능 여부
    _matchedPairs   // 맞춘 쌍 개수

    // === 하트/시간/점수 ===
    _hearts         // 남은 하트
    _timeRemaining  // 남은 시간(초)
    _score          // 현재 점수
    _combo          // 연속 성공 횟수

    // === 핵심 메서드 ===
    selectFirstCard(card)     // 첫 카드 선택
    selectSecondCard(card)    // 두 번째 카드 선택
    clearSelection()          // 선택 초기화
    recordMatch(points)       // 매칭 성공 기록
    recordMismatch(penalty)   // 매칭 실패 기록 (하트 감소)
    isAllMatched()            // 모든 카드 매칭 완료?
    getResultStats()          // 결과 화면용 통계
}
```

### 5.3 CardManager (js/logic/CardManager.js)

**역할**: 카드 덱 생성 및 관리

```javascript
class CardManager {
    // 난이도에 맞는 카드 덱 생성
    createDeck(difficulty) {
        // 1. 카드 쌍 생성 (pairs 개수만큼)
        // 2. Fisher-Yates 셔플로 무작위 배치
        // 3. 그리드 좌표 할당
        return shuffledCards;
    }

    findCardAt(cards, x, y)  // 좌표에 있는 카드 찾기
}
```

**카드 생성 과정**:
```
pairs=4 (쉬움)
→ [Card(id=0), Card(id=0), Card(id=1), Card(id=1),
   Card(id=2), Card(id=2), Card(id=3), Card(id=3)]
→ 셔플
→ 그리드 좌표 할당
```

### 5.4 GameManager (js/logic/GameManager.js)

**역할**: 게임 규칙과 진행 관리 (가장 핵심!)

```javascript
class GameManager extends EventEmitter {
    // === 게임 시작 ===
    startGame(difficulty) {
        this.state.reset();
        this.state.setDifficulty(difficulty);
        const cards = this.cardManager.createDeck(difficulty);
        this.state.setCards(cards);

        if (previewTime > 0) {
            this._startPreview(cards, previewTime);
        } else {
            this._startPlaying();
        }
    }

    // === 카드 클릭 처리 ===
    handleClick(x, y) {
        const card = this.cardManager.findCardAt(cards, x, y);
        if (!card || !card.canFlip()) return false;

        // 첫 번째 카드 선택
        if (!this.state.firstCard) {
            this.state.selectFirstCard(card);
            this.emit('card:flip', card);
            return true;
        }

        // 두 번째 카드 선택 → 매칭 체크
        this.state.selectSecondCard(card);
        setTimeout(() => this._checkMatch(), 500);
        return true;
    }

    // === 매칭 확인 ===
    _checkMatch() {
        if (card1.isMatchWith(card2)) {
            this._handleMatch(card1, card2);    // 성공!
        } else {
            this._handleMismatch(card1, card2); // 실패...
        }
    }

    // === 매칭 성공 ===
    _handleMatch(card1, card2) {
        card1.setMatched();
        card2.setMatched();
        this.state.recordMatch(points);
        this.emit('match:success', { card1, card2, points });

        if (this.state.isAllMatched()) {
            this._completeGame();  // 승리!
        }
    }

    // === 매칭 실패 ===
    _handleMismatch(card1, card2) {
        this.state.recordMismatch(timePenalty);  // 하트 감소
        this.emit('match:fail', { card1, card2 });

        if (this.state.isHeartsEmpty()) {
            this._gameOver('hearts');  // 패배
        }
    }
}
```

---

## 6. 게임 흐름 (Flow)

### 6.1 게임 시작부터 플레이까지

```
1. index.html 로드
   └─ 스크립트 순서대로 로드 (의존성 순서 중요!)

2. p5.js setup() 호출
   └─ initializeInstances() 실행
      ├─ gameState = new GameState()
      ├─ cardManager = new CardManager()
      ├─ gameManager = new GameManager(gameState, cardManager)
      ├─ cardRenderer = new CardRenderer()
      ├─ uiRenderer = new UIRenderer()
      └─ setupGameCallbacks()  // 이벤트 리스너 등록

3. p5.js draw() 매 프레임 실행
   └─ gameState.phase에 따라 다른 화면 렌더링
      ├─ START: uiRenderer.drawStartScreen()
      ├─ DIFFICULTY: uiRenderer.drawDifficultyScreen()
      ├─ PLAYING: drawGamePlay()
      └─ RESULT: uiRenderer.drawResultScreen()
```

### 6.2 카드 클릭 시 흐름

```
mouseClicked()
    │
    ▼
handleGameClick()
    │
    ▼
gameManager.handleClick(mouseX, mouseY)
    │
    ├─ cardManager.findCardAt() → 클릭된 카드 찾기
    │
    ├─ card.canFlip() 체크
    │
    ├─ cardRenderer.animateFlip() → 뒤집기 애니메이션
    │
    ├─ emit('card:flip', card) → 이벤트 발생
    │
    ├─ state.selectFirstCard() 또는 state.selectSecondCard()
    │
    └─ 두 장 선택 완료 시: setTimeout(_checkMatch, 500ms)
           │
           ▼
       _checkMatch()
           │
           ├─ 매칭 성공 → _handleMatch()
           │                  ├─ card.setMatched()
           │                  ├─ state.recordMatch()
           │                  ├─ emit('match:success')
           │                  └─ 모두 매칭? → _completeGame()
           │
           └─ 매칭 실패 → _handleMismatch()
                              ├─ state.recordMismatch()
                              ├─ emit('match:fail')
                              ├─ 하트 0? → _gameOver('hearts')
                              └─ _flipCardsBack() → 다시 뒤집기
```

---

## 7. 이벤트 시스템

### EventEmitter 패턴

GameManager가 EventEmitter를 상속하여 이벤트 기반 통신 제공

```javascript
// 이벤트 발생 (GameManager 내부)
this.emit('match:success', { card1, card2, points });

// 이벤트 리스너 등록 (main.js)
gameManager.on('match:success', (data) => {
    uiRenderer.showMessage('짝 성공! 🎉');
    cardRenderer.animateMatch(card1, card2);
    soundManager.play('match');
    particleSystem.createMatchParticles(x, y);
});
```

### 발생하는 이벤트 목록

| 이벤트 | 발생 시점 | 전달 데이터 |
|--------|----------|-------------|
| `card:flip` | 카드 뒤집을 때 | `card` |
| `match:success` | 매칭 성공 | `{ card1, card2, points, combo }` |
| `match:fail` | 매칭 실패 | `{ card1, card2, penalty }` |
| `heart:lost` | 하트 감소 | `{ remaining, max }` |
| `timer:update` | 매초 | `{ remaining, elapsed }` |
| `game:init` | 게임 초기화 | `{ difficulty, cardCount }` |
| `game:preview:start` | 미리보기 시작 | `{ duration }` |
| `game:preview:end` | 미리보기 종료 | - |
| `game:playing:start` | 게임 시작 | - |
| `game:complete` | 게임 클리어 | `stats` |
| `game:over` | 게임 오버 | `{ reason, stats }` |
| `game:reset` | 게임 리셋 | - |
| `error` | 에러 발생 | `{ method, error }` |

---

## 8. 렌더링 시스템

### 8.1 p5.js draw() 루프

```javascript
function draw() {
    switch (gameState.phase) {
        case 'start':
            uiRenderer.drawStartScreen();
            break;
        case 'difficulty':
            uiRenderer.drawDifficultyScreen();
            break;
        case 'playing':
            drawGamePlay();  // UI + 카드 + 파티클
            break;
        case 'result':
            uiRenderer.drawResultScreen(stats);
            if (isConfettiActive) particleSystem.createConfettiRain();
            break;
    }
}
```

### 8.2 UIRenderer 구조

```
UIRenderer (총괄)
    │
    ├─ StartScreen      시작/난이도 화면
    ├─ GameScreen       게임 중 상단 UI
    └─ ResultScreen     결과 화면

공통 유틸리티:
    _drawPillButton()       알약형 버튼
    _drawBearCharacter()    곰 캐릭터
    _drawSpeechBubble()     말풍선
    _drawGradientBackground() 그라데이션 배경
    _drawWaves()            물결 효과
    _drawClouds()           구름 애니메이션
```

### 8.3 CardRenderer 애니메이션

```javascript
// 뒤집기 애니메이션 (3D 회전 효과)
animateFlip(card, duration, flipToFront) {
    // progress 0→1 동안
    // scaleX = cos(progress * PI) → 1 → 0 → -1 → 0 → 1
    // progress = 0.5일 때 (scaleX = 0) 앞/뒷면 전환
}

// 매칭 성공 (통통 튀는 효과)
animateMatch(card1, card2) {
    // bounceScale = 1 + sin(progress * PI * 3) * 0.15
}

// 매칭 실패 (흔들림 효과)
animateMismatch(card1, card2) {
    // shakeX = sin(progress * PI * 8) * 10
}
```

---

## 9. 점수 및 게임 로직

### 9.1 점수 계산

```javascript
// 매칭 성공 시
basePoints = difficulty.pointsPerMatch;  // 쉬움:10, 보통:15, 어려움:20
comboBonus = combo * 5;                  // 연속 성공 보너스
totalPoints = basePoints + comboBonus;

// 게임 클리어 시 추가 점수
timeBonus = timeRemaining * 2;           // 남은 시간 보너스
heartBonus = hearts * 10;                // 남은 하트 보너스
finalScore = baseScore + comboBonus + timeBonus + heartBonus;
```

### 9.2 난이도별 설정값

```javascript
// config.js의 DIFFICULTY 객체
EASY: {
    pairs: 4,           // 4쌍 = 8장
    timeLimit: 180,     // 3분
    gridCols: 4, gridRows: 2,
    pointsPerMatch: 10,
    timePenalty: 5,     // 실패 시 5초 감소
    previewTime: 5000,  // 5초 미리보기
    hearts: 5
}
```

### 9.3 게임 종료 조건

```javascript
// 승리
if (state.isAllMatched()) {
    state.endGameWin();
    emit('game:complete', stats);
}

// 패배 - 하트 소진
if (state.isHeartsEmpty()) {
    state.endGameLose('hearts');
    emit('game:over', { reason: 'hearts', stats });
}

// 패배 - 시간 초과
if (timeRemaining <= 0) {
    state.endGameLose('time');
    emit('game:over', { reason: 'time', stats });
}
```

---

## 10. 확장 포인트

### 10.1 새 난이도 추가하기

```javascript
// config.js에 추가
DIFFICULTY.EXPERT = {
    name: '전문가',
    pairs: 20,
    timeLimit: 60,
    gridCols: 8,
    gridRows: 5,
    pointsPerMatch: 30,
    timePenalty: 20,
    previewTime: 0,
    hearts: 10,
    color: { bg: '#000', card: '#FF0000', text: '#FFF' }
};

// StartScreen.js의 buttons 배열에 추가
{ key: 'EXPERT', label: '전문가', color: '#FF0000', y: 520 }
```

### 10.2 새 카드 아이콘 추가하기

```javascript
// CardRenderer.js의 cardIcons 배열에 추가
this.cardIcons = [
    '🍎', '🍄', '🚀', '💎', '🔑', '✉️', '🍀', '🎲',
    '👁️', '⭐', '🌙', '☀️', '🌸', '🍊', '🍇',
    '🎸', '🎹', '🎺'  // 새로 추가
];
```

### 10.3 새 이벤트 추가하기

```javascript
// GameManager에서 emit
this.emit('bonus:collected', { type: 'time', amount: 10 });

// main.js에서 리스너 등록
gameManager.on('bonus:collected', (data) => {
    uiRenderer.showMessage(`+${data.amount}초!`);
});
```

### 10.4 특수 카드 구현 (TODO)

```javascript
// config.js에 미리 정의되어 있음
CARD_TYPE = {
    NORMAL: 'normal',
    // BONUS: 'bonus',  // TODO: 자동 매칭
    // BOMB: 'bomb'     // TODO: 페널티
};

// Card.js에 타입 속성 추가 필요
constructor(id, x, y, imagePath, type = 'normal') {
    this._type = type;
}
```

---

## 11. 발표 대비 Q&A

### Q1. 왜 p5.js를 사용했나요?
> 캔버스 기반 게임 개발에 최적화된 라이브러리입니다.
> `setup()`, `draw()` 패턴으로 게임 루프를 쉽게 구현할 수 있고,
> 마우스/키보드 이벤트 처리가 간단합니다.

### Q2. 게임 상태는 어떻게 관리되나요?
> GameState 클래스가 Single Source of Truth 역할을 합니다.
> 모든 상태 변경은 GameState의 메서드를 통해 이루어지며,
> GameManager가 이를 조율합니다.

### Q3. 컴포넌트 간 통신은 어떻게 하나요?
> Observer 패턴(EventEmitter)을 사용합니다.
> GameManager가 이벤트를 발생시키고, main.js에서 리스너를 등록해
> UI 업데이트, 사운드 재생, 파티클 효과 등을 처리합니다.

### Q4. 카드 매칭 로직은 어떻게 동작하나요?
> 같은 ID를 가진 카드 2장이 한 쌍입니다.
> `card1.isMatchWith(card2)`는 두 카드의 ID를 비교합니다.
> 매칭 성공 시 `setMatched()`로 상태를 변경하고,
> 실패 시 일정 시간 후 다시 뒷면으로 뒤집습니다.

### Q5. 레이어 구조의 장점은?
> - **Core**: 순수 데이터 모델, 의존성 없음
> - **Logic**: 비즈니스 로직, Core에만 의존
> - **Rendering**: UI 렌더링, Core 상태를 읽어서 표시
> - **Utils**: 공통 유틸리티, 재사용 가능
>
> 이 구조 덕분에 각 레이어를 독립적으로 테스트/수정할 수 있습니다.

### Q6. 애니메이션은 어떻게 구현했나요?
> CardRenderer의 `animations` Map에 애니메이션 상태를 저장합니다.
> 매 draw() 프레임마다 progress를 계산하고,
> progress에 따라 scale, rotate, translate 변환을 적용합니다.

### Q7. 확장성을 고려한 부분은?
> - config.js에 설정값 분리
> - EventEmitter로 느슨한 결합
> - 화면별 Screen 클래스 분리
> - 미래 기능을 위한 TODO 주석 (특수 카드, 테마 등)

---

## 다음 단계

1. **코드 직접 읽기**: 이 가이드를 참고하며 실제 코드 확인
2. **디버깅 실습**: 브라우저 콘솔에서 `debugState()`, `debugCards()` 실행
3. **작은 수정 시도**: 색상 변경, 아이콘 추가 등 간단한 것부터
4. **새 기능 구현**: 새 난이도, 특수 카드 등 도전

---

*마지막 업데이트: 2025-11-30*
