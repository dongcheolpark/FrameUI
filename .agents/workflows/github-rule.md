---
description: Apply GitHub workflow rules (linear history, squash commits, rebase to main)
---
이 워크플로우는 `docs/github.md`의 원칙(Rebase 기반 선형 히스토리 유지, 단일 커밋 푸시, Merge Commit 금지)에 따라 현재 작업을 main 브랜치 기준으로 병합 및 정리하기 위한 자동화 규칙입니다.

1. 현재 상태와 변경 사항을 확인합니다.
// turbo
```bash
git status
```

2. (필요 시) 작업 내용을 하나의 커밋으로 통합(Squash)하거나 새로 커밋합니다. (머지 커밋 방식 금지)
```bash
git add .
git commit -m "기능 설명" # 기존 커밋에 덮어쓸 경우 git commit --amend
```

3. 최신 상태의 원격(origin) 정보를 가져옵니다.
// turbo
```bash
git fetch origin
```

4. origin/main 브랜치를 기준으로 현재 브랜치를 재배치(Rebase)합니다.
// turbo
```bash
git rebase origin/main
```

5. 리베이스가 정상적으로 선형(One-line)으로 이루어졌는지 히스토리를 확인합니다.
// turbo
```bash
git log --oneline -n 5
```

6. 충돌이 없고 히스토리가 문제없다면, 원격 저장소로 단일 커밋을 전송합니다.
// turbo
```bash
git push origin HEAD
```
