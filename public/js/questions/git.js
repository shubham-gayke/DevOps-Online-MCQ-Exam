// Git Questions - 25 total (2 Easy, 3 Medium, 20 Hard)
// Topics: interactive rebase, rebase --onto, rebase vs merge, golden rule, stash,
// merge conflicts, branching, hotfix workflow, push sequence, cherry-pick,
// reset vs revert, reflog, detached HEAD, fetch vs pull, HEAD~ vs HEAD^, bisect, amend

(function () {
  const gitQuestions = [
    // ── EASY (2) ──────────────────────────────────────────────────────────────
    {
      id: "git-001",
      topic: "Git",
      subtopic: "Fetch vs Pull",
      difficulty: "Easy",
      question: "What is the primary difference between `git fetch` and `git pull`?",
      code: null,
      options: [
        { id: "a", text: "`git fetch` downloads remote changes and merges them into your current branch automatically" },
        { id: "b", text: "`git fetch` downloads remote changes without modifying your working directory or current branch, while `git pull` fetches and then merges" },
        { id: "c", text: "`git pull` only downloads metadata about remote changes without applying them" },
        { id: "d", text: "`git fetch` requires a clean working directory while `git pull` can run with uncommitted changes" }
      ],
      correct: "b",
      explanation: "`git fetch` contacts the remote repository and downloads new commits, branches, and tags into your local remote-tracking references (e.g., `origin/main`) but never touches your working tree or current branch. `git pull` is essentially `git fetch` followed by `git merge` (or `git rebase` if configured). The first option is wrong because it describes `git pull`, not `git fetch`. Neither command strictly requires a clean working directory, though merge conflicts during `pull` can occur if there are uncommitted changes."
    },
    {
      id: "git-002",
      topic: "Git",
      subtopic: "Detached HEAD",
      difficulty: "Easy",
      question: "When does Git enter a 'detached HEAD' state?",
      code: null,
      options: [
        { id: "a", text: "When you delete a branch that HEAD was pointing to" },
        { id: "b", text: "When you check out a specific commit hash, tag, or remote-tracking branch instead of a local branch" },
        { id: "c", text: "When a merge conflict occurs and Git cannot determine which branch HEAD belongs to" },
        { id: "d", text: "When you run `git reset --hard` and the HEAD reference is removed from `.git/HEAD`" }
      ],
      correct: "b",
      explanation: "A detached HEAD state occurs when HEAD points directly to a commit rather than to a branch reference. This happens when you `git checkout <commit-hash>`, `git checkout <tag>`, or `git checkout origin/main`. In this state, new commits are not on any branch and can become unreachable if you switch away without creating a branch. The option about merge conflicts is wrong because during a conflict, HEAD still points to the branch you were on when you initiated the merge."
    },

    // ── MEDIUM (3) ─────────────────────────────────────────────────────────────
    {
      id: "git-003",
      topic: "Git",
      subtopic: "Reset Modes",
      difficulty: "Medium",
      question: "After making several commits, you run `git reset --mixed HEAD~3`. Which of the following correctly describes the resulting state?",
      code: null,
      options: [
        { id: "a", text: "The last 3 commits are removed, their changes are discarded from both the staging area and working directory" },
        { id: "b", text: "The last 3 commits are removed, their changes remain staged and ready to commit" },
        { id: "c", text: "The last 3 commits are removed, their changes are unstaged but preserved in the working directory" },
        { id: "d", text: "The last 3 commits are kept but their changes are copied to a new stash entry" }
      ],
      correct: "c",
      explanation: "`git reset --mixed` (which is the default mode) moves the HEAD pointer and updates the staging area (index) to match the target commit, but leaves the working directory untouched. This means all changes from the 3 removed commits become unstaged modifications in your working tree. `--soft` would keep them staged, and `--hard` would discard them entirely. The option describing staged changes describes `--soft` behavior, not `--mixed`."
    },
    {
      id: "git-004",
      topic: "Git",
      subtopic: "Rebase vs Merge",
      difficulty: "Medium",
      question: "In a team using a feature-branch workflow, what is the 'golden rule of rebasing'?",
      code: null,
      options: [
        { id: "a", text: "Always rebase instead of merging to keep the commit history linear" },
        { id: "b", text: "Never rebase commits that have been pushed to a public/shared branch that others may have based work on" },
        { id: "c", text: "Always rebase the main branch onto your feature branch before creating a pull request" },
        { id: "d", text: "Only rebase commits that have passed CI checks to avoid introducing broken history" }
      ],
      correct: "b",
      explanation: "The golden rule of rebasing states that you should never rebase commits that exist outside your local repository — specifically, commits that have been pushed to a shared branch where other developers may have based their work on them. Rebasing rewrites commit hashes, which creates duplicate commits and divergent histories for anyone who already has the original commits. The first option is a common misconception; rebase is a tool, not a universal rule, and merging is perfectly valid for shared branches."
    },
    {
      id: "git-005",
      topic: "Git",
      subtopic: "Stash",
      difficulty: "Medium",
      question: "What is the difference between `git stash pop` and `git stash apply`?",
      code: null,
      options: [
        { id: "a", text: "`pop` applies the stash and removes it from the stash list; `apply` applies the stash but keeps it in the stash list" },
        { id: "b", text: "`pop` applies the most recent stash while `apply` lets you choose which stash entry to apply" },
        { id: "c", text: "`pop` restores both tracked and untracked files while `apply` only restores tracked files" },
        { id: "d", text: "`pop` performs a three-way merge while `apply` overwrites working directory files directly" }
      ],
      correct: "a",
      explanation: "`git stash pop` and `git stash apply` both restore the stashed changes to your working directory. The key difference is that `pop` also removes the stash entry from the stash list after a successful application, while `apply` leaves it intact. Both commands can target a specific stash entry by index (e.g., `stash@{2}`), so the option claiming only `apply` allows selection is incorrect. If `pop` encounters a merge conflict, it does not drop the stash entry, behaving like `apply` in that case."
    },

    // ── HARD (20) ──────────────────────────────────────────────────────────────
    {
      id: "git-006",
      topic: "Git",
      subtopic: "Interactive Rebase",
      difficulty: "Hard",
      question: "During an interactive rebase, you want to combine a commit's changes into the previous commit while discarding the combined commit's message entirely. Which rebase command should you use?",
      code: {
        language: "text",
        content: "pick a1b2c3d Add user authentication\n???? e5f6g7h Fix typo in auth module"
      },
      options: [
        { id: "a", text: "Replace `????` with `squash` — it merges the commit into the previous one and opens an editor to combine both messages" },
        { id: "b", text: "Replace `????` with `fixup` — it merges the commit into the previous one and automatically discards the fixup commit's message" },
        { id: "c", text: "Replace `????` with `reword` — it merges the commit and lets you rewrite the message from scratch" },
        { id: "d", text: "Replace `????` with `edit` — it pauses the rebase so you can amend the previous commit and include the changes" }
      ],
      correct: "b",
      explanation: "`fixup` (or `f`) is specifically designed to fold a commit into the one above it in the rebase todo list while automatically discarding the folded commit's message, keeping only the previous commit's message. `squash` is similar but opens an editor with both messages for you to compose a combined message, which is not 'discarding entirely'. `reword` only changes a commit's message without combining commits. `edit` pauses the rebase for manual intervention but doesn't automatically combine commits."
    },
    {
      id: "git-007",
      topic: "Git",
      subtopic: "Interactive Rebase",
      difficulty: "Hard",
      question: "You have 5 commits on your feature branch. During `git rebase -i HEAD~5`, you delete (remove the line for) the third commit entirely from the todo list. What happens?",
      code: null,
      options: [
        { id: "a", text: "The rebase fails with an error because all commits must be accounted for in the todo list" },
        { id: "b", text: "The third commit is dropped — its changes are permanently removed from the branch history and working directory" },
        { id: "c", text: "The third commit is dropped from history but its changes are preserved as unstaged modifications in the working directory" },
        { id: "d", text: "The third commit is moved to the reflog stash and can be restored with `git stash pop`" }
      ],
      correct: "b",
      explanation: "In an interactive rebase, removing a line from the todo list (or using the `drop` command) causes that commit to be completely excluded from the rebased history. The commit's changes are not applied during the rebase, so they will not appear in the working directory or staging area. The commit object still exists in the Git object database temporarily and can be recovered via `git reflog` (not `git stash`), but it is effectively removed from the branch. The rebase does not fail — Git intentionally allows this as a way to delete commits."
    },
    {
      id: "git-008",
      topic: "Git",
      subtopic: "Rebase --onto",
      difficulty: "Hard",
      question: "You created a branch `feature-B` off `feature-A`. Now `feature-A` has been abandoned, and you want to transplant `feature-B`'s unique commits onto `main`. Which command achieves this?",
      code: {
        language: "bash",
        content: "# Branch topology:\n# main: A---B---C\n#                \\\n#     feature-A:  D---E\n#                      \\\n#         feature-B:    F---G---H  (you are here)"
      },
      options: [
        { id: "a", text: "`git rebase main` — this will replay all commits from the fork point onto main" },
        { id: "b", text: "`git rebase --onto main feature-A feature-B` — this replays only the commits after feature-A up to feature-B onto main" },
        { id: "c", text: "`git cherry-pick feature-A..feature-B` — this copies only the unique commits of feature-B" },
        { id: "d", text: "`git merge --squash main` — this collapses all feature-B commits onto main in a single commit" }
      ],
      correct: "b",
      explanation: "`git rebase --onto <newbase> <upstream> <branch>` is the three-argument form of rebase that transplants commits. It takes commits in the range `(upstream, branch]` — that is, commits reachable from `feature-B` but not from `feature-A` (commits F, G, H) — and replays them onto `main`. A plain `git rebase main` would replay D, E, F, G, H (everything since the fork from main), which is not what we want. While `cherry-pick` with a range could work, the syntax `feature-A..feature-B` is the correct range notation, but `rebase --onto` is the canonical and cleaner solution for branch transplantation."
    },
    {
      id: "git-009",
      topic: "Git",
      subtopic: "Merge Conflicts - Ours vs Theirs",
      difficulty: "Hard",
      question: "During a `git rebase main` on your feature branch, a conflict arises. You want to keep your feature branch's version of the conflicting file. Which flag do you use with `git checkout`?",
      code: null,
      options: [
        { id: "a", text: "`git checkout --ours conflicted-file` — during rebase, 'ours' refers to your feature branch changes" },
        { id: "b", text: "`git checkout --theirs conflicted-file` — during rebase, 'theirs' refers to your feature branch changes because rebase replays your commits onto the upstream" },
        { id: "c", text: "`git checkout --mine conflicted-file` — the `--mine` flag always refers to your current branch regardless of operation" },
        { id: "d", text: "`git checkout HEAD -- conflicted-file` — HEAD always points to your latest feature branch commit during rebase" }
      ],
      correct: "b",
      explanation: "During a rebase, the semantics of 'ours' and 'theirs' are swapped compared to a merge. When rebasing, Git first checks out the upstream branch (main), then replays your commits on top. So 'ours' refers to the upstream (main) and 'theirs' refers to the commit being replayed (your feature branch). This is a frequent source of confusion. The `--mine` flag does not exist in Git. During rebase, HEAD points to the commit being built on the upstream, not your original feature branch tip."
    },
    {
      id: "git-010",
      topic: "Git",
      subtopic: "Push Sequence",
      difficulty: "Hard",
      question: "You have committed changes locally and want to push to a shared remote branch. What is the correct sequence to safely push when others may have pushed changes since your last pull?",
      code: null,
      options: [
        { id: "a", text: "`git push` → if rejected, `git pull` → `git push`" },
        { id: "b", text: "`git add .` → `git commit` → `git push --force` to overwrite the remote" },
        { id: "c", text: "`git add .` → `git commit` → `git pull --rebase` → resolve any conflicts → `git push`" },
        { id: "d", text: "`git add .` → `git commit` → `git fetch` → `git push` (fetch alone prevents rejection)" }
      ],
      correct: "c",
      explanation: "The safe push sequence is: stage changes (`git add`), commit them, then `git pull --rebase` to fetch and replay your local commits on top of any new remote commits, resolve any conflicts that arise, and finally push. Using `--rebase` during pull avoids unnecessary merge commits and maintains a linear history. `--force` is dangerous on shared branches as it overwrites others' work. `git fetch` alone downloads changes but does not integrate them, so a subsequent push would still be rejected if your branch has diverged."
    },
    {
      id: "git-011",
      topic: "Git",
      subtopic: "Push Sequence",
      difficulty: "Hard",
      question: "You attempt `git push origin main` and receive a 'non-fast-forward' rejection. What does this error specifically indicate?",
      code: {
        language: "text",
        content: "! [rejected]        main -> main (non-fast-forward)\nerror: failed to push some refs to 'origin'\nhint: Updates were rejected because the tip of your current branch is behind"
      },
      options: [
        { id: "a", text: "Your local `main` branch does not exist on the remote yet, so you need `git push -u origin main`" },
        { id: "b", text: "The remote `main` has commits that your local `main` does not have, so pushing would lose those commits" },
        { id: "c", text: "You have uncommitted changes in your working directory that conflict with the remote" },
        { id: "d", text: "The remote repository's `main` branch is protected and does not accept direct pushes" }
      ],
      correct: "b",
      explanation: "A non-fast-forward rejection means the remote branch has diverged from your local branch — specifically, the remote has commits that are not in your local history. A fast-forward push is only possible when your local branch is strictly ahead of the remote. Git rejects the push to prevent losing those remote commits. The solution is to integrate the remote changes first (via `git pull` or `git pull --rebase`) and then push. A branch protection error would produce a different error message from the remote, typically mentioning branch protection rules."
    },
    {
      id: "git-012",
      topic: "Git",
      subtopic: "Force Push",
      difficulty: "Hard",
      question: "What advantage does `git push --force-with-lease` have over `git push --force`?",
      code: null,
      options: [
        { id: "a", text: "`--force-with-lease` compresses the pushed objects to reduce bandwidth usage compared to `--force`" },
        { id: "b", text: "`--force-with-lease` only force-pushes if the remote ref matches what you last fetched, preventing you from accidentally overwriting someone else's new commits" },
        { id: "c", text: "`--force-with-lease` creates a backup branch on the remote before overwriting, allowing recovery" },
        { id: "d", text: "`--force-with-lease` force-pushes only the commits that differ, while `--force` re-uploads all commits" }
      ],
      correct: "b",
      explanation: "`--force-with-lease` is a safer alternative to `--force` that performs a compare-and-swap check. It only allows the force push if the remote ref still points to the commit you expect (i.e., the value from your last fetch). If someone else has pushed new commits since your last fetch, the push is rejected, preventing you from silently overwriting their work. `--force` has no such check and will unconditionally overwrite the remote ref. Neither flag creates backup branches or affects data compression."
    },
    {
      id: "git-013",
      topic: "Git",
      subtopic: "Stash Advanced",
      difficulty: "Hard",
      question: "You are working on a feature branch with both tracked modifications and new untracked files. You need to stash everything to switch to a hotfix branch. Which command stashes both tracked and untracked files?",
      code: null,
      options: [
        { id: "a", text: "`git stash push` — it automatically includes untracked files by default" },
        { id: "b", text: "`git stash push -u` — the `-u` flag includes untracked files in addition to tracked modifications" },
        { id: "c", text: "`git stash push -p` — the `-p` flag stashes everything including ignored files" },
        { id: "d", text: "`git stash push --all` — while `-u` includes only indexed files, `--all` adds untracked files" }
      ],
      correct: "b",
      explanation: "`git stash push -u` (or `--include-untracked`) stashes tracked modifications AND untracked files. By default, `git stash` only stashes changes to tracked files, leaving untracked files in the working directory. The `-p` flag is for interactive/patch mode stashing, not for including all files. `--all` (or `-a`) includes both untracked AND ignored files, which is broader than `-u`. The distinction matters: `-u` is typically what you want for a hotfix switch since stashing ignored files (build artifacts, node_modules) is usually unnecessary."
    },
    {
      id: "git-014",
      topic: "Git",
      subtopic: "Stash Branch",
      difficulty: "Hard",
      question: "After stashing work, you realize the stashed changes would conflict with the current branch state. What does `git stash branch new-feature stash@{0}` do?",
      code: null,
      options: [
        { id: "a", text: "Creates a new branch `new-feature` from the current HEAD and applies the stash on top" },
        { id: "b", text: "Creates a new branch `new-feature` from the commit where the stash was originally created, applies the stash, and drops it from the stash list" },
        { id: "c", text: "Moves the stash entry to a new branch reference without applying it to the working directory" },
        { id: "d", text: "Creates a new branch `new-feature` from main and cherry-picks the stashed changes as a commit" }
      ],
      correct: "b",
      explanation: "`git stash branch <branchname> <stash>` creates a new branch starting from the commit at which the stash was originally recorded, checks it out, applies the stash on top, and if the application succeeds, drops the stash entry. This is specifically designed for the scenario where the branch has evolved since the stash was created and applying the stash would cause conflicts. By going back to the original commit, the stash applies cleanly. It does not create from HEAD or from main — it uses the parent commit stored in the stash ref."
    },
    {
      id: "git-015",
      topic: "Git",
      subtopic: "Merge Conflicts",
      difficulty: "Hard",
      question: "In a merge conflict, what do the conflict markers `<<<<<<<`, `=======`, and `>>>>>>>` represent?",
      code: {
        language: "text",
        content: "<<<<<<< HEAD\nconst port = 3000;\n=======\nconst port = 8080;\n>>>>>>> feature/config-update"
      },
      options: [
        { id: "a", text: "Above `=======` is the incoming branch's version; below is your current branch's version" },
        { id: "b", text: "Above `=======` is the common ancestor's version; below is the incoming branch's version" },
        { id: "c", text: "Above `=======` is your current branch's version (HEAD); below is the incoming branch's version being merged" },
        { id: "d", text: "Above `=======` is the remote repository's version; below is the stashed version being applied" }
      ],
      correct: "c",
      explanation: "In a merge conflict, the content between `<<<<<<< HEAD` and `=======` represents the version from your current branch (the one HEAD points to, i.e., the branch you were on when you ran `git merge`). The content between `=======` and `>>>>>>> branch-name` represents the version from the branch being merged in. The common ancestor (merge base) is not shown unless you enable `diff3` conflict style with `git config merge.conflictstyle diff3`. The first option reverses the positions, which is a very common misconception."
    },
    {
      id: "git-016",
      topic: "Git",
      subtopic: "Rerere",
      difficulty: "Hard",
      question: "What does enabling `git config rerere.enabled true` accomplish?",
      code: null,
      options: [
        { id: "a", text: "It automatically resolves all future merge conflicts by always choosing the current branch's version" },
        { id: "b", text: "It records how you resolve merge conflicts and automatically applies the same resolution if the identical conflict occurs again" },
        { id: "c", text: "It prevents merge conflicts by locking files that are being edited on multiple branches simultaneously" },
        { id: "d", text: "It creates a backup of conflicting files before the merge so you can restore them with `git rerere restore`" }
      ],
      correct: "b",
      explanation: "`rerere` stands for 'reuse recorded resolution'. When enabled, Git records conflict resolutions in a local cache. If the same conflict (identified by the conflicting hunks) appears again — for example, when re-rebasing a long-lived feature branch — Git automatically applies the previously recorded resolution. This is particularly useful in workflows involving repeated rebases or topic-branch integrations. It does not choose sides automatically, does not lock files, and does not create file backups."
    },
    {
      id: "git-017",
      topic: "Git",
      subtopic: "Cherry-Pick",
      difficulty: "Hard",
      question: "You need to apply a specific bugfix commit from `develop` to `main` without merging the entire branch. After running `git cherry-pick abc1234`, what is true about the resulting commit on `main`?",
      code: null,
      options: [
        { id: "a", text: "The commit on `main` has the same hash as `abc1234` because the content is identical" },
        { id: "b", text: "The commit on `main` has a new hash because it has a different parent, even though the diff is the same" },
        { id: "c", text: "The commit on `main` is a merge commit with two parents: the previous `main` HEAD and `abc1234`" },
        { id: "d", text: "The original commit `abc1234` is moved from `develop` to `main` and removed from `develop`'s history" }
      ],
      correct: "b",
      explanation: "Cherry-pick creates a new commit that applies the same changes (diff) as the source commit but with a different parent commit. Since a Git commit hash is computed from the content, parent hash, author info, and timestamps, the new commit will have a different hash even if the tree content is identical. Cherry-pick copies, it does not move — the original commit remains on `develop`. It is not a merge commit; it has a single parent (the previous HEAD of `main`). This is why cherry-picked commits can cause duplicate diffs if branches are later merged."
    },
    {
      id: "git-018",
      topic: "Git",
      subtopic: "Reset vs Revert",
      difficulty: "Hard",
      question: "A bad commit has been pushed to `main` and your teammates have already pulled it. What is the SAFEST way to undo this commit?",
      code: null,
      options: [
        { id: "a", text: "`git reset --hard HEAD~1` followed by `git push --force` to remove the commit from the remote" },
        { id: "b", text: "`git revert HEAD` to create a new commit that undoes the changes, then push normally" },
        { id: "c", text: "`git reset --soft HEAD~1` followed by `git push` to move the changes back to staging" },
        { id: "d", text: "`git checkout HEAD~1 -- .` followed by `git commit --amend` to overwrite the bad commit in place" }
      ],
      correct: "b",
      explanation: "`git revert` is the safest option for undoing changes on a shared branch because it creates a new commit that inverses the changes of the target commit, preserving the full history. Since teammates have already pulled the bad commit, force-pushing after a reset would cause their repositories to diverge from the remote, creating chaos. `reset --soft` followed by a normal `push` would be rejected as non-fast-forward anyway. `commit --amend` also rewrites history and would require a force push."
    },
    {
      id: "git-019",
      topic: "Git",
      subtopic: "Reflog Recovery",
      difficulty: "Hard",
      question: "You accidentally ran `git reset --hard HEAD~5` and lost your last 5 commits. How can you recover them?",
      code: null,
      options: [
        { id: "a", text: "Run `git fsck --lost-found` to find dangling blobs, then manually reconstruct each commit" },
        { id: "b", text: "Run `git reflog` to find the commit hash before the reset, then `git reset --hard <hash>` to restore your branch to that point" },
        { id: "c", text: "Run `git log --all` to find the lost commits since they are still visible in the full log" },
        { id: "d", text: "Run `git stash pop` since `reset --hard` automatically stashes discarded changes" }
      ],
      correct: "b",
      explanation: "The reflog records all updates to branch tips and HEAD in your local repository, including resets. After an accidental `reset --hard`, `git reflog` shows the commit hash that HEAD pointed to before the reset. You can then `git reset --hard <hash>` (or `git checkout -b recovery <hash>`) to restore the branch. `git log --all` would not show the lost commits because they are no longer reachable from any branch. `reset --hard` does not create stash entries. While `fsck --lost-found` can find dangling objects, reflog is the direct and practical recovery method."
    },
    {
      id: "git-020",
      topic: "Git",
      subtopic: "HEAD~ vs HEAD^",
      difficulty: "Hard",
      question: "Given a merge commit `M` with parents `P1` (first/main parent) and `P2` (merged branch), what does `M^2` refer to?",
      code: {
        language: "text",
        content: "# Commit graph:\n#   P1---M  (main, M is a merge commit)\n#   /   /\n#  P2--/  (feature)"
      },
      options: [
        { id: "a", text: "`M^2` refers to the grandparent of M — it goes back two generations on the first-parent chain" },
        { id: "b", text: "`M^2` refers to the second parent of the merge commit M, which is the tip of the branch that was merged in (P2)" },
        { id: "c", text: "`M^2` is invalid syntax and will produce an error; you should use `M~2` instead" },
        { id: "d", text: "`M^2` refers to the second commit before M, which is identical to `M~2`" }
      ],
      correct: "b",
      explanation: "The caret (`^`) operator with a number selects which parent to follow at a merge commit. `M^1` (or just `M^`) is the first parent, and `M^2` is the second parent. For merge commits, the first parent is the branch you were on when merging, and the second parent is the branch that was merged in. The tilde (`~`) operator, by contrast, follows the first-parent chain: `M~2` means 'the grandparent via the first parent', which is `P1`'s parent. The caret with a number is not about generations; it is about selecting among multiple parents of a single commit."
    },
    {
      id: "git-021",
      topic: "Git",
      subtopic: "Git Bisect",
      difficulty: "Hard",
      question: "You need to locate the commit that introduced a production regression using `git bisect`. Which sequence correctly represents the end-to-end `git bisect` workflow?",
      code: null,
      options: [
        { id: "a", text: "`git bisect start` → `git bisect bad` → `git bisect good <commit>` → test commits & mark good/bad → `git bisect reset`" },
        { id: "b", text: "`git bisect start` → `git bisect good` → `git bisect bad <commit>` → `git cherry-pick <commit>` → `git bisect stop`" },
        { id: "c", text: "`git bisect run` → `git bisect start` → mark each commit with `git tag` → `git bisect clean`" },
        { id: "d", text: "`git bisect init` → `git bisect test` → `git revert bad` → `git bisect finish`" }
      ],
      correct: "a",
      explanation: "The standard `git bisect` workflow begins with `git bisect start` to initialize the binary search session. You mark the current broken state with `git bisect bad`, then identify a known working ancestor with `git bisect good <commit>`. Git then checks out mid-point commits sequentially; after running your test on each revision, you tell Git whether it is good or bad via `git bisect good` or `git bisect bad`. Once the culprit commit is pinpointed, you conclude the session and return your working tree to its original HEAD state using `git bisect reset`. Ending with anything other than `git bisect reset` leaves your repository in a detached HEAD state inside the bisect session."
    },
    {
      id: "git-022",
      topic: "Git",
      subtopic: "Amending Commits",
      difficulty: "Hard",
      question: "You committed with the wrong author email. You run `git commit --amend --author=\"New Name <new@email.com>\"`. What happens to the original commit?",
      code: null,
      options: [
        { id: "a", text: "The original commit is updated in place with the new author; its hash remains the same" },
        { id: "b", text: "A new commit with a different hash replaces the original; the original becomes unreferenced but recoverable via reflog" },
        { id: "c", text: "A separate 'amendment' commit is created on top, and both commits appear in `git log`" },
        { id: "d", text: "Only the author metadata in `.git/config` is updated; the commit itself is not modified" }
      ],
      correct: "b",
      explanation: "`git commit --amend` does not modify the existing commit object. Since Git commit hashes are derived from all commit data (tree, parent, author, committer, message, timestamps), changing any of these fields produces a new commit with a different hash. The old commit object still exists in Git's object database and can be found via `git reflog` until garbage collection removes it. This is why amending a pushed commit requires a force push — the remote still has the original hash."
    },
    {
      id: "git-023",
      topic: "Git",
      subtopic: "Push Sequence",
      difficulty: "Hard",
      question: "What is the correct sequence of steps to push your very first commit to a new remote repository?",
      code: null,
      options: [
        { id: "a", text: "`git init` → `git add .` → `git commit -m 'init'` → `git remote add origin <url>` → `git push -u origin main`" },
        { id: "b", text: "`git remote add origin <url>` → `git init` → `git add .` → `git commit -m 'init'` → `git push origin main`" },
        { id: "c", text: "`git init` → `git remote add origin <url>` → `git push -u origin main` → `git add .` → `git commit -m 'init'`" },
        { id: "d", text: "`git init` → `git add .` → `git push -u origin main` → `git commit -m 'init'` → `git remote add origin <url>`" }
      ],
      correct: "a",
      explanation: "The correct sequence is: initialize the repository (`git init`), stage files (`git add .`), create the first commit (`git commit`), add the remote (`git remote add origin <url>`), and push with upstream tracking (`git push -u origin main`). You must init before adding a remote (can't add a remote to a non-repository). You must commit before pushing (can't push without at least one commit). The `-u` flag sets the upstream tracking relationship so future `git push` commands don't need to specify the remote and branch."
    },
    {
      id: "git-024",
      topic: "Git",
      subtopic: "Hotfix Workflow",
      difficulty: "Hard",
      question: "In the GitFlow workflow, you need to create an urgent hotfix. Which sequence correctly describes the hotfix workflow?",
      code: null,
      options: [
        { id: "a", text: "Branch from `develop` → fix the bug → merge into `main` → tag the release → delete the hotfix branch" },
        { id: "b", text: "Branch from `main` → fix the bug → merge into both `main` AND `develop` → tag the release on `main` → delete the hotfix branch" },
        { id: "c", text: "Branch from the latest release tag → fix the bug → merge into `develop` only → create a new release branch from `develop`" },
        { id: "d", text: "Branch from `main` → fix the bug → merge into `main` → tag the release → `develop` picks up the fix automatically at the next release merge" }
      ],
      correct: "b",
      explanation: "In GitFlow, hotfix branches are created from `main` (production) because they address urgent production issues. After the fix, the hotfix branch must be merged into BOTH `main` (to deploy the fix) AND `develop` (to ensure the fix is included in future development). A release tag is created on `main` after merging. Branching from `develop` would include unreleased features. The last option is wrong because `develop` does NOT automatically get the fix — it must be explicitly merged to prevent the bug from reappearing in the next release."
    },
    {
      id: "git-025",
      topic: "Git",
      subtopic: "Tracking Branches",
      difficulty: "Hard",
      question: "What does `git push -u origin feature` do that `git push origin feature` does not?",
      code: null,
      options: [
        { id: "a", text: "`-u` forces the push even if the remote branch has diverged, similar to `--force`" },
        { id: "b", text: "`-u` sets the upstream tracking relationship so that future `git push` and `git pull` on this branch work without specifying the remote and branch" },
        { id: "c", text: "`-u` creates the remote branch as protected, preventing force pushes from other contributors" },
        { id: "d", text: "`git push -u` uploads the entire repository history instead of only the new commits, ensuring a complete copy on the remote" }
      ],
      correct: "b",
      explanation: "The `-u` (or `--set-upstream`) flag tells Git to set the remote branch as the upstream tracking branch for your current local branch. Once set, subsequent `git push` and `git pull` commands can be used without arguments — Git knows which remote branch to push to and pull from. Without `-u`, each push requires explicitly specifying `origin feature`. The `-u` flag has nothing to do with force pushing, branch protection, or the amount of history transferred."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...gitQuestions);
})();
