/**
 * @fileoverview 메인 애플리케이션 - p5.js 통합 및 오케스트레이션
 * @module main
 * @author 윤현준 (통합, 이벤트 처리)
 *         방채민 (로직 연동)
 */

// ========== 전역 인스턴스 ==========

let gameState;        // GameState: 게임 상태
let cardManager;      // CardManager: 카드 생성/관리
let gameManager;      // GameManager: 게임 로직
let cardRenderer;     // CardRenderer: 카드 렌더링
let uiRenderer;       // UIRenderer: UI 렌더링
let particleSystem;   // ParticleSystem: 파티클 효과
let soundManager;     // SoundManager: 효과음 관리

let hoveredCard = null;       // 현재 호버 중인 카드
let isConfettiActive = false; // 색종이 효과 활성화 여부

// ========== p5.js 라이프사이클 ==========

/**
 * p5.js setup - 초기화
 */
function setup() {
    // 캔버스 생성
    const canvas = createCanvas(CANVAS_CONFIG.width, CANVAS_CONFIG.height);
    canvas.parent('canvas-container');

    // 텍스트 설정
    textFont('Noto Sans KR, -apple-system, sans-serif');

    // 인스턴스 생성
    initializeInstances();

    // 게임 매니저 콜백 설정
    setupGameCallbacks();

    console.log('Game initialized successfully');
}

/**
 * p5.js draw - 매 프레임 실행
 */
function draw() {
    const phase = gameState.phase;

    switch (phase) {
        case GAME_STATE.START:
            uiRenderer.drawStartScreen();
            break;

        case GAME_STATE.DIFFICULTY:
            uiRenderer.drawDifficultyScreen();
            break;

        case GAME_STATE.PREVIEW:
        case GAME_STATE.PLAYING:
            drawGamePlay();
            break;

        case GAME_STATE.RESULT:
            const stats = gameState.getResultStats();
            uiRenderer.drawResultScreen(stats);

            // 색종이 효과 (승리 시)
            if (isConfettiActive) {
                particleSystem.createConfettiRain();
                particleSystem.update();
            }
            break;

        default:
            background(220);
            fill(0);
            textAlign(CENTER, CENTER);
            text('Unknown state', width / 2, height / 2);
    }
}

/**
 * 게임 플레이 화면 그리기
 */
function drawGamePlay() {
    // UI 먼저 그리기 (배경 포함)
    uiRenderer.drawGameUI(gameState);

    // 카드 렌더링
    cardRenderer.drawAllCards(gameState.cards, hoveredCard);

    // 파티클 렌더링 (카드 위에)
    if (particleSystem) {
        particleSystem.update();
    }

    // 디버그 모드 (키보드 'D' 눌렀을 때)
    if (keyIsPressed && key === 'd') {
        cardRenderer.drawAllDebugBoxes(gameState.cards);
    }
}

// ========== 이벤트 핸들러 ==========

/**
 * 마우스 클릭 이벤트
 */
function mouseClicked() {
    const phase = gameState.phase;

    switch (phase) {
        case GAME_STATE.START:
            handleStartClick();
            break;

        case GAME_STATE.DIFFICULTY:
            handleDifficultyClick();
            break;

        case GAME_STATE.PLAYING:
            handleGameClick();
            break;

        case GAME_STATE.RESULT:
            handleResultClick();
            break;
    }
}

/**
 * 마우스 이동 이벤트
 */
function mouseMoved() {
    if (gameState.phase === GAME_STATE.PLAYING) {
        // 호버 중인 카드 찾기
        hoveredCard = cardManager.findCardAt(gameState.cards, mouseX, mouseY);
    }
}

/**
 * 키보드 입력 이벤트
 */
function keyPressed() {
    // 디버그 키
    if (key === 'g' || key === 'G') {
        gameManager.debug();
    }

    // ESC: 게임 리셋
    if (keyCode === ESCAPE) {
        if (confirm('게임을 초기화하시겠습니까?')) {
            gameManager.resetGame();
        }
    }
}

/**
 * 창 크기 변경 (반응형)
 */
function windowResized() {
    // TODO: 반응형 레이아웃
    // resizeCanvas(windowWidth, windowHeight);
}

// ========== 클릭 핸들러 ==========

/**
 * 시작 화면 클릭
 */
function handleStartClick() {
    const button = uiRenderer.handleStartClick(mouseX, mouseY);

    if (button === 'start') {
        gameState.setPhase(GAME_STATE.DIFFICULTY);
    }
}

/**
 * 난이도 선택 클릭
 */
function handleDifficultyClick() {
    const difficultyKey = uiRenderer.handleDifficultyClick(mouseX, mouseY);

    if (difficultyKey && DIFFICULTY[difficultyKey]) {
        const difficulty = DIFFICULTY[difficultyKey];
        gameManager.startGame(difficulty);
        console.log(`Started game with difficulty: ${difficulty.name}`);

        // 게임 시작 시 헬퍼 메시지 표시
        setTimeout(() => {
            uiRenderer.showHelperMessage('💡 카드를 클릭하여 짝을 찾으세요!', 4000);
        }, 500);
    }
}

/**
 * 게임 플레이 클릭
 */
function handleGameClick() {
    const handled = gameManager.handleClick(mouseX, mouseY);

    if (!handled) {
        console.log('Click not handled');
    }
}

/**
 * 결과 화면 클릭
 */
