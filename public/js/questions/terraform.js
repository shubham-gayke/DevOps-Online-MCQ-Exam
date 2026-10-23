// Terraform Questions - 15 total (2 Easy, 5 Medium, 8 Hard)
// Topics: init/validate/plan/apply/destroy, providers, resources vs data sources,
// variables/outputs/locals, state and remote backend, state mv/rm, import, drift,
// -replace vs taint, modules, workspaces, count vs for_each, depends_on,
// lifecycle, .terraform.lock.hcl, HCL code-reading

(function () {
  const terraformQuestions = [
    // ── EASY (2) ──────────────────────────────────────────────────────────────
    {
      id: "tf-001",
      topic: "Terraform",
      subtopic: "Core Workflow",
      difficulty: "Easy",
      question: "What is the correct order of the core Terraform commands to provision infrastructure for the first time?",
      code: null,
      options: [
        { id: "a", text: "`terraform plan` → `terraform init` → `terraform apply` → `terraform validate`" },
        { id: "b", text: "`terraform init` → `terraform validate` → `terraform plan` → `terraform apply`" },
        { id: "c", text: "`terraform apply` → `terraform init` → `terraform plan` → `terraform destroy`" },
        { id: "d", text: "`terraform init` → `terraform apply` → `terraform plan` → `terraform validate`" }
      ],
      correct: "b",
      explanation: "The correct Terraform workflow is: `init` (downloads providers and initializes the backend), `validate` (checks configuration syntax and internal consistency), `plan` (previews changes that will be made), and `apply` (executes the changes). `init` must come first because all other commands require initialized providers and backend. Running `plan` or `validate` before `init` would fail because the required provider plugins are not yet available."
    },
    {
      id: "tf-002",
      topic: "Terraform",
      subtopic: "Resources vs Data Sources",
      difficulty: "Easy",
      question: "What is the difference between a `resource` block and a `data` block in Terraform?",
      code: null,
      options: [
        { id: "a", text: "A `resource` block creates and manages infrastructure, while a `data` block reads information from existing infrastructure without managing it" },
        { id: "b", text: "A `resource` block defines variables, while a `data` block defines outputs" },
        { id: "c", text: "A `resource` block is used for cloud resources, while a `data` block is used for local file operations only" },
        { id: "d", text: "A `resource` block runs during `apply`, while a `data` block runs during `init`" }
      ],
      correct: "a",
      explanation: "A `resource` block declares infrastructure that Terraform creates, updates, and deletes — it represents managed infrastructure. A `data` block (data source) queries existing infrastructure or external data and makes the information available to the configuration, but Terraform does not manage the lifecycle of data sources. For example, you might use a data source to look up an existing VPC ID to reference in a new resource. Data sources are evaluated during `plan` and `apply`, not during `init`."
    },

    // ── MEDIUM (5) ─────────────────────────────────────────────────────────────
    {
      id: "tf-003",
      topic: "Terraform",
      subtopic: "Variables and Locals",
      difficulty: "Medium",
      question: "What is the difference between `variable`, `local`, and `output` blocks in Terraform?",
      code: null,
      options: [
        { id: "a", text: "`variable` defines input parameters for a module, `local` defines computed intermediate values within a module, and `output` exposes values from a module to its caller" },
        { id: "b", text: "`variable` stores state data, `local` stores temporary data during plan, and `output` writes data to external systems" },
        { id: "c", text: "`variable` and `local` are interchangeable for defining parameters, while `output` is used only for debugging" },
        { id: "d", text: "`variable` defines resource attributes, `local` defines provider configuration, and `output` defines data source queries" }
      ],
      correct: "a",
      explanation: "`variable` blocks define input parameters that can be set by the caller (via CLI, `.tfvars` files, environment variables, or module arguments). `locals` blocks define named expressions computed within the module, useful for reducing repetition or building complex values from inputs. `output` blocks expose values from the module, making them available to parent modules or displaying them after `apply`. They are not interchangeable — variables receive external input, locals are internal computations, and outputs are exported values."
    },
    {
      id: "tf-004",
      topic: "Terraform",
      subtopic: "State and Remote Backend",
      difficulty: "Medium",
      question: "Why is a remote backend with state locking important for team-based Terraform workflows?",
      code: null,
      options: [
        { id: "a", text: "It encrypts all Terraform configuration files so only authorized team members can read the HCL code" },
        { id: "b", text: "It stores the state file remotely so all team members share a single source of truth, and locking prevents concurrent modifications that could corrupt state" },
        { id: "c", text: "It automatically applies changes when the state file is modified, eliminating the need for `terraform apply`" },
        { id: "d", text: "It creates separate state files for each team member so they can work on different resources independently" }
      ],
      correct: "b",
      explanation: "A remote backend (e.g., S3 + DynamoDB, Terraform Cloud, Azure Blob) stores the state file in a shared location accessible to all team members, ensuring everyone works against the same state. State locking (e.g., using DynamoDB for S3 backend) prevents two team members from running `terraform apply` simultaneously, which could lead to race conditions and state corruption. The remote backend does not encrypt HCL files (those are in version control), does not auto-apply changes, and does not create per-user state files."
    },
    {
      id: "tf-005",
      topic: "Terraform",
      subtopic: "Count vs For Each",
      difficulty: "Medium",
      question: "When creating multiple similar resources, what is a key difference between `count` and `for_each`?",
      code: null,
      options: [
        { id: "a", text: "`count` creates resources identified by numeric index, while `for_each` creates resources identified by string keys from a map or set, making `for_each` safer when items are added or removed in the middle" },
        { id: "b", text: "`count` can only create up to 10 resources, while `for_each` has no limit" },
        { id: "c", text: "`count` works with all resource types, while `for_each` only works with data sources" },
        { id: "d", text: "`count` runs resources in parallel, while `for_each` runs them sequentially" }
      ],
      correct: "a",
      explanation: "`count` creates resources indexed by position (0, 1, 2, ...). If you remove an item from the middle of the list, all subsequent resources shift indices, causing unnecessary destruction and recreation. `for_each` uses string keys from a map or set, so each resource has a stable identity (e.g., `aws_instance.server[\"web\"]`). Adding or removing items only affects the specific keyed resource, not others. Both work with any resource type, have no practical count limit, and Terraform manages parallelism based on the dependency graph regardless of which meta-argument is used."
    },
    {
      id: "tf-006",
      topic: "Terraform",
      subtopic: "Providers",
      difficulty: "Medium",
      question: "What is the role of a provider in Terraform, and where are provider configurations typically defined?",
      code: null,
      options: [
        { id: "a", text: "A provider is a plugin that translates Terraform API calls into cloud-provider-specific API calls; it is configured in a `provider` block in the root module and inherited by child modules" },
        { id: "b", text: "A provider is a Terraform backend that stores state files; it is configured in the `terraform` block" },
        { id: "c", text: "A provider is a CI/CD pipeline that deploys Terraform code; it is configured in `.github/workflows/`" },
        { id: "d", text: "A provider is a Terraform module from the registry; it is referenced using `module` blocks" }
      ],
      correct: "a",
      explanation: "Providers are plugins responsible for understanding API interactions with specific platforms (AWS, Azure, GCP, etc.). They are configured in `provider` blocks (e.g., `provider \"aws\" { region = \"us-east-1\" }`) typically in the root module. Child modules inherit provider configurations from the root module by default. Providers are distinct from backends (which handle state storage) and modules (which are reusable configuration packages). The `terraform` block specifies required providers and their versions, but the actual provider configuration is in the `provider` block."
    },
    {
      id: "tf-007",
      topic: "Terraform",
      subtopic: "Workspaces",
      difficulty: "Medium",
      question: "What is the purpose of Terraform workspaces?",
      code: null,
      options: [
        { id: "a", text: "Workspaces provide completely separate Terraform configurations for different projects within the same directory" },
        { id: "b", text: "Workspaces allow multiple distinct state files for the same configuration, often used to manage separate environments like dev, staging, and production" },
        { id: "c", text: "Workspaces enable multiple team members to edit the same Terraform files simultaneously with conflict resolution" },
        { id: "d", text: "Workspaces provide isolated provider credential storage so different environments use different cloud accounts" }
      ],
      correct: "b",
      explanation: "Terraform workspaces allow you to maintain multiple state files for the same configuration, enabling you to deploy the same infrastructure definition to different environments (e.g., dev, staging, production) without duplicating code. The current workspace name is available via `terraform.workspace`, which can be used to customize resource names or configurations per environment. Workspaces share the same configuration files and provider settings — they only separate state. For truly separate configurations or credentials, most teams use separate directories or variable files."
    },

    // ── HARD (8) ──────────────────────────────────────────────────────────────
    {
      id: "tf-008",
      topic: "Terraform",
      subtopic: "State Management",
      difficulty: "Hard",
      question: "You have renamed a resource from `aws_instance.web` to `aws_instance.app_server` in your Terraform configuration. Without any additional action, what will `terraform plan` show?",
      code: null,
      options: [
        { id: "a", text: "Terraform will detect the rename and update the state automatically with no infrastructure changes" },
        { id: "b", text: "Terraform will plan to destroy `aws_instance.web` and create a new `aws_instance.app_server`, because it sees one resource removed and one added" },
        { id: "c", text: "Terraform will show an error because resource addresses cannot be changed after creation" },
        { id: "d", text: "Terraform will show no changes because it tracks resources by their cloud provider ID, not by the Terraform resource name" }
      ],
      correct: "b",
      explanation: "Terraform tracks resources by their address in the state file (e.g., `aws_instance.web`). When you rename a resource in the configuration, Terraform has no way to automatically connect the old state entry to the new name. It sees `aws_instance.web` as removed (plan: destroy) and `aws_instance.app_server` as new (plan: create). To avoid destruction, you must run `terraform state mv aws_instance.web aws_instance.app_server` before applying, or use the `moved` block (Terraform 1.1+). Terraform does not track by cloud provider ID for identity mapping."
    },
    {
      id: "tf-009",
      topic: "Terraform",
      subtopic: "Import",
      difficulty: "Hard",
      question: "What does `terraform import aws_instance.web i-0abc123def456` do, and what is a critical limitation?",
      code: null,
      options: [
        { id: "a", text: "It imports the EC2 instance into the state file AND automatically generates the corresponding HCL configuration in your `.tf` files" },
        { id: "b", text: "It imports the EC2 instance into the state file but does NOT generate configuration — you must write the matching `resource` block yourself, or `plan` will show the resource for destruction" },
        { id: "c", text: "It creates a snapshot of the EC2 instance and stores it as a Terraform module for reuse" },
        { id: "d", text: "It migrates the EC2 instance from one AWS account to another and updates the Terraform state to reflect the new account" }
      ],
      correct: "b",
      explanation: "`terraform import` adds an existing resource to the Terraform state file, associating the real infrastructure object with a Terraform resource address. However, it does NOT generate the HCL configuration code — you must manually write a `resource` block that matches the imported resource's attributes. If the configuration does not match or is missing, the next `terraform plan` will show changes or even destruction. As of Terraform 1.5, the `import` block in configuration can help with this, and `terraform plan -generate-config-out` can generate starter configuration, but the classic CLI `import` does not."
    },
    {
      id: "tf-010",
      topic: "Terraform",
      subtopic: "Drift Detection",
      difficulty: "Hard",
      question: "Someone manually changed an AWS security group rule that Terraform manages. What happens during the next `terraform plan`?",
      code: null,
      options: [
        { id: "a", text: "Terraform ignores manual changes because it only tracks its own modifications to infrastructure" },
        { id: "b", text: "Terraform detects the drift by comparing the real infrastructure state (via API calls) with the desired state in the configuration, and plans to revert the manual change" },
        { id: "c", text: "Terraform updates its state file to match the manual change and shows no planned modifications" },
        { id: "d", text: "Terraform fails with an error because the state file checksum no longer matches the real infrastructure" }
      ],
      correct: "b",
      explanation: "During `terraform plan`, Terraform refreshes its understanding of the real infrastructure by querying the cloud provider's APIs. It compares this real state against the desired state defined in the configuration. Any differences (drift) — whether from manual changes, other tools, or external processes — are detected and Terraform plans to reconcile the infrastructure back to the configuration's desired state. Terraform does not ignore manual changes, does not silently update its state to match drift, and does not fail with checksum errors. The refresh-then-diff process is fundamental to Terraform's declarative model."
    },
    {
      id: "tf-011",
      topic: "Terraform",
      subtopic: "Replace vs Taint",
      difficulty: "Hard",
      question: "What is the difference between `terraform taint` and `terraform apply -replace`?",
      code: null,
      options: [
        { id: "a", text: "`taint` marks a resource in the state for recreation on the next apply and modifies the state file immediately, while `-replace` is a plan-time flag that achieves the same result without modifying the state file beforehand" },
        { id: "b", text: "`taint` destroys the resource immediately, while `-replace` only recreates it during the next `apply`" },
        { id: "c", text: "`taint` works on modules only, while `-replace` works on individual resources" },
        { id: "d", text: "`taint` is used for data sources, while `-replace` is used for managed resources" }
      ],
      correct: "a",
      explanation: "`terraform taint` modifies the state file to mark a specific resource as 'tainted', meaning Terraform will plan to destroy and recreate it on the next `apply`. However, this is now deprecated in favor of `terraform apply -replace=RESOURCE`, which achieves the same forced recreation as a plan-time flag without modifying the state file. The `-replace` approach is safer because it is part of the plan/apply workflow and can be reviewed before execution. `taint` does not destroy anything immediately — it only marks the resource. Both work on managed resources, not data sources."
    },
    {
      id: "tf-012",
      topic: "Terraform",
      subtopic: "Lifecycle Rules",
      difficulty: "Hard",
      question: "What does the `create_before_destroy` lifecycle rule accomplish, and when is it essential?",
      code: {
        language: "hcl",
        content: "resource \"aws_instance\" \"web\" {\n  ami           = var.ami_id\n  instance_type = \"t3.medium\"\n\n  lifecycle {\n    create_before_destroy = true\n  }\n}"
      },
      options: [
        { id: "a", text: "It creates a backup instance before destroying the current one; the backup is kept if the new creation fails" },
        { id: "b", text: "It reverses the default destroy-then-create order so the replacement resource is created before the old one is destroyed, reducing downtime for resources that cannot tolerate being absent" },
        { id: "c", text: "It prevents the resource from ever being destroyed, even during `terraform destroy`" },
        { id: "d", text: "It creates the resource in a staging environment first, validates it, and then promotes it to production" }
      ],
      correct: "b",
      explanation: "When Terraform needs to replace a resource (e.g., due to a change in an attribute that forces recreation), it normally destroys the existing resource first and then creates the new one. `create_before_destroy = true` reverses this order: the new resource is created first, and only after successful creation is the old resource destroyed. This is essential for resources like DNS records, load balancer attachments, or instances behind auto-scaling groups where zero downtime is required. `prevent_destroy = true` is the separate lifecycle rule that prevents destruction."
    },
    {
      id: "tf-013",
      topic: "Terraform",
      subtopic: "Depends On",
      difficulty: "Hard",
      question: "When should you use the explicit `depends_on` meta-argument in Terraform?",
      code: null,
      options: [
        { id: "a", text: "For every resource that uses another resource's output, to ensure correct ordering" },
        { id: "b", text: "Only when there is a dependency that Terraform cannot automatically detect from resource references — such as a dependency based on infrastructure behavior rather than data flow" },
        { id: "c", text: "To create circular dependencies between resources that need to be created simultaneously" },
        { id: "d", text: "To force parallel creation of resources that Terraform would otherwise create sequentially" }
      ],
      correct: "b",
      explanation: "`depends_on` should only be used for hidden dependencies that Terraform cannot infer from the configuration. Terraform automatically detects dependencies when one resource references another's attributes (e.g., `subnet_id = aws_subnet.main.id`). `depends_on` is needed when a dependency exists at the infrastructure level but is not expressed through data references — for example, an IAM policy that must exist before an EC2 instance can use a role, even if the instance doesn't directly reference the policy. Using `depends_on` unnecessarily reduces parallelism and makes configurations harder to maintain. Terraform does not support circular dependencies."
    },
    {
      id: "tf-014",
      topic: "Terraform",
      subtopic: "Lock File",
      difficulty: "Hard",
      question: "What is the purpose of `.terraform.lock.hcl` and should it be committed to version control?",
      code: null,
      options: [
        { id: "a", text: "It locks the state file to prevent concurrent access; it should NOT be committed because it contains sensitive state data" },
        { id: "b", text: "It records the exact provider versions and their checksums to ensure consistent installations across all team members; it SHOULD be committed to version control" },
        { id: "c", text: "It contains the backend configuration including credentials; it should be in `.gitignore` for security" },
        { id: "d", text: "It records which modules have been downloaded; it is auto-generated and should NOT be committed" }
      ],
      correct: "b",
      explanation: "`.terraform.lock.hcl` (introduced in Terraform 0.14) is the dependency lock file that records the exact versions and cryptographic checksums (hashes) of provider plugins used by the configuration. It ensures that every team member and CI/CD pipeline uses exactly the same provider versions, preventing subtle behavioral differences from provider updates. HashiCorp explicitly recommends committing this file to version control. It does NOT contain state data, credentials, or module references. The `.terraform/` directory (which contains downloaded providers and modules) is what should be gitignored."
    },
    {
      id: "tf-015",
      topic: "Terraform",
      subtopic: "HCL Code Reading",
      difficulty: "Hard",
      question: "What does this Terraform configuration create?",
      code: {
        language: "hcl",
        content: "variable \"environments\" {\n  default = [\"dev\", \"staging\", \"prod\"]\n}\n\nresource \"aws_s3_bucket\" \"app\" {\n  count  = length(var.environments)\n  bucket = \"myapp-${var.environments[count.index]}-assets\"\n\n  tags = {\n    Environment = var.environments[count.index]\n  }\n}"
      },
      options: [
        { id: "a", text: "One S3 bucket named `myapp-assets` with three tags for dev, staging, and prod" },
        { id: "b", text: "Three S3 buckets named `myapp-dev-assets`, `myapp-staging-assets`, and `myapp-prod-assets`, each with an appropriate Environment tag" },
        { id: "c", text: "Three S3 buckets all named `myapp-assets` with incrementing numeric suffixes" },
        { id: "d", text: "A single S3 bucket with three separate storage classes, one per environment" }
      ],
      correct: "b",
      explanation: "The `count = length(var.environments)` creates 3 instances of the `aws_s3_bucket` resource (one per environment). Each instance uses `count.index` (0, 1, 2) to look up the corresponding environment name from the `var.environments` list. The bucket names are interpolated as `myapp-dev-assets`, `myapp-staging-assets`, and `myapp-prod-assets`. Each bucket receives an `Environment` tag matching its environment name. This is a common pattern for creating multiple similar resources, though `for_each` would be preferred here for stability reasons."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...terraformQuestions);
})();
