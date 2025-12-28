# NextStep - Only Next Day Todo

"과거와 현재의 후회 대신 미래의 계획에 집중한다"는 컨셉의 데스크톱 투두 리스트 애플리케이션입니다. 사용자는 오늘 이미 결정된 할 일을 수정할 수 없으며, 오직 내일의 계획만 세울 수 있는 엄격한 규칙을 가집니다.

## 실행 방법

**중요:** 현재 환경의 제약으로 인해 의존성(dependency)을 자동으로 설치할 수 없었습니다. 애플리케이션을 실행하려면 다음 단계를 수동으로 진행해야 합니다.

1.  **프로젝트 디렉터리로 이동:**
    ```bash
    cd next-step-todo
    ```

2.  **의존성 설치:**
    ```bash
    npm install
    ```

3.  **애플리케이션 실행:**
    ```bash
    npm run dev
    ```

## 프로젝트 구조

*   `public/electron.js`: Electron 메인 프로세스 파일
*   `public/index.html`: 애플리케이션의 기본 HTML 템플릿
*   `src/index.js`: React 애플리케이션의 진입점
*   `src/App.js`: 메인 React 컴포넌트

*   `src/App.css`, `src/index.css`: 스타일시트
## 다음 단계

의존성 설치 및 실행이 확인되면 다음 기능을 구현할 예정입니다.

*   SQLite 데이터베이스 설정
*   자정마다 '내일' 목록을 '오늘' 목록으로 전환하는 스케줄러 구현
*   통계 시스템 개발
*   플로팅 UI 및 '항상 위' 기능 구현
