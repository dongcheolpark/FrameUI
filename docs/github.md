# GitHub Workflow

이 문서는 FrameUI 저장소에서 코드를 main 브랜치에 통합하는 방법을 정의한다.

## 기본 원칙

- main 브랜치는 항상 배포 가능한 상태를 유지한다.
- 가능한 한 빠르게 작업 결과를 main에 통합하는 것을 목표로 한다.
- main에는 머지 커밋(merge commit)을 남기지 않고, rebase 기반의 선형(one-line) 히스토리를 유지한다.
- 한 번의 push에는 하나의 커밋만 포함되도록 한다.

## 브랜치 전략

- 기본 브랜치: main
- 작업 방식:
  - 작은 단위의 변경 사항에 대해서는 main에서 직접 작업하고 커밋한다.
  - 필요할 경우 짧게-lived feature 브랜치를 사용할 수 있지만, main으로 통합할 때는 항상 rebase를 사용한다.

## 커밋 규칙

- 한 번의 push에는 하나의 커밋만 포함한다.
- 여러 번 작업한 경우, push 전에 커밋을 정리(squash 또는 rebase -i)하여 의미 있는 단일 커밋으로 만든다.
- 커밋 메시지는 변경 내용을 간결하게 설명한다.

예시:

```bash
# 작업 후 변경 사항 확인
git status

# 변경 사항 커밋
git commit -m "Describe the change briefly"

# main 최신 상태로 업데이트 및 리베이스
git fetch origin
git rebase origin/main

# 선형 히스토리를 유지한 상태로 push
git push origin main
```

## main 업데이트 및 충돌 해결

여러 사람이 동시에 main에 작업할 수 있으므로, push 전에 항상 main을 최신 상태로 맞춘다.

```bash
# 원격 main 가져오기
git fetch origin

# 현재 작업 커밋을 최신 main 위로 재배치
git rebase origin/main
```

리베이스 중 충돌이 발생한 경우:

1. 충돌 파일을 수정한다.
2. 수정한 파일을 stage 한다.
   ```bash
   git add <file>
   ```
3. 리베이스를 계속 진행한다.
   ```bash
   git rebase --continue
   ```

리베이스를 취소하고 싶으면 다음을 사용할 수 있다.

```bash
git rebase --abort
```

## 금지 사항

- main에 merge commit을 생성하는 머지 전략(예: `git merge origin/main` 후 push)은 사용하지 않는다.
- 여러 개의 자잘한 커밋을 그대로 main에 push하지 않는다.

## 권장 사항

- 변경 범위를 작게 유지하고, 가능한 자주 main에 통합한다.
- 리베이스 전후로 `git log --oneline`을 통해 히스토리가 선형적으로 유지되는지 확인한다.
- 팀원이 이해하기 쉬운 커밋 메시지를 작성한다. (너무 길게 적을 필요도 없음)
