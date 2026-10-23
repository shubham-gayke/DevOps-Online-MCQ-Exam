// GitHub Questions - 10 total (1 Easy, 3 Medium, 6 Hard)
// Topics: Actions (workflow, event, job, step, runner, uses vs run, secrets, matrix, cache, artifacts, needs),
// PR vs MR, merge commit vs squash vs rebase-and-merge, branch protection, CODEOWNERS, fork vs clone, workflow YAML

(function () {
  const githubQuestions = [
    // ── EASY (1) ──────────────────────────────────────────────────────────────
    {
      id: "github-001",
      topic: "GitHub",
      subtopic: "Fork vs Clone",
      difficulty: "Easy",
      question: "What is the primary difference between forking a repository on GitHub and cloning it?",
      code: null,
      options: [
        { id: "a", text: "Forking creates a server-side copy under your GitHub account, while cloning creates a local copy on your machine" },
        { id: "b", text: "Forking downloads the repository to your machine, while cloning creates a copy on GitHub's servers" },
        { id: "c", text: "Forking copies only the default branch, while cloning copies all branches and tags" },
        { id: "d", text: "Forking requires write access to the original repository, while cloning only needs read access" }
      ],
      correct: "a",
      explanation: "Forking is a GitHub (server-side) operation that creates an independent copy of a repository under your own GitHub account, maintaining a link to the original for pull requests. Cloning is a Git operation that downloads a repository (yours, a fork, or any accessible repo) to your local machine. You can fork without having write access to the original — that's the entire point of forking in open-source workflows. Both operations copy all branches and history, not just the default branch."
    },

    // ── MEDIUM (3) ─────────────────────────────────────────────────────────────
    {
      id: "github-002",
      topic: "GitHub",
      subtopic: "Actions Basics",
      difficulty: "Medium",
      question: "In GitHub Actions, what is the relationship between a workflow, a job, and a step?",
      code: null,
      options: [
        { id: "a", text: "A workflow contains one or more jobs, each job contains one or more steps, and steps are the smallest unit of execution" },
        { id: "b", text: "A job contains one or more workflows, each workflow contains steps, and workflows run in parallel by default" },
        { id: "c", text: "A step contains one or more jobs, each job is a separate workflow file, and steps trigger workflows" },
        { id: "d", text: "A workflow and a job are interchangeable terms; both contain steps that run sequentially on a runner" }
      ],
      correct: "a",
      explanation: "GitHub Actions has a clear hierarchy: a workflow (defined in a YAML file under `.github/workflows/`) is triggered by events and contains one or more jobs. Each job runs on a separate runner (virtual machine) and contains one or more steps. Steps run sequentially within a job and can be either shell commands (`run:`) or reusable actions (`uses:`). Jobs within a workflow run in parallel by default unless dependencies are declared with `needs:`. The terms are not interchangeable — they represent distinct levels of the execution hierarchy."
    },
    {
      id: "github-003",
      topic: "GitHub",
      subtopic: "Merge Strategies",
      difficulty: "Medium",
      question: "When merging a pull request on GitHub, what does the 'Squash and merge' option do differently from 'Create a merge commit'?",
      code: null,
      options: [
        { id: "a", text: "'Squash and merge' combines all PR commits into a single commit on the target branch with a linear history, while 'Create a merge commit' preserves all individual commits and creates a merge commit with two parents" },
        { id: "b", text: "'Squash and merge' deletes the source branch automatically while 'Create a merge commit' preserves it" },
        { id: "c", text: "'Squash and merge' applies commits one by one via rebase, while 'Create a merge commit' applies them all at once" },
        { id: "d", text: "'Squash and merge' only works with branches that have fewer than 10 commits, while 'Create a merge commit' has no limit" }
      ],
      correct: "a",
      explanation: "'Squash and merge' takes all commits from the pull request branch, combines their changes into a single new commit, and applies it to the target branch, producing a linear history. 'Create a merge commit' preserves all individual commits from the PR branch and creates a merge commit with two parents, showing the full branching history. Branch deletion is a separate option on GitHub and not tied to the merge strategy. The 'Rebase and merge' option is the one that replays commits individually, not squash."
    },
    {
      id: "github-004",
      topic: "GitHub",
      subtopic: "Branch Protection",
      difficulty: "Medium",
      question: "Which of the following is NOT a feature of GitHub branch protection rules?",
      code: null,
      options: [
        { id: "a", text: "Requiring pull request reviews before merging, with a configurable minimum number of approvals" },
        { id: "b", text: "Requiring status checks (e.g., CI pipelines) to pass before merging" },
        { id: "c", text: "Automatically resolving merge conflicts by choosing the target branch's version" },
        { id: "d", text: "Restricting which users or teams can push directly to the protected branch" }
      ],
      correct: "c",
      explanation: "GitHub branch protection rules can enforce required reviews, required status checks, restrict who can push, require signed commits, require linear history, and more. However, they do NOT automatically resolve merge conflicts — conflict resolution always requires human decision-making or explicit configuration in merge tooling. Branch protection is about access control and quality gates, not about altering the content of merges."
    },

    // ── HARD (6) ──────────────────────────────────────────────────────────────
    {
      id: "github-005",
      topic: "GitHub",
      subtopic: "Actions - uses vs run",
      difficulty: "Hard",
      question: "In a GitHub Actions workflow step, what is the difference between `uses:` and `run:`?",
      code: {
        language: "yaml",
        content: "steps:\n  - uses: actions/checkout@v4\n  - run: npm install && npm test"
      },
      options: [
        { id: "a", text: "`uses:` executes a shell command on the runner, while `run:` references a reusable action from the GitHub Marketplace" },
        { id: "b", text: "`uses:` references a reusable action (a pre-built Docker container or JavaScript action), while `run:` executes a shell command directly on the runner" },
        { id: "c", text: "`uses:` runs steps in parallel, while `run:` runs steps sequentially" },
        { id: "d", text: "`uses:` can only reference actions in the same repository, while `run:` can execute any command including remote scripts" }
      ],
      correct: "b",
      explanation: "`uses:` references a reusable action, which can be a JavaScript action, a Docker container action, or a composite action, typically from the GitHub Marketplace or another repository (e.g., `actions/checkout@v4`). `run:` executes shell commands directly on the runner's operating system. The first option reverses the definitions. `uses:` can reference actions from any public repository, the same repository, or Docker Hub, not just the same repository. Both `uses:` and `run:` steps execute sequentially within a job."
    },
    {
      id: "github-006",
      topic: "GitHub",
      subtopic: "Actions - Secrets and Matrix",
      difficulty: "Hard",
      question: "In a GitHub Actions workflow, how are encrypted secrets accessed and what is a key security restriction?",
      code: {
        language: "yaml",
        content: "steps:\n  - name: Deploy\n    env:\n      API_KEY: ${{ secrets.DEPLOY_API_KEY }}\n    run: ./deploy.sh"
      },
      options: [
        { id: "a", text: "Secrets are accessed via `${{ secrets.NAME }}` and are automatically available to all forks' pull request workflows for convenience" },
        { id: "b", text: "Secrets are accessed via `${{ env.NAME }}` and are encrypted at rest but visible in workflow logs for debugging" },
        { id: "c", text: "Secrets are accessed via `${{ secrets.NAME }}`, are masked in logs, and are NOT available to workflows triggered by pull requests from forks (by default)" },
        { id: "d", text: "Secrets are stored in the workflow YAML file itself and encrypted using the repository's deploy key" }
      ],
      correct: "c",
      explanation: "GitHub Actions secrets are accessed using the `${{ secrets.NAME }}` expression context. They are encrypted at rest, masked (redacted) in workflow logs to prevent accidental exposure, and critically, are NOT available to workflows triggered by `pull_request` events from forks by default. This prevents malicious fork PRs from exfiltrating secrets. The `${{ env.NAME }}` syntax accesses environment variables, not secrets directly. Secrets are never stored in the YAML file — they are configured in the repository or organization settings."
    },
    {
      id: "github-007",
      topic: "GitHub",
      subtopic: "Actions - needs and dependencies",
      difficulty: "Hard",
      question: "What does the `needs:` keyword do in a GitHub Actions workflow, and what happens if the needed job fails?",
      code: {
        language: "yaml",
        content: "jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm run build\n  test:\n    needs: build\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n  deploy:\n    needs: [build, test]\n    runs-on: ubuntu-latest\n    steps:\n      - run: ./deploy.sh"
      },
      options: [
        { id: "a", text: "`needs:` shares the runner and workspace between jobs so they can access each other's files directly" },
        { id: "b", text: "`needs:` creates a dependency graph — the dependent job waits for the needed job(s) to complete successfully, and skips if any needed job fails" },
        { id: "c", text: "`needs:` merges the steps of multiple jobs into a single job for efficiency" },
        { id: "d", text: "`needs:` only controls the display order in the GitHub UI but does not affect actual execution order" }
      ],
      correct: "b",
      explanation: "`needs:` defines job dependencies within a workflow. A job with `needs:` will not start until all the jobs it depends on have completed successfully. If any needed job fails, the dependent job is skipped by default (its status becomes 'skipped'). Each job still runs on its own fresh runner — `needs:` does NOT share runners or workspaces between jobs. To share files between jobs, you must use artifacts (`actions/upload-artifact` and `actions/download-artifact`). The `needs:` keyword directly controls execution order, not just UI display."
    },
    {
      id: "github-008",
      topic: "GitHub",
      subtopic: "CODEOWNERS",
      difficulty: "Hard",
      question: "Where must the `CODEOWNERS` file be placed, and what does it control?",
      code: {
        language: "text",
        content: "# CODEOWNERS\n*.js    @frontend-team\n/docs/  @docs-team\n*.tf    @infra-team"
      },
      options: [
        { id: "a", text: "It must be in the repository root and it assigns file ownership for billing purposes in GitHub Enterprise" },
        { id: "b", text: "It can be in the root, `docs/`, or `.github/` directory and it automatically requests reviews from the specified owners when a PR modifies matching files" },
        { id: "c", text: "It must be in `.github/` and it prevents specified teams from modifying matching files" },
        { id: "d", text: "It can be placed in any directory and it grants exclusive write access to matching files for the specified owners" }
      ],
      correct: "b",
      explanation: "The `CODEOWNERS` file can be placed in the repository root, the `docs/` directory, or the `.github/` directory. When a pull request modifies files that match patterns in `CODEOWNERS`, GitHub automatically requests reviews from the specified users or teams. Combined with branch protection rules requiring CODEOWNERS review, this ensures domain experts review relevant changes. CODEOWNERS does not restrict who can edit files or grant exclusive access — it only controls automatic review requests. It has nothing to do with billing."
    },
    {
      id: "github-009",
      topic: "GitHub",
      subtopic: "Actions - Workflow YAML",
      difficulty: "Hard",
      question: "What issue exists in this GitHub Actions workflow snippet?",
      code: {
        language: "yaml",
        content: "name: CI Pipeline\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        node-version: [16, 18, 20]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node }}\n      - run: npm ci && npm test"
      },
      options: [
        { id: "a", text: "The `on.push.branches` should use `branch` (singular), not `branches`" },
        { id: "b", text: "The matrix variable is defined as `node-version` but referenced as `matrix.node` — it should be `${{ matrix.node-version }}`" },
        { id: "c", text: "The `strategy.matrix` block is invalid because it should be nested under `steps:` instead of under `jobs.test:`" },
        { id: "d", text: "The `runs-on` value should specify a matrix variable since each Node version requires a different runner" }
      ],
      correct: "b",
      explanation: "The matrix defines a variable called `node-version` but the `setup-node` step references `${{ matrix.node }}`, which does not exist. The correct reference should be `${{ matrix.node-version }}`. This mismatch would cause the `setup-node` action to receive an empty value, likely defaulting to an unexpected Node.js version. The `branches` keyword (plural) is correct syntax. The `strategy.matrix` is correctly placed at the job level, not under steps. Different Node.js versions run on the same runner OS (Ubuntu) — the matrix creates parallel jobs, one per version."
    },
    {
      id: "github-010",
      topic: "GitHub",
      subtopic: "Actions - Cache and Artifacts",
      difficulty: "Hard",
      question: "What is the difference between `actions/cache` and `actions/upload-artifact` / `actions/download-artifact` in GitHub Actions?",
      code: null,
      options: [
        { id: "a", text: "`cache` stores dependencies across workflow runs to speed up builds (e.g., `node_modules`), while artifacts pass files between jobs in the same run or make them downloadable after the workflow completes" },
        { id: "b", text: "`cache` is used within a single job to share data between steps, while artifacts are used to share data between different workflow files" },
        { id: "c", text: "`cache` persists indefinitely and costs storage fees, while artifacts are automatically deleted after each workflow run completes" },
        { id: "d", text: "`cache` only works with npm and pip packages, while artifacts can store any file type" }
      ],
      correct: "a",
      explanation: "`actions/cache` is designed to persist and restore dependencies (like `node_modules`, pip packages, or Gradle caches) across workflow runs on the same branch, significantly speeding up builds by avoiding redundant downloads. Artifacts (`upload-artifact`/`download-artifact`) are meant to share files between jobs within a single workflow run (e.g., passing build output from a build job to a deploy job) and to make files available for download after the workflow finishes. Caches are not limited to specific package managers — they can cache any directory. Artifacts have a configurable retention period, not instant deletion."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...githubQuestions);
})();
