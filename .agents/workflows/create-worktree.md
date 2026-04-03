---
description: Create a new git worktree for parallel task development
---

# Git Worktree Create Workflow

이 워크플로우는 기존 작업 내역을 방해하지 않고 독립적인 환경에서 병렬로 작업하기 위해 새로운 git worktree를 생성합니다.

1. 사용자에게 생성할 브랜치(branch) 이름과 worktree를 생성할 경로(path)를 확인합니다. 
   - 경로는 프로젝트 외부에 생성하는 것을 권장합니다 (예: `../FrameUI-[branch-name]`).
2. 사용자가 지정한 브랜치가 존재하는지 확인하고, 없다면 새로운 브랜치를 생성하며 worktree를 마운트합니다.
   - 기존 브랜치인 경우: `git worktree add <path> <branch-name>`
   - 새 브랜치인 경우: `git worktree add -b <branch-name> <path>`
3. 만들어진 worktree 디렉토리로 이동하여 의존성 패키지를 설치해야 하는지 사용자에게 확인하고 필요하다면 설치를 진행합니다.
   - 예: 해당 경로에서 `pnpm install` 실행
4. VS Code (또는 호환 에디터) 멀티 루트 워크스페이스를 지원하기 위해 경로를 워크스페이스 파일에 추가합니다.
   - 프로젝트 루트에 `FrameUI.code-workspace` 파일이 없다면 생성합니다. (기본 내용: `{"folders": [{"path": "."}, {"path": "<새 워크트리 경로>"}]}`)
   - 파일이 이미 존재한다면, JSON을 파싱하여 `"folders"` 배열에 `{"path": "<새 워크트리 경로>"}`를 추가합니다.
5. 새롭게 생성된 worktree가 추가된 `FrameUI.code-workspace`를 열어서 작업하도록 사용자에게 안내하거나, `code <path> -a` 등을 통해 에디터 워크스페이스에 자동으로 추가해줍니다.
