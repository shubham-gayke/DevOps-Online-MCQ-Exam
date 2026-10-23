// Docker Questions - 20 total (2 Easy, 7 Medium, 11 Hard)
// Topics: architecture (client, dockerd, containerd, runc, registry), docker run,
// images/layers, namespaces/cgroups, containers vs VMs, networking, storage,
// Dockerfile (CMD vs ENTRYPOINT, COPY vs ADD, ARG vs ENV, shell vs exec form,
// layer caching, .dockerignore, HEALTHCHECK), multi-stage builds, Compose, stop vs kill

(function () {
  const dockerQuestions = [
    // ── EASY (2) ──────────────────────────────────────────────────────────────
    {
      id: "docker-001",
      topic: "Docker",
      subtopic: "Containers vs VMs",
      difficulty: "Easy",
      question: "What is the fundamental architectural difference between containers and virtual machines?",
      code: null,
      options: [
        { id: "a", text: "Containers run on a hypervisor with their own kernel, while VMs share the host operating system kernel" },
        { id: "b", text: "Containers share the host OS kernel and isolate processes using namespaces and cgroups, while VMs include a full guest OS running on a hypervisor" },
        { id: "c", text: "Containers can only run Linux applications, while VMs can run any operating system including Windows and macOS" },
        { id: "d", text: "Containers provide stronger security isolation than VMs because they have dedicated hardware resources" }
      ],
      correct: "b",
      explanation: "Containers share the host operating system's kernel and use Linux kernel features — namespaces for process isolation and cgroups for resource control — to create isolated environments. Virtual machines, by contrast, run a complete guest operating system on top of a hypervisor, each with its own kernel. This makes containers significantly lighter and faster to start. The first option reverses the architectures. Linux containers can run Linux workloads; Windows containers exist for Windows workloads. VMs generally provide stronger isolation because of the hardware-level separation."
    },
    {
      id: "docker-002",
      topic: "Docker",
      subtopic: "Images and Layers",
      difficulty: "Easy",
      question: "What are Docker image layers?",
      code: null,
      options: [
        { id: "a", text: "Layers are separate container instances that stack on top of each other to form a running application" },
        { id: "b", text: "Layers are read-only filesystem snapshots, each created by a Dockerfile instruction, that stack to form the final image using a union filesystem" },
        { id: "c", text: "Layers are network interfaces assigned to a container, one per port mapping" },
        { id: "d", text: "Layers are versions of an image, similar to Git commits, where each layer represents a complete copy of the filesystem" }
      ],
      correct: "b",
      explanation: "Each instruction in a Dockerfile (FROM, RUN, COPY, etc.) creates a new read-only layer. These layers are stacked using a union filesystem (like OverlayFS) to present a unified view of the filesystem. When a container runs, a thin writable layer is added on top. Because layers are read-only and content-addressed, they can be shared between images — if two images share the same base image, the base layers are stored only once on disk and in registries. Layers are not complete filesystem copies; they contain only the filesystem delta from the previous layer."
    },

    // ── MEDIUM (7) ─────────────────────────────────────────────────────────────
    {
      id: "docker-003",
      topic: "Docker",
      subtopic: "Architecture",
      difficulty: "Medium",
      question: "What is the correct order of components involved when you run `docker run nginx`?",
      code: null,
      options: [
        { id: "a", text: "Docker CLI → Docker daemon (dockerd) → containerd → runc → container process" },
        { id: "b", text: "Docker CLI → runc → containerd → Docker daemon → container process" },
        { id: "c", text: "Docker CLI → containerd → Docker daemon → kernel → container process" },
        { id: "d", text: "Docker CLI → Docker registry → runc → Docker daemon → container process" }
      ],
      correct: "a",
      explanation: "When you execute `docker run`, the Docker CLI sends the request to the Docker daemon (dockerd) via the Docker API. The daemon handles image management, networking, and storage, then delegates container creation to containerd (the container runtime manager). containerd uses runc (the OCI-compliant low-level runtime) to actually create the container by setting up namespaces, cgroups, and executing the container's entrypoint process. If the image is not local, dockerd pulls it from the registry before this chain, but the runtime execution order is CLI → dockerd → containerd → runc → process."
    },
    {
      id: "docker-004",
      topic: "Docker",
      subtopic: "Namespaces and Cgroups",
      difficulty: "Medium",
      question: "What roles do Linux namespaces and cgroups play in Docker container isolation?",
      code: null,
      options: [
        { id: "a", text: "Namespaces provide resource limits (CPU, memory), while cgroups provide process isolation (PID, network, filesystem)" },
        { id: "b", text: "Namespaces provide isolation of system resources (PID, network, mount, user), while cgroups limit and account for resource usage (CPU, memory, I/O)" },
        { id: "c", text: "Namespaces encrypt container data at rest, while cgroups encrypt container network traffic" },
        { id: "d", text: "Namespaces manage container image layers, while cgroups manage container networking" }
      ],
      correct: "b",
      explanation: "Linux namespaces and cgroups serve complementary but distinct purposes. Namespaces provide isolation: PID namespace gives each container its own process tree, network namespace provides separate network stacks, mount namespace isolates filesystems, and UTS/IPC/user namespaces provide additional isolation layers. Cgroups (control groups) limit, account for, and isolate resource usage — they prevent a container from consuming all available CPU, memory, or I/O on the host. The first option reverses the roles. Neither namespaces nor cgroups provide encryption."
    },
    {
      id: "docker-005",
      topic: "Docker",
      subtopic: "Networking",
      difficulty: "Medium",
      question: "What is the default Docker network mode for a new container, and what limitation does it have compared to a user-defined bridge network?",
      code: null,
      options: [
        { id: "a", text: "The default mode is `host`, which shares the host's network stack; user-defined bridges add port isolation" },
        { id: "b", text: "The default mode is `bridge` (the default bridge network); containers on it can communicate only by IP, not by container name, unlike user-defined bridge networks which provide automatic DNS resolution" },
        { id: "c", text: "The default mode is `none`, which provides no networking; user-defined bridges add basic connectivity" },
        { id: "d", text: "The default mode is `overlay`, which spans multiple hosts; user-defined bridges are limited to a single host" }
      ],
      correct: "b",
      explanation: "By default, Docker connects containers to the `bridge` network (named 'bridge'). On the default bridge, containers can communicate using IP addresses but do NOT get automatic DNS resolution by container name. User-defined bridge networks provide automatic DNS service discovery — containers can reach each other by name (e.g., `curl http://api:8080`). Additionally, user-defined bridges offer better isolation, configurable subnets, and the ability to connect/disconnect running containers. The `host`, `none`, and `overlay` modes exist but are not the default."
    },
    {
      id: "docker-006",
      topic: "Docker",
      subtopic: "Storage",
      difficulty: "Medium",
      question: "What is the key difference between Docker volumes and bind mounts?",
      code: null,
      options: [
        { id: "a", text: "Volumes are managed by Docker and stored in Docker's storage area, while bind mounts map a specific host filesystem path into the container" },
        { id: "b", text: "Volumes are faster because they use RAM, while bind mounts use disk storage" },
        { id: "c", text: "Volumes can only store data up to 1GB, while bind mounts have no size limit" },
        { id: "d", text: "Volumes are read-only by default, while bind mounts are always read-write" }
      ],
      correct: "a",
      explanation: "Docker volumes are managed by the Docker engine and stored within Docker's storage directory (typically `/var/lib/docker/volumes/` on Linux). They are the preferred mechanism for persisting data because they are portable, can be backed up easily, work on both Linux and Windows, and can be managed with Docker CLI commands. Bind mounts map any path on the host filesystem directly into the container, giving tighter coupling to the host's directory structure. Both use disk storage (not RAM — that's tmpfs), both can be read-write or read-only, and neither has inherent size limits."
    },
    {
      id: "docker-007",
      topic: "Docker",
      subtopic: "COPY vs ADD",
      difficulty: "Medium",
      question: "When should you prefer `COPY` over `ADD` in a Dockerfile?",
      code: null,
      options: [
        { id: "a", text: "Use `COPY` when transferring files from a URL, and `ADD` for local files only" },
        { id: "b", text: "Use `COPY` for straightforward file copying (which covers most cases), and `ADD` only when you specifically need its extra features: automatic tar extraction or fetching from URLs" },
        { id: "c", text: "Use `COPY` for small files and `ADD` for large files, because `ADD` uses compression" },
        { id: "d", text: "Use `COPY` in the final stage of multi-stage builds and `ADD` in all other stages" }
      ],
      correct: "b",
      explanation: "Docker best practices recommend using `COPY` for most cases because it is straightforward and predictable — it simply copies files from the build context into the image. `ADD` has two additional features: it can automatically extract recognized archive formats (tar, gzip, etc.) and can fetch files from remote URLs. However, these implicit behaviors can be surprising and make the Dockerfile harder to understand. The first option reverses URL handling — `ADD` can fetch URLs, not `COPY`. Use `ADD` only when you specifically need tar extraction. For URLs, `RUN curl` or `RUN wget` is preferred over `ADD`."
    },
    {
      id: "docker-008",
      topic: "Docker",
      subtopic: "Stop vs Kill",
      difficulty: "Medium",
      question: "What is the difference between `docker stop` and `docker kill`?",
      code: null,
      options: [
        { id: "a", text: "`docker stop` sends SIGTERM and waits for a grace period (default 10s) before sending SIGKILL, while `docker kill` immediately sends SIGKILL without a grace period" },
        { id: "b", text: "`docker stop` pauses the container so it can be resumed later, while `docker kill` permanently removes the container" },
        { id: "c", text: "`docker stop` only works on running containers, while `docker kill` also removes stopped containers" },
        { id: "d", text: "`docker stop` saves the container's state to disk before stopping, while `docker kill` discards all in-memory state" }
      ],
      correct: "a",
      explanation: "`docker stop` performs a graceful shutdown: it sends SIGTERM to the container's main process, giving it time to clean up (flush buffers, close connections, save state). After the grace period (default 10 seconds, configurable with `-t`), if the process hasn't exited, Docker sends SIGKILL. `docker kill` immediately sends SIGKILL (by default) with no grace period, abruptly terminating the process. Neither command removes the container (that's `docker rm`) or saves state to disk. `docker pause` suspends the container using cgroups freezer."
    },
    {
      id: "docker-009",
      topic: "Docker",
      subtopic: "Port Mapping",
      difficulty: "Medium",
      question: "In the command `docker run -p 8080:3000 myapp`, what does `8080:3000` specify?",
      code: null,
      options: [
        { id: "a", text: "It maps container port 8080 to host port 3000, so the app is accessible at `localhost:3000`" },
        { id: "b", text: "It maps host port 8080 to container port 3000, so the app is accessible at `localhost:8080`" },
        { id: "c", text: "It opens a range of ports from 3000 to 8080 on both the host and the container" },
        { id: "d", text: "It sets the application inside the container to listen on both ports 8080 and 3000" }
      ],
      correct: "b",
      explanation: "The `-p` flag syntax is `host_port:container_port`. So `-p 8080:3000` maps port 8080 on the host to port 3000 inside the container. Traffic arriving at `localhost:8080` on the host is forwarded to port 3000 in the container. The application inside the container must be listening on port 3000 for this to work. The first option reverses the order. This is a common point of confusion — always remember the host port comes first."
    },

    // ── HARD (11) ──────────────────────────────────────────────────────────────
    {
      id: "docker-010",
      topic: "Docker",
      subtopic: "CMD vs ENTRYPOINT",
      difficulty: "Hard",
      question: "Given this Dockerfile, what command is executed when you run `docker run myimg --verbose`?",
      code: {
        language: "dockerfile",
        content: "FROM python:3.11-slim\nENTRYPOINT [\"python\", \"manage.py\"]\nCMD [\"runserver\", \"0.0.0.0:8000\"]"
      },
      options: [
        { id: "a", text: "`python manage.py runserver 0.0.0.0:8000 --verbose` — the runtime argument is appended to both ENTRYPOINT and CMD" },
        { id: "b", text: "`python manage.py --verbose` — runtime arguments replace CMD entirely but ENTRYPOINT remains unchanged" },
        { id: "c", text: "`--verbose` — both ENTRYPOINT and CMD are replaced by runtime arguments" },
        { id: "d", text: "`python manage.py runserver 0.0.0.0:8000` — runtime arguments are ignored when both ENTRYPOINT and CMD are defined" }
      ],
      correct: "b",
      explanation: "When both ENTRYPOINT and CMD are defined in exec form, CMD provides default arguments to ENTRYPOINT. When you pass arguments at `docker run` time (like `--verbose`), they completely replace CMD but ENTRYPOINT remains. So the executed command is `python manage.py --verbose` — the ENTRYPOINT (`python manage.py`) is preserved and `--verbose` replaces the default CMD (`runserver 0.0.0.0:8000`). Arguments are not appended to CMD; they replace it entirely. ENTRYPOINT can only be overridden with `--entrypoint`."
    },
    {
      id: "docker-011",
      topic: "Docker",
      subtopic: "Shell vs Exec Form",
      difficulty: "Hard",
      question: "What is the critical difference between shell form and exec form for `CMD` in a Dockerfile, and why does it matter for signal handling?",
      code: {
        language: "dockerfile",
        content: "# Shell form:\nCMD node server.js\n\n# Exec form:\nCMD [\"node\", \"server.js\"]"
      },
      options: [
        { id: "a", text: "Shell form runs the command inside `/bin/sh -c`, making the shell PID 1 instead of the application, which means SIGTERM from `docker stop` goes to the shell and may not reach the app" },
        { id: "b", text: "Shell form is more secure because it runs the command in a sandboxed shell environment" },
        { id: "c", text: "Exec form runs the command through a shell, allowing variable expansion and piping" },
        { id: "d", text: "Shell form and exec form are functionally identical; the bracket syntax is just an alternative notation" }
      ],
      correct: "a",
      explanation: "Shell form (`CMD command args`) wraps the command in `/bin/sh -c \"command args\"`, making `/bin/sh` the PID 1 process. The actual application becomes a child process. When Docker sends SIGTERM (during `docker stop`), it goes to PID 1 (the shell), which may not forward it to the child process, preventing graceful shutdown. Exec form (`CMD [\"command\", \"args\"]`) runs the command directly as PID 1 without a shell wrapper, so it receives signals directly. The tradeoff is that exec form does not support shell features like variable expansion, pipes, or redirects."
    },
    {
      id: "docker-012",
      topic: "Docker",
      subtopic: "ARG vs ENV",
      difficulty: "Hard",
      question: "What is the difference between `ARG` and `ENV` in a Dockerfile?",
      code: {
        language: "dockerfile",
        content: "ARG BUILD_VERSION=1.0\nENV APP_VERSION=${BUILD_VERSION}\nRUN echo \"Building version ${BUILD_VERSION}\"\nCMD echo \"Running version ${APP_VERSION}\""
      },
      options: [
        { id: "a", text: "`ARG` is available only during the build process and is NOT persisted in the final image, while `ENV` sets environment variables that persist in the running container" },
        { id: "b", text: "`ARG` sets variables for runtime and `ENV` sets variables for build time" },
        { id: "c", text: "`ARG` and `ENV` are identical but `ARG` is the newer syntax recommended by Docker" },
        { id: "d", text: "`ARG` can only be used in the FROM instruction, while `ENV` can be used anywhere" }
      ],
      correct: "a",
      explanation: "`ARG` defines build-time variables that are available during the image build process (in `RUN`, `COPY`, etc.) but are NOT persisted in the final image or available at container runtime. `ENV` defines environment variables that are embedded in the image and available both during build and at runtime in the container. In the example, `BUILD_VERSION` is available during `RUN` but not at runtime, while `APP_VERSION` (set via `ENV`) is available at runtime in `CMD`. A common pattern is to use `ARG` for build-time configuration and pass the value to `ENV` for runtime use, exactly as shown."
    },
    {
      id: "docker-013",
      topic: "Docker",
      subtopic: "Layer Caching",
      difficulty: "Hard",
      question: "Why is this Dockerfile inefficient for development, and what should be changed?",
      code: {
        language: "dockerfile",
        content: "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]"
      },
      options: [
        { id: "a", text: "The `EXPOSE` instruction should come before `COPY` because port allocation must happen before files are copied" },
        { id: "b", text: "`COPY . .` before `RUN npm ci` means ANY file change (even to source code) invalidates the npm install cache layer; instead, copy `package*.json` first, run `npm ci`, then copy the rest" },
        { id: "c", text: "The `FROM` instruction should specify the exact SHA256 digest instead of a tag for reproducible builds" },
        { id: "d", text: "The `WORKDIR` instruction creates an unnecessary layer; files should be copied directly to the root filesystem" }
      ],
      correct: "b",
      explanation: "Docker builds layers sequentially, and when a layer changes, all subsequent layers are invalidated and rebuilt. By copying ALL files (`COPY . .`) before `npm ci`, any source code change (even a single line in a .js file) invalidates the layer cache, forcing a full `npm ci` reinstall every build. The optimized approach is to first `COPY package.json package-lock.json ./`, then `RUN npm ci` (this layer is only rebuilt when dependencies change), and then `COPY . .` for the rest of the source code. This leverages layer caching for the expensive dependency installation step."
    },
    {
      id: "docker-014",
      topic: "Docker",
      subtopic: "Multi-Stage Builds",
      difficulty: "Hard",
      question: "What is the primary benefit of multi-stage builds, and what does `COPY --from=builder` accomplish?",
      code: {
        language: "dockerfile",
        content: "FROM node:18 AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80"
      },
      options: [
        { id: "a", text: "Multi-stage builds run multiple containers in parallel; `COPY --from=builder` shares network volumes between stages" },
        { id: "b", text: "Multi-stage builds allow using multiple FROM instructions in one Dockerfile, producing a final image containing only the artifacts from selected stages; `COPY --from=builder` copies files from the builder stage into the final stage, dramatically reducing image size" },
        { id: "c", text: "Multi-stage builds create multiple Docker images from one Dockerfile; `COPY --from=builder` creates a symbolic link to the builder image" },
        { id: "d", text: "Multi-stage builds are required when mixing different base operating systems; `COPY --from=builder` converts file formats between Linux distributions" }
      ],
      correct: "b",
      explanation: "Multi-stage builds allow you to use multiple `FROM` instructions in a single Dockerfile, where each `FROM` starts a new stage. The final image only contains the layers from the last stage. `COPY --from=builder` copies specific files (in this case, the compiled build output) from a named earlier stage into the current stage. This is powerful for reducing image size: the builder stage has Node.js, npm, source code, and dev dependencies, but the final image only contains nginx and the compiled static files. The builder tools and source code are not in the final image."
    },
    {
      id: "docker-015",
      topic: "Docker",
      subtopic: ".dockerignore",
      difficulty: "Hard",
      question: "What is the purpose of `.dockerignore` and what happens if you omit it when the project has a large `node_modules` directory?",
      code: null,
      options: [
        { id: "a", text: "`.dockerignore` prevents Docker from running specified files inside the container; without it, `node_modules` would execute during build" },
        { id: "b", text: "`.dockerignore` excludes files from the build context sent to the Docker daemon; without it, the entire `node_modules` is sent to the daemon (slow) and `COPY . .` includes it in the image (large), potentially overwriting the `npm ci` install" },
        { id: "c", text: "`.dockerignore` encrypts sensitive files during the build process; without it, credentials in `node_modules` would be exposed" },
        { id: "d", text: "`.dockerignore` only affects `docker push`, not `docker build`; without it, `node_modules` would be uploaded to the registry" }
      ],
      correct: "b",
      explanation: "`.dockerignore` works like `.gitignore` for Docker builds. Before executing a Dockerfile, Docker sends the entire build context (the directory you specify in `docker build`) to the Docker daemon. Without a `.dockerignore`, a large `node_modules` directory would be included in this context transfer, making builds slow even if `node_modules` is never used in the image. Worse, `COPY . .` would copy `node_modules` into the image, bloating its size and potentially conflicting with the platform-specific dependencies installed by `npm ci` during the build. `.dockerignore` affects the build context, not push or runtime."
    },
    {
      id: "docker-016",
      topic: "Docker",
      subtopic: "HEALTHCHECK",
      difficulty: "Hard",
      question: "What does the `HEALTHCHECK` instruction do in a Dockerfile, and how does Docker use the health status?",
      code: {
        language: "dockerfile",
        content: "HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\\n  CMD curl -f http://localhost:8080/health || exit 1"
      },
      options: [
        { id: "a", text: "It runs the specified command periodically to check container health; Docker marks the container as unhealthy after consecutive failures and can be used by orchestrators (like Docker Swarm) to replace unhealthy containers" },
        { id: "b", text: "It automatically restarts the container when the health check fails, similar to Kubernetes liveness probes" },
        { id: "c", text: "It only logs health status to Docker's event stream but does not affect the container's state" },
        { id: "d", text: "It checks the container's CPU and memory usage against predefined thresholds" }
      ],
      correct: "a",
      explanation: "The `HEALTHCHECK` instruction tells Docker how to test whether the container is still working correctly. Docker runs the specified command at the configured interval (30s here). If the command returns a non-zero exit code, it counts as a failure. After the specified number of consecutive failures (retries: 3), the container's status changes to 'unhealthy'. Importantly, Docker itself does NOT automatically restart unhealthy containers — that's the job of an orchestrator like Docker Swarm or Kubernetes. Without an orchestrator, the health status is informational. The check runs a user-defined command, not system metrics monitoring."
    },
    {
      id: "docker-017",
      topic: "Docker",
      subtopic: "Networking - Overlay",
      difficulty: "Hard",
      question: "When would you use the `overlay` network driver in Docker instead of `bridge`?",
      code: null,
      options: [
        { id: "a", text: "Use `overlay` for single-host deployments where you need better performance than the default bridge" },
        { id: "b", text: "Use `overlay` when containers on DIFFERENT Docker hosts need to communicate, such as in a Docker Swarm cluster, as it creates a distributed network across multiple nodes" },
        { id: "c", text: "Use `overlay` when you want containers to share the host's network namespace for direct access to host ports" },
        { id: "d", text: "Use `overlay` when containers need to access external networks through a VPN tunnel" }
      ],
      correct: "b",
      explanation: "The `overlay` network driver enables networking across multiple Docker daemon hosts, creating a distributed network that spans multiple nodes. This is essential for Docker Swarm services where containers running on different physical or virtual machines need to communicate as if they were on the same local network. The `bridge` driver only works within a single host. The `host` driver shares the host's network namespace. `overlay` uses VXLAN encapsulation to tunnel traffic between nodes. It is not about VPN tunnels or performance optimization on a single host."
    },
    {
      id: "docker-018",
      topic: "Docker",
      subtopic: "Compose",
      difficulty: "Hard",
      question: "In Docker Compose, what does `depends_on` control and what does it NOT guarantee?",
      code: {
        language: "yaml",
        content: "services:\n  web:\n    build: .\n    depends_on:\n      - db\n      - redis\n  db:\n    image: postgres:15\n  redis:\n    image: redis:7"
      },
      options: [
        { id: "a", text: "`depends_on` controls the start order (db and redis start before web) but does NOT guarantee that db and redis are 'ready' (accepting connections) before web starts — only that their containers have been started" },
        { id: "b", text: "`depends_on` ensures that db and redis are fully initialized and accepting connections before web starts" },
        { id: "c", text: "`depends_on` creates network links between services so they can discover each other by name" },
        { id: "d", text: "`depends_on` shares volumes between the dependent services so web can access db's data directory" }
      ],
      correct: "a",
      explanation: "`depends_on` in Docker Compose controls the order in which services are started and stopped. With the configuration shown, Compose starts `db` and `redis` before `web`. However, it does NOT wait for `db` and `redis` to be 'ready' (i.e., accepting connections) — it only waits for the containers to start. A PostgreSQL container might take several seconds to initialize after starting. To handle this, applications should implement retry logic or use the `healthcheck` condition (`depends_on: db: condition: service_healthy`). Network discovery by service name is handled by Compose's default network, not `depends_on`."
    },
    {
      id: "docker-019",
      topic: "Docker",
      subtopic: "Dockerfile Code Reading",
      difficulty: "Hard",
      question: "What is wrong with this Dockerfile for a Go application, and how does it affect the final image?",
      code: {
        language: "dockerfile",
        content: "FROM golang:1.21\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /app/server .\nEXPOSE 8080\nCMD [\"/app/server\"]"
      },
      options: [
        { id: "a", text: "The `CGO_ENABLED=0` flag prevents the binary from running; it should be `CGO_ENABLED=1`" },
        { id: "b", text: "The final image includes the entire Go toolchain, source code, and build dependencies even though only the compiled binary is needed — a multi-stage build would reduce the image from ~1GB to ~10MB" },
        { id: "c", text: "The `go mod download` step is unnecessary because `go build` automatically downloads dependencies" },
        { id: "d", text: "The `EXPOSE 8080` instruction must come before `RUN go build` for the application to bind to port 8080" }
      ],
      correct: "b",
      explanation: "This Dockerfile produces a functional image, but it is unnecessarily large. The final image is based on `golang:1.21`, which includes the entire Go compiler, toolchain, standard library, and a Debian-based OS (~1GB+). Since Go produces statically-linked binaries (especially with `CGO_ENABLED=0`), only the compiled binary is needed at runtime. A multi-stage build would use the golang image for building and then copy only the binary to a minimal base like `alpine` or `scratch`, reducing the image to ~10–20MB. `go mod download` is a valid caching optimization. `EXPOSE` is declarative and order-independent."
    },
    {
      id: "docker-020",
      topic: "Docker",
      subtopic: "Storage - tmpfs",
      difficulty: "Hard",
      question: "When would you use a `tmpfs` mount in Docker instead of a volume or bind mount?",
      code: null,
      options: [
        { id: "a", text: "Use `tmpfs` when you need data to persist across container restarts and be shared between containers" },
        { id: "b", text: "Use `tmpfs` for sensitive or temporary data that should exist only in memory, never be written to the host filesystem, and be discarded when the container stops" },
        { id: "c", text: "Use `tmpfs` when you need the largest possible storage capacity, as it can use swap space" },
        { id: "d", text: "Use `tmpfs` to mount remote NFS shares into the container" }
      ],
      correct: "b",
      explanation: "`tmpfs` mounts create a filesystem in the container's memory (RAM). Data stored in tmpfs is never written to the host's filesystem or the container's writable layer, and it is automatically discarded when the container stops. This is ideal for sensitive data (like secrets or session tokens) that should not persist on disk, or for temporary data where you want maximum I/O performance. Unlike volumes and bind mounts, tmpfs does not persist data across restarts and cannot be shared between containers. It is not related to NFS mounts, and while it uses memory, it can technically use swap, but that's not its purpose."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...dockerQuestions);
})();
