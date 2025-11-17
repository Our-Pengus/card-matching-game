# 프로젝트 가이드라인

## 커밋 메시지 규칙
- Conventional Commits 형식 사용
- 형식: `<타입>: <설명>`
- 타입: feat, fix, docs, style, refactor, test, chore
- 제목은 50자 이내로 작성
- 명령형으로 작성 ("추가한다" 대신 "추가")

예시:
- feat: OAuth 사용자 인증 추가
- fix: 로그인 타임아웃 문제 해결
- docs: README에 설치 가이드 추가

## 브랜치 전략
- 항상 main 브랜치에서 feature 브랜치 생성
- 브랜치 명명 규칙: `feature/issue-{번호}-{간단한-설명}`
- main 브랜치에 직접 커밋 금지

예시:
- feature/issue-123-user-auth
- feature/issue-456-payment-api

## GitHub 워크플로우
- 작업 시작 전 반드시 이슈 먼저 생성
- PR에서 "Closes #123" 형식으로 이슈 연결
- 모든 GitHub 작업은 GitHub CLI (gh) 사용

## 테스트 요구사항
- PR 생성 전 E2E 테스트 필수 실행
- 신규 기능과 기존 기능 모두 테스트
- Chrome DevTools MCP를 사용한 E2E 테스트 수행

## 코드 품질
- ESLint, Prettier 등 린터 통과 필수
- 타입 체크 통과 필수
- 단위 테스트 작성 권장