function handleResultClick() {
    const button = uiRenderer.handleResultClick(mouseX, mouseY);

    if (button === 'retry') {
        // 색종이 효과 비활성화
        isConfettiActive = false;
        particleSystem.clear();

        // 현재 난이도로 재시작
        const difficulty = gameState.difficulty;
        gameManager.startGame(difficulty);
    } else if (button === 'difficulty') {
        // 난이도 선택 화면으로 이동
        isConfettiActive = false;
        particleSystem.clear();
        gameManager.resetGame();
        gameState.setPhase(GAME_STATE.DIFFICULTY);
    }
}

// ========== 초기화 ==========

/**
 * 모든 인스턴스 초기화
 */
function initializeInstances() {
    // Core
    gameState = new GameState();

    // Logic
    cardManager = new CardManager(CARD_CONFIG);
    gameManager = new GameManager(gameState, cardManager);

    // Rendering
    cardRenderer = new CardRenderer(CARD_CONFIG);
    uiRenderer = new UIRenderer();
    particleSystem = new ParticleSystem();

    // Sound
    soundManager = new SoundManager();

    console.log('All instances initialized');
}

/**
 * 게임 매니저 이벤트 리스너 설정 (EventEmitter 패턴)
 */
function setupGameCallbacks() {
    // 카드 뒤집기
    gameManager.on('card:flip', (card) => {
        console.log('Card flipped:', card.id);
        soundManager.play('click', 0.5);
    });

    // 매칭 성공
    gameManager.on('match:success', (data) => {
        const { card1, card2, points } = data;
        console.log(`Match! Cards ${card1.id} and ${card2.id}, +${points} points`);
        uiRenderer.showMessage('짝 성공! 🎉', 1000, 'success');
        cardRenderer.animateMatch(card1, card2);
        soundManager.play('match', 0.7);

        // 파티클 효과 (카드 중간 위치)
        const centerX = (card1.x + card2.x) / 2 + CARD_CONFIG.width / 2;
        const centerY = (card1.y + card2.y) / 2 + CARD_CONFIG.height / 2;
        particleSystem.createMatchParticles(centerX, centerY);
    });

    // 매칭 실패
    gameManager.on('match:fail', (data) => {
        const { card1, card2, penalty } = data;
        console.log(`Mismatch! Cards ${card1.id} and ${card2.id}, -${penalty}s`);
        uiRenderer.showMessage('다시 도전! 💪', 800, 'error');
        cardRenderer.animateMismatch(card1, card2);
        soundManager.play('mismatch', 0.6);
    });

    // 시간 업데이트
    gameManager.on('timer:update', (data) => {
        const { remaining } = data;
        // 10초 이하 경고
        if (remaining === 10) {
            uiRenderer.showMessage('⏰ 시간이 얼마 남지 않았어요!', 2000, 'error');
        }
    });

    // 하트 감소
    gameManager.on('heart:lost', (data) => {
        const { remaining, max } = data;
        console.log(`Heart lost! Remaining: ${remaining}`);

        if (remaining === 0) {
            uiRenderer.showMessage('💔 하트를 모두 소진했어요!', 1500, 'error');
        } else if (remaining <= max * 0.3) {
            uiRenderer.showMessage(`💔 하트 ${remaining}개 남음!`, 1200, 'error');
        }

        // 하트 감소 효과음
        soundManager.play('mismatch', 0.8);
    });

    // 게임 초기화
    gameManager.on('game:init', (data) => {
        console.log('Game initialized:', data);
    });

    // 미리 보기 시작
    gameManager.on('game:preview:start', (data) => {
        console.log('Preview started:', data);
    });

    // 미리 보기 종료
    gameManager.on('game:preview:end', () => {
        console.log('Preview ended');
    });

    // 게임 플레이 시작
    gameManager.on('game:playing:start', () => {
        console.log('Game playing started');
    });

    // 게임 완료
    gameManager.on('game:complete', (stats) => {
        console.log('Game completed!', stats);

        // 축하 폭죽
        particleSystem.createCelebrationParticles(60);

        // 지속적인 색종이 효과 활성화
        isConfettiActive = true;

        // 클리어 사운드
        soundManager.play('complete', 0.8);

        setTimeout(() => {
            uiRenderer.showMessage('축하합니다! 🎉', 2000, 'success');
        }, 500);
    });

    // 게임 오버
    gameManager.on('game:over', (data) => {
        const { reason, stats } = data;
        console.log('Game over!', { reason, stats });

        let message = '게임 오버!';
        if (reason === 'hearts') {
            message = '하트 소진! 💔';
        } else if (reason === 'time') {
            message = '시간 초과! ⏰';
        }

        setTimeout(() => {
            uiRenderer.showMessage(message, 2000, 'error');
        }, 500);
    });

    // 게임 리셋
    gameManager.on('game:reset', () => {
        console.log('Game reset');
    });

    // 에러 처리
    gameManager.on('error', (data) => {
        const { method, error } = data;
        console.error(`[GameManager Error] ${method}:`, error);
        uiRenderer.showMessage('오류가 발생했습니다. 게임을 다시 시작해주세요.', 3000, 'error');
    });
}

// ========== 디버그 함수 (브라우저 콘솔에서 사용) ==========

/**
 * 게임 상태 출력
 */
function debugState() {
    console.log('=== Game State ===');
    console.log(gameState.toJSON());
    console.log('Info:', gameManager.getGameInfo());
}

/**
 * 모든 카드 정보 출력
 */
function debugCards() {
    console.log('=== Cards ===');
    gameState.cards.forEach((card, index) => {
        console.log(`[${index}]`, card.toString());
    });
}

/**
 * 강제 게임 클리어 (테스트용)
 */
function debugWin() {
    gameState.cards.forEach(card => card.setMatched());
    gameManager._completeGame();
}

/**
 * 강제 시간 설정 (테스트용)
 */
function debugSetTime(seconds) {
    gameState.updateTime(seconds);
}
