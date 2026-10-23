// Ansible Questions - 15 total (2 Easy, 5 Medium, 8 Hard)
// Topics: agentless architecture, inventory, group_vars/host_vars, ad-hoc commands,
// playbook structure, handlers/notify, idempotency, command vs shell vs raw,
// copy vs template, variable precedence, roles, Ansible Galaxy, Vault,
// block/rescue/always, serial, playbook code-reading

(function () {
  const ansibleQuestions = [
    // ── EASY (2) ──────────────────────────────────────────────────────────────
    {
      id: "ansible-001",
      topic: "Ansible",
      subtopic: "Agentless Architecture",
      difficulty: "Easy",
      question: "What does it mean that Ansible is 'agentless'?",
      code: null,
      options: [
        { id: "a", text: "Ansible requires a lightweight daemon to be pre-installed on all managed nodes, but it consumes minimal resources" },
        { id: "b", text: "Ansible does not require any agent software on managed nodes — it connects via SSH (Linux) or WinRM (Windows) and executes tasks remotely" },
        { id: "c", text: "Ansible uses a centralized agent on the control node that simulates remote execution without actually connecting to managed hosts" },
        { id: "d", text: "Ansible requires Docker containers to be running on each managed node to execute its modules" }
      ],
      correct: "b",
      explanation: "Ansible's agentless architecture means no special software needs to be installed or running on the managed (target) nodes. The control node connects to managed hosts using standard protocols — SSH for Linux/Unix systems and WinRM for Windows — pushes small modules to the remote system, executes them, and cleans up. This contrasts with tools like Puppet or Chef, which require agent daemons on each managed node. The only requirements on managed nodes are Python (for most modules) and SSH/WinRM access."
    },
    {
      id: "ansible-002",
      topic: "Ansible",
      subtopic: "Ad-hoc Commands",
      difficulty: "Easy",
      question: "What is the purpose of Ansible ad-hoc commands?",
      code: null,
      options: [
        { id: "a", text: "They are used to define reusable playbook tasks that can be shared across projects" },
        { id: "b", text: "They are one-liner commands for quick, one-time tasks on managed nodes without writing a full playbook" },
        { id: "c", text: "They automatically generate inventory files from cloud provider APIs" },
        { id: "d", text: "They are commands that run exclusively in Ansible Tower/AWX and cannot be used from the CLI" }
      ],
      correct: "b",
      explanation: "Ad-hoc commands allow you to execute quick, one-off tasks on managed nodes directly from the command line using `ansible <host-pattern> -m <module> -a <arguments>`. They are ideal for simple operations like restarting a service, copying a file, or checking disk space without the overhead of writing a full playbook. While convenient for ad-hoc operations, they do not provide the reusability, idempotency guarantees, or version control benefits of playbooks. They are a CLI feature, not limited to Ansible Tower."
    },

    // ── MEDIUM (5) ─────────────────────────────────────────────────────────────
    {
      id: "ansible-003",
      topic: "Ansible",
      subtopic: "Playbook Structure",
      difficulty: "Medium",
      question: "In an Ansible playbook, what does a 'play' consist of?",
      code: {
        language: "yaml",
        content: "---\n- name: Configure web servers\n  hosts: webservers\n  become: yes\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present"
      },
      options: [
        { id: "a", text: "A play maps a group of hosts to a set of tasks, defining which hosts run which tasks along with connection and privilege settings" },
        { id: "b", text: "A play is a single task within a playbook, such as installing a package or copying a file" },
        { id: "c", text: "A play is a collection of roles that are executed in parallel across all inventory hosts" },
        { id: "d", text: "A play is the YAML file itself — each playbook file contains exactly one play" }
      ],
      correct: "a",
      explanation: "A play is the fundamental unit of a playbook that maps a selection of hosts (specified by `hosts:`) to a set of tasks to be executed on those hosts. Each play includes a host selector, optional connection/privilege settings (`become`, `gather_facts`, etc.), and a list of tasks, roles, or both. A playbook is a YAML file that contains one or more plays (a list of plays). A task is a single action within a play (e.g., installing a package). Roles are reusable collections of tasks, not plays themselves."
    },
    {
      id: "ansible-004",
      topic: "Ansible",
      subtopic: "Handlers and Notify",
      difficulty: "Medium",
      question: "How do Ansible handlers differ from regular tasks?",
      code: null,
      options: [
        { id: "a", text: "Handlers run immediately when notified, while regular tasks wait until the end of the play" },
        { id: "b", text: "Handlers are tasks that only run when notified by another task's `notify` directive, and they execute once at the end of the play regardless of how many times they are notified" },
        { id: "c", text: "Handlers run on different hosts than the tasks that notify them, providing cross-host coordination" },
        { id: "d", text: "Handlers are tasks that run even when the playbook encounters an error, similar to a `finally` block" }
      ],
      correct: "b",
      explanation: "Handlers are special tasks defined under the `handlers:` section of a play. They are only executed when triggered by a `notify` directive from a regular task, and only if that task reports a 'changed' status. Critically, handlers run at the end of the play (or when explicitly flushed with `meta: flush_handlers`), and each handler runs only once even if notified multiple times. This makes them ideal for service restarts — you don't want to restart nginx three times if three configuration files changed. Handlers run on the same hosts as the tasks, not different ones."
    },
    {
      id: "ansible-005",
      topic: "Ansible",
      subtopic: "Idempotency",
      difficulty: "Medium",
      question: "What does idempotency mean in the context of Ansible, and which module is NOT idempotent by default?",
      code: null,
      options: [
        { id: "a", text: "Idempotency means running a task once produces the same result as running it multiple times; the `command` module is not idempotent because it always executes regardless of current state" },
        { id: "b", text: "Idempotency means tasks run in parallel for efficiency; the `copy` module is not idempotent because it always overwrites files" },
        { id: "c", text: "Idempotency means tasks automatically roll back on failure; the `apt` module is not idempotent because it downloads packages every run" },
        { id: "d", text: "Idempotency means each task generates a unique execution ID; the `template` module is not idempotent because it always re-renders templates" }
      ],
      correct: "a",
      explanation: "Idempotency means that applying an operation multiple times produces the same result as applying it once — the system reaches the desired state and stays there. Most Ansible modules (like `apt`, `copy`, `template`, `service`) are idempotent: they check the current state before making changes and report 'ok' (no change) if the desired state is already met. The `command` and `shell` modules are exceptions — they always execute the given command and report 'changed', because Ansible cannot know whether the command's effect is already in place. You can add `creates:` or `when:` conditions to make them conditionally idempotent."
    },
    {
      id: "ansible-006",
      topic: "Ansible",
      subtopic: "Inventory",
      difficulty: "Medium",
      question: "What is the purpose of `group_vars/` and `host_vars/` directories in Ansible?",
      code: null,
      options: [
        { id: "a", text: "`group_vars/` stores variables that apply to all hosts in a specific group, while `host_vars/` stores variables specific to individual hosts, providing layered variable assignment" },
        { id: "b", text: "`group_vars/` defines host groups, while `host_vars/` defines the SSH connection parameters for each host" },
        { id: "c", text: "`group_vars/` stores encrypted vault passwords, while `host_vars/` stores unencrypted variables" },
        { id: "d", text: "`group_vars/` and `host_vars/` are alternative locations for the inventory file, not for variables" }
      ],
      correct: "a",
      explanation: "`group_vars/` and `host_vars/` directories provide a clean way to organize variables in Ansible. Files in `group_vars/<groupname>.yml` automatically apply to all hosts in that inventory group, while files in `host_vars/<hostname>.yml` apply to specific individual hosts. This layered approach allows you to set defaults at the group level and override them per host when needed. These directories store variables, not inventory definitions or vault passwords (though variables within them can be vault-encrypted). Ansible automatically loads these files based on the directory naming convention."
    },
    {
      id: "ansible-007",
      topic: "Ansible",
      subtopic: "Copy vs Template",
      difficulty: "Medium",
      question: "When should you use the `template` module instead of the `copy` module in Ansible?",
      code: null,
      options: [
        { id: "a", text: "Use `template` when transferring binary files, and `copy` for text files only" },
        { id: "b", text: "Use `template` when the file contains Jinja2 variables or logic that need to be rendered with host-specific values before transfer, and `copy` for static files transferred as-is" },
        { id: "c", text: "Use `template` for files larger than 1MB, and `copy` for smaller files for performance" },
        { id: "d", text: "Use `template` for files from remote URLs, and `copy` for local files only" }
      ],
      correct: "b",
      explanation: "The `template` module processes files through the Jinja2 templating engine before transferring them to managed nodes. This allows you to use variables (`{{ variable }}`), conditionals (`{% if %}`), and loops (`{% for %}`) to generate host-specific configuration files. The `copy` module transfers files as-is without any processing. Use `template` for configuration files that need to vary per host (like nginx configs with different server names) and `copy` for static files (like scripts or certificates). Neither module's choice depends on file size or whether the source is a URL."
    },

    // ── HARD (8) ──────────────────────────────────────────────────────────────
    {
      id: "ansible-008",
      topic: "Ansible",
      subtopic: "Command vs Shell vs Raw",
      difficulty: "Hard",
      question: "What is the key difference between the `command`, `shell`, and `raw` modules in Ansible?",
      code: null,
      options: [
        { id: "a", text: "`command` executes without a shell (no pipes/redirects/variables), `shell` executes through `/bin/sh` (supports pipes/redirects), and `raw` sends the command over SSH without requiring Python on the target" },
        { id: "b", text: "`command` runs as root, `shell` runs as the connecting user, and `raw` runs in a sandboxed container" },
        { id: "c", text: "`command` is for Linux, `shell` is for Windows, and `raw` is for network devices only" },
        { id: "d", text: "`command` runs synchronously, `shell` runs asynchronously, and `raw` runs in the background without waiting for output" }
      ],
      correct: "a",
      explanation: "The `command` module executes a command directly without passing it through a shell, meaning shell-specific features like pipes (`|`), redirects (`>`), environment variable expansion, and glob patterns do not work. The `shell` module passes the command through `/bin/sh`, enabling all shell features. The `raw` module sends the command directly over SSH without using Ansible's module subsystem, meaning it does not require Python to be installed on the target — this is useful for bootstrapping systems or managing devices without Python. All three modules run with whatever user privileges are configured (become/sudo)."
    },
    {
      id: "ansible-009",
      topic: "Ansible",
      subtopic: "Variable Precedence",
      difficulty: "Hard",
      question: "In Ansible's variable precedence order, which variable source takes the HIGHEST precedence?",
      code: null,
      options: [
        { id: "a", text: "Variables defined in `group_vars/all.yml` because they apply to all hosts universally" },
        { id: "b", text: "Variables defined in a role's `defaults/main.yml` because role defaults are the intended fallback" },
        { id: "c", text: "Extra variables passed on the command line with `-e` (e.g., `ansible-playbook -e \"var=value\"`) because they are the highest priority override" },
        { id: "d", text: "Variables defined in `host_vars/<hostname>.yml` because host-specific variables are the most specific" }
      ],
      correct: "c",
      explanation: "Ansible has 22 levels of variable precedence. Extra variables passed with `-e` on the command line have the absolute highest precedence and override ALL other variable definitions. Role `defaults/main.yml` has the LOWEST precedence (it's meant to be easily overridden). In between, the general order (low to high) is: role defaults → inventory vars → group_vars → host_vars → play vars → role vars → task vars → set_facts → extra vars. This design allows command-line overrides to always win, which is essential for CI/CD pipelines and emergency overrides."
    },
    {
      id: "ansible-010",
      topic: "Ansible",
      subtopic: "Roles Directory Structure",
      difficulty: "Hard",
      question: "In an Ansible role's directory structure, what is the difference between `defaults/main.yml` and `vars/main.yml`?",
      code: {
        language: "text",
        content: "roles/\n  webserver/\n    defaults/\n      main.yml    # ← ?\n    vars/\n      main.yml    # ← ?\n    tasks/\n      main.yml\n    handlers/\n      main.yml\n    templates/\n    files/\n    meta/\n      main.yml"
      },
      options: [
        { id: "a", text: "`defaults/` contains variables that can be easily overridden by the playbook or inventory (lowest precedence), while `vars/` contains variables with higher precedence that are harder to override" },
        { id: "b", text: "`defaults/` stores default values for optional parameters, while `vars/` stores environment variables exported to the shell" },
        { id: "c", text: "`defaults/` contains variables for development environments, while `vars/` contains variables for production" },
        { id: "d", text: "`defaults/` is loaded only when the role is first applied, while `vars/` is loaded on every subsequent run" }
      ],
      correct: "a",
      explanation: "`defaults/main.yml` holds variables with the lowest precedence in Ansible's variable hierarchy. These are meant to be default values that role users can easily override through inventory, playbook vars, group_vars, or any other variable source. `vars/main.yml` holds variables with much higher precedence, making them difficult to override — they're intended for internal role constants that should not typically be changed by role consumers. The distinction is entirely about precedence, not about environments, loading timing, or shell variables."
    },
    {
      id: "ansible-011",
      topic: "Ansible",
      subtopic: "Ansible Galaxy",
      difficulty: "Hard",
      question: "What does `ansible-galaxy init myrole` do, and how does it differ from `ansible-galaxy install`?",
      code: null,
      options: [
        { id: "a", text: "`init` downloads and installs a role from Ansible Galaxy into the roles path, while `install` creates a new local role skeleton directory structure" },
        { id: "b", text: "`init` creates a new role skeleton with the standard directory structure (tasks, handlers, defaults, vars, etc.), while `install` downloads roles from Ansible Galaxy or a `requirements.yml` file" },
        { id: "c", text: "`init` initializes the Ansible Galaxy API authentication, while `install` downloads role dependencies" },
        { id: "d", text: "`init` converts a playbook into a role format, while `install` copies roles between projects" }
      ],
      correct: "b",
      explanation: "`ansible-galaxy init <rolename>` creates a new local directory with the standard Ansible role directory structure (tasks/, handlers/, defaults/, vars/, files/, templates/, meta/, tests/), giving you a scaffold to start developing a new role. `ansible-galaxy install <rolename>` downloads and installs an existing role from Ansible Galaxy (the public role repository) or from other sources specified in a `requirements.yml` file. The commands are complementary: `init` is for creating roles, `install` is for consuming roles. `init` does not interact with the Galaxy API or download anything."
    },
    {
      id: "ansible-012",
      topic: "Ansible",
      subtopic: "Ansible Vault",
      difficulty: "Hard",
      question: "What does Ansible Vault provide, and how are vault-encrypted files used in playbooks?",
      code: null,
      options: [
        { id: "a", text: "Vault encrypts entire playbook YAML files so they cannot be executed without the vault password; encrypted playbooks run 50% slower due to decryption overhead" },
        { id: "b", text: "Vault provides at-rest encryption for sensitive data (passwords, keys, credentials) using AES-256; encrypted files or variables are seamlessly decrypted at runtime when the vault password is provided via `--ask-vault-pass` or a password file" },
        { id: "c", text: "Vault stores secrets in a centralized HashiCorp Vault server that Ansible queries at runtime for each variable" },
        { id: "d", text: "Vault encrypts network traffic between the control node and managed hosts, replacing SSH encryption" }
      ],
      correct: "b",
      explanation: "Ansible Vault encrypts sensitive data at rest using AES-256 symmetric encryption. You can encrypt entire files (`ansible-vault encrypt file.yml`) or individual variables (`!vault` tag with `ansible-vault encrypt_string`). When running a playbook, the vault password is provided via `--ask-vault-pass`, `--vault-password-file`, or environment variable, and Ansible seamlessly decrypts the data at runtime. Ansible Vault is separate from HashiCorp Vault (though Ansible has a lookup plugin for HashiCorp Vault). It does not replace SSH encryption — it's specifically for protecting secrets stored in version control."
    },
    {
      id: "ansible-013",
      topic: "Ansible",
      subtopic: "Block/Rescue/Always",
      difficulty: "Hard",
      question: "What is the purpose of `block`, `rescue`, and `always` in Ansible, and how do they relate to error handling?",
      code: {
        language: "yaml",
        content: "- block:\n    - name: Install app\n      apt:\n        name: myapp\n        state: present\n    - name: Start app\n      service:\n        name: myapp\n        state: started\n  rescue:\n    - name: Rollback\n      apt:\n        name: myapp\n        state: absent\n  always:\n    - name: Send notification\n      mail:\n        to: ops@example.com\n        subject: \"Deployment update\""
      },
      options: [
        { id: "a", text: "`block` groups tasks that run in parallel, `rescue` retries failed tasks up to 3 times, and `always` logs task output to a file" },
        { id: "b", text: "`block` groups tasks to apply common directives; if any task in `block` fails, `rescue` tasks run as error recovery; `always` tasks run regardless of success or failure, similar to try/catch/finally" },
        { id: "c", text: "`block` defines a transaction that is committed atomically, `rescue` rolls back the entire transaction, and `always` commits the transaction" },
        { id: "d", text: "`block` runs tasks on the control node, `rescue` runs tasks on failed hosts only, and `always` runs tasks on all hosts" }
      ],
      correct: "b",
      explanation: "`block`/`rescue`/`always` in Ansible provides error handling similar to try/catch/finally in programming languages. `block` groups tasks together (they can also share common directives like `become`, `when`, etc.). If any task within the `block` fails, execution jumps to the `rescue` section, which contains recovery/rollback tasks. The `always` section runs regardless of whether the block succeeded or failed, making it ideal for cleanup or notification tasks. Tasks do not run in parallel within a block, there is no retry mechanism built in (that's the `retries` directive), and all sections run on the same hosts."
    },
    {
      id: "ansible-014",
      topic: "Ansible",
      subtopic: "Serial",
      difficulty: "Hard",
      question: "What does the `serial` keyword control in an Ansible play, and why is it important for rolling deployments?",
      code: {
        language: "yaml",
        content: "- name: Rolling update\n  hosts: webservers\n  serial: 2\n  tasks:\n    - name: Update application\n      apt:\n        name: myapp\n        state: latest\n    - name: Restart service\n      service:\n        name: myapp\n        state: restarted"
      },
      options: [
        { id: "a", text: "`serial` defines the number of tasks to run in parallel within each host" },
        { id: "b", text: "`serial` controls how many hosts are processed in each batch — with `serial: 2`, Ansible runs the entire play on 2 hosts at a time before moving to the next 2, enabling rolling updates without taking all hosts offline simultaneously" },
        { id: "c", text: "`serial` sets the maximum number of SSH connections open at any time" },
        { id: "d", text: "`serial` forces tasks to run one after another instead of in parallel, effectively serializing the entire play" }
      ],
      correct: "b",
      explanation: "`serial` controls the batch size for play execution. By default, Ansible runs a play against all hosts in the target group simultaneously. With `serial: 2`, Ansible processes only 2 hosts at a time — running ALL tasks in the play on those 2 hosts before moving to the next batch of 2. This is critical for rolling deployments: it ensures some hosts remain online serving traffic while others are being updated. If a batch fails, subsequent batches are not executed, limiting the blast radius. `serial` can also be a percentage (e.g., `serial: 25%`) or a list for increasing batch sizes."
    },
    {
      id: "ansible-015",
      topic: "Ansible",
      subtopic: "Playbook Code Reading",
      difficulty: "Hard",
      question: "What will happen when this playbook runs on a fresh Ubuntu server?",
      code: {
        language: "yaml",
        content: "---\n- name: Setup web server\n  hosts: webservers\n  become: yes\n  vars:\n    http_port: 8080\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present\n      notify: Restart nginx\n\n    - name: Deploy config\n      template:\n        src: nginx.conf.j2\n        dest: /etc/nginx/nginx.conf\n      notify: Restart nginx\n\n  handlers:\n    - name: Restart nginx\n      service:\n        name: nginx\n        state: restarted"
      },
      options: [
        { id: "a", text: "Nginx is installed, the config is deployed, and nginx is restarted twice — once after each notifying task" },
        { id: "b", text: "Nginx is installed, the config is deployed, and nginx is restarted once at the end of the play — even though two tasks notified the handler" },
        { id: "c", text: "Nginx is installed and the config is deployed, but the handler never runs because `notify` only works with `changed_when` conditions" },
        { id: "d", text: "The playbook fails because handlers cannot be notified by multiple tasks with the same handler name" }
      ],
      correct: "b",
      explanation: "On a fresh server, both the `apt` install task and the `template` task will report 'changed' status and both will notify the 'Restart nginx' handler. However, handlers run only once at the end of the play, regardless of how many tasks notify them. This is by design — it prevents unnecessary service restarts. The handler only needs the service to be restarted once after all configuration changes are complete. Multiple tasks can notify the same handler, and `notify` works based on the task's changed/ok status, not on a `changed_when` condition."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...ansibleQuestions);
})();
