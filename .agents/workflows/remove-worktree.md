---
description: Remove an existing git worktree
---

# Git Worktree Remove Workflow

이 워크플로우는 병렬 작업이 완료되어 더 이상 필요하지 않은 git worktree를 정리하고 삭제합니다.

1. 터미널 명령어를 통해 현재 활성화된 worktree 목록을 확인하고, 삭제 가능한 worktree들을 안내합니다.
   - `git worktree list`
2. 사용자에게 삭제할 worktree의 경로(path)를 선택하게 합니다.
3. 삭제하려는 worktree 내에 커밋되지 않은 작업 내역이 있는지 확인하게끔 안내합니다. (강제 삭제 시 복구 불가하므로 확인 필수)
4. 사용자가 삭제를 허용하면 다음 명령어로 worktree를 삭제합니다.
   - 워크트리 삭제: `git worktree remove <path>`
   - (참고) 로컬 변경사항이 있어 삭제가 안 되는 경우, 사용자의 명시적인 확인을 거쳐 강제 삭제(`git worktree remove -f <path>`)를 진행할 수 있습니다.
5. 에디터 워크스페이스에서도 해당 경로를 정리합니다.
   - 프로젝트 루트에 `FrameUI.code-workspace` 파일이 존재한다면, JSON을 파싱하여 `"folders"` 배열에서 해당 worktree의 경로 객체를 제거합니다.
6. 삭제된 워크트리가 사용했던 브랜치도 더 이상 필요하지 않을 경우 브랜치를 삭제할지 묻고, 그렇다면 삭제합니다.
   - 브랜치 삭제: `git branch -D <branch-name>`
