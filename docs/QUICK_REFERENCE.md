# Card Matching Game - 빠른 참고서

> 발표 중 빠르게 참고할 수 있는 핵심 요약본

---

## 1. 한눈에 보는 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        main.js                               │
│                   (p5.js 통합 & 이벤트)                       │
├─────────────────────────────────────────────────────────────┤
│     Logic Layer          │        Rendering Layer           │
│  ┌─────────────────┐     │  ┌───────────────────────────┐   │
│  │  GameManager    │     │  │      UIRenderer           │   │
│  │  (게임 규칙)     │     │  │  ┌─────────────────────┐  │   │
│  ├─────────────────┤     │  │  │StartScreen│GameScreen│  │   │
│  │  CardManager    │     │  │  │ResultScreen          │  │   │
│  │  (카드 생성)     │     │  │  └─────────────────────┘  │   │
│  └─────────────────┘     │  ├───────────────────────────┤   │
│                          │  │  CardRenderer (카드 그리기) │   │
│                          │  ├───────────────────────────┤   │
│                          │  │  ParticleSystem (파티클)   │   │
│                          │  └───────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Core Layer                             │
│           ┌─────────────┐    ┌─────────────┐                │
│           │    Card     │    │  GameState  │                │
│           │ (카드 1장)   │    │ (전체 상태)  │                │
│           └─────────────┘    └─────────────┘                │
├─────────────────────────────────────────────────────────────┤
│                       config.js                              │
│              (DIFFICULTY, CARD_CONFIG, GAME_STATE)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 파일별 역할 (한 줄 요약)

| 파일 | 역할 |
|------|------|
| `config.js` | 난이도, 캔버스, 카드 설정값 정의 |
| `main.js` | p5.js setup/draw, 마우스/키보드 이벤트 처리 |
| `Card.js` | 카드 1장의 상태 (위치, 뒤집힘, 매칭 여부) |
| `GameState.js` | 게임 전체 상태 (점수, 시간, 하트, 카드 배열) |
| `CardManager.js` | 카드 덱 생성 및 셔플 |
| `GameManager.js` | **핵심!** 게임 규칙, 매칭 로직, 이벤트 발생 |
| `UIRenderer.js` | UI 렌더링 총괄 (Screen들 관리) |
| `CardRenderer.js` | 카드 그리기 및 애니메이션 |
| `EventEmitter.js` | Observer 패턴 구현 |

---

## 3. 게임 상태 흐름

```
START → DIFFICULTY → PREVIEW → PLAYING → RESULT
  │                              │         │
  └──────────────────────────────┴─────────┘
                  (재시작/난이도 선택)
```

---

## 4. 핵심 코드 스니펫

### 카드 매칭 확인

```javascript
// Card.js:152
isMatchWith(other) {
    return this._id === other._id;  // ID가 같으면 짝!
}
```

### 매칭 성공 처리

```javascript
// GameManager.js:267
_handleMatch(card1, card2) {
    card1.setMatched();
    card2.setMatched();
    this.state.recordMatch(points);
    this.emit('match:success', { card1, card2, points });

    if (this.state.isAllMatched()) {
        this._completeGame();  // 승리!
    }
}
```

### 매칭 실패 처리

```javascript
// GameManager.js:306
_handleMismatch(card1, card2) {
    this.state.recordMismatch(timePenalty);  // 하트 -1
    this.emit('match:fail', { card1, card2 });

    if (this.state.isHeartsEmpty()) {
        this._gameOver('hearts');  // 게임 오버
    }
}
```

---

## 5. 점수 계산 공식

```
기본 점수 = 난이도별 pointsPerMatch (10/15/20)
콤보 보너스 = combo * 5
시간 보너스 = 남은시간 * 2 (클리어 시)
하트 보너스 = 남은하트 * 10 (클리어 시)

최종 점수 = 기본점수 + 콤보보너스 + 시간보너스 + 하트보너스
```

---

## 6. 이벤트 목록

| 이벤트 | 발생 시점 |
|--------|----------|
| `card:flip` | 카드 뒤집을 때 |
| `match:success` | 매칭 성공 |
| `match:fail` | 매칭 실패 |
| `heart:lost` | 하트 감소 |
| `timer:update` | 매초 |
| `game:complete` | 게임 클리어 |
| `game:over` | 게임 오버 |

---

## 7. 디버그 명령어 (브라우저 콘솔)

```javascript
debugState()      // 게임 상태 출력
debugCards()      // 모든 카드 정보
debugWin()        // 강제 승리
debugSetTime(30)  // 시간 변경
gameManager.debug()  // GameManager 상세 정보
```

---

## 8. 난이도별 설정

| 항목 | 쉬움 | 보통 | 어려움 |
|------|------|------|--------|
| 카드 쌍 | 4 | 8 | 15 |
| 시간 | 180초 | 120초 | 90초 |
| 하트 | 5 | 10 | 20 |
| 그리드 | 4x2 | 4x4 | 8x4 |
| 미리보기 | 5초 | 7초 | 없음 |
| 매칭 점수 | 10 | 15 | 20 |
| 실패 페널티 | 5초 | 10초 | 15초 |

---

## 9. 사용 기술/패턴

- **p5.js**: 캔버스 기반 게임 렌더링
- **Observer 패턴**: EventEmitter로 컴포넌트 간 통신
- **State 패턴**: GameState로 상태 관리
- **Facade 패턴**: UIRenderer가 Screen들 통합

---

## 10. 클래스 관계도

```
EventEmitter
     │
     └── GameManager (상속)
              │
              ├── GameState (보유)
              └── CardManager (보유)
                       │
                       └── Card[] 생성


UIRenderer
     │
     ├── StartScreen (보유)
     ├── GameScreen (보유)
     └── ResultScreen (보유)
```

---

## 11. 스크립트 로드 순서 (index.html)

```
1. config.js          ← 설정값
2. Logger.js
3. EventEmitter.js    ← Observer 패턴
4. ArrayUtils.js      ← 유틸리티
5. GridCalculator.js
6. SoundManager.js
7. HighScoreManager.js
8. Card.js            ← Core 레이어
9. GameState.js
10. CardManager.js    ← Logic 레이어
11. GameManager.js
12. CardRenderer.js   ← Rendering 레이어
13. StartScreen.js
14. GameScreen.js
15. ResultScreen.js
16. UIRenderer.js
17. ParticleSystem.js
18. main.js           ← 마지막! (모든 것 통합)
```

---

## 12. 자주 나오는 질문 (Quick Answer)

**Q: 카드 짝은 어떻게 판별?**
> 같은 `id`를 가진 카드 2장이 한 쌍

**Q: 상태 관리는?**
> `GameState` 클래스가 Single Source of Truth

**Q: 컴포넌트 통신은?**
> `EventEmitter`로 이벤트 발행/구독

**Q: 렌더링 프레임워크는?**
> `p5.js` (60fps draw 루프)

**Q: 애니메이션 구현?**
> `CardRenderer.animations` Map + progress 기반 변환

---

*발표 화이팅!*
