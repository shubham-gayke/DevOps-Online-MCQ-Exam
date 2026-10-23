// Kubernetes Questions - 15 total (1 Easy, 7 Medium, 7 Hard)
// Topics: control plane, node components, Pod/ReplicaSet/Deployment, StatefulSet,
// DaemonSet, Job/CronJob, Services, Ingress, ConfigMap/Secret, PV/PVC/StorageClass,
// probes, requests/limits/QoS, taints/tolerations, node affinity, HPA, RBAC,
// NetworkPolicy, troubleshooting, YAML code-reading

(function () {
  const k8sQuestions = [
    // ── EASY (1) ──────────────────────────────────────────────────────────────
    {
      id: "k8s-001",
      topic: "Kubernetes",
      subtopic: "Control Plane",
      difficulty: "Easy",
      question: "Which component of the Kubernetes control plane stores all cluster state and configuration data?",
      code: null,
      options: [
        { id: "a", text: "kube-scheduler — it stores scheduling decisions and cluster topology" },
        { id: "b", text: "etcd — it is the distributed key-value store that serves as the single source of truth for all cluster data" },
        { id: "c", text: "kube-controller-manager — it stores the desired state of all controllers" },
        { id: "d", text: "kube-apiserver — it caches all cluster data in memory for fast API responses" }
      ],
      correct: "b",
      explanation: "etcd is the distributed, consistent key-value store that Kubernetes uses to store all cluster state, including configuration, resource definitions, secrets, and the current status of all objects. It is the single source of truth for the cluster — if etcd is lost without backups, the entire cluster state is lost. The API server reads from and writes to etcd, but it does not store data itself. The scheduler and controller manager make decisions based on data from etcd (via the API server) but do not store cluster state."
    },

    // ── MEDIUM (7) ─────────────────────────────────────────────────────────────
    {
      id: "k8s-002",
      topic: "Kubernetes",
      subtopic: "Node Components",
      difficulty: "Medium",
      question: "What is the role of the kubelet on a Kubernetes worker node?",
      code: null,
      options: [
        { id: "a", text: "The kubelet routes network traffic between pods across different nodes in the cluster" },
        { id: "b", text: "The kubelet is an agent that ensures containers described in PodSpecs are running and healthy on the node, communicating with the API server" },
        { id: "c", text: "The kubelet is the container runtime that directly creates and manages container processes" },
        { id: "d", text: "The kubelet manages the etcd instance running on each worker node" }
      ],
      correct: "b",
      explanation: "The kubelet is the primary node agent that runs on every worker node. It watches for PodSpecs assigned to its node (via the API server), ensures the containers described in those PodSpecs are created and running (using the container runtime like containerd), and reports status back to the API server. It also handles liveness/readiness probes and restarts failed containers. kube-proxy handles network routing, not kubelet. The kubelet uses a container runtime but is not one itself. etcd typically runs only on control plane nodes."
    },
    {
      id: "k8s-003",
      topic: "Kubernetes",
      subtopic: "Pod/ReplicaSet/Deployment",
      difficulty: "Medium",
      question: "What is the relationship between a Deployment, a ReplicaSet, and a Pod in Kubernetes?",
      code: null,
      options: [
        { id: "a", text: "A Deployment manages ReplicaSets, a ReplicaSet ensures a specified number of Pod replicas are running, and a Pod is the smallest deployable unit containing one or more containers" },
        { id: "b", text: "A Pod manages Deployments, a Deployment manages ReplicaSets, and a ReplicaSet runs individual containers" },
        { id: "c", text: "A Deployment, ReplicaSet, and Pod are three interchangeable abstractions for running containers" },
        { id: "d", text: "A ReplicaSet manages Deployments, a Deployment manages Pods, and a Pod manages containers on multiple nodes" }
      ],
      correct: "a",
      explanation: "Kubernetes has a clear hierarchy: a Deployment is a higher-level controller that manages ReplicaSets and provides declarative updates (rolling updates, rollbacks). A ReplicaSet ensures a specified number of identical Pod replicas are running at any given time. A Pod is the smallest deployable unit, representing one or more tightly coupled containers that share network and storage. When you update a Deployment, it creates a new ReplicaSet with the new Pod template and gradually scales it up while scaling down the old ReplicaSet. You rarely create ReplicaSets directly."
    },
    {
      id: "k8s-004",
      topic: "Kubernetes",
      subtopic: "Services",
      difficulty: "Medium",
      question: "What is the difference between a `ClusterIP` service and a `NodePort` service in Kubernetes?",
      code: null,
      options: [
        { id: "a", text: "`ClusterIP` exposes the service externally via a cloud load balancer, while `NodePort` only makes it available within the cluster" },
        { id: "b", text: "`ClusterIP` exposes the service on a cluster-internal IP (reachable only within the cluster), while `NodePort` opens a static port on every node's IP, making the service accessible from outside the cluster" },
        { id: "c", text: "`ClusterIP` assigns a random port on each pod, while `NodePort` assigns a fixed port to the pod" },
        { id: "d", text: "`ClusterIP` requires an Ingress controller, while `NodePort` works independently" }
      ],
      correct: "b",
      explanation: "`ClusterIP` is the default service type that exposes the service on a cluster-internal virtual IP address. It is only reachable from within the cluster (by other pods and services). `NodePort` builds on ClusterIP by additionally opening a static port (default range 30000–32767) on every node's IP address. External traffic can reach the service by sending requests to `<NodeIP>:<NodePort>`. The first option describes `LoadBalancer`, not `ClusterIP`. Neither type requires an Ingress controller — Ingress provides HTTP routing and is a separate concern."
    },
    {
      id: "k8s-005",
      topic: "Kubernetes",
      subtopic: "ConfigMap vs Secret",
      difficulty: "Medium",
      question: "What is the main difference between a ConfigMap and a Secret in Kubernetes?",
      code: null,
      options: [
        { id: "a", text: "ConfigMaps store non-sensitive configuration data in plain text, while Secrets store sensitive data and are base64-encoded by default (though not encrypted without additional configuration)" },
        { id: "b", text: "ConfigMaps can only store key-value pairs, while Secrets can store binary files" },
        { id: "c", text: "ConfigMaps are stored in etcd while Secrets are stored on the node's filesystem" },
        { id: "d", text: "ConfigMaps are immutable once created, while Secrets can be updated at runtime" }
      ],
      correct: "a",
      explanation: "ConfigMaps are designed for non-sensitive configuration data (like config files, environment variables, command-line arguments) and store data in plain text. Secrets are intended for sensitive data (passwords, tokens, certificates) and are base64-encoded by default. However, base64 is encoding, not encryption — Secrets are not encrypted at rest unless you enable encryption at rest in the API server. Both ConfigMaps and Secrets are stored in etcd, both can hold key-value pairs and binary data, and both can be made immutable with the `immutable: true` field."
    },
    {
      id: "k8s-006",
      topic: "Kubernetes",
      subtopic: "StatefulSet vs Deployment",
      difficulty: "Medium",
      question: "When would you use a StatefulSet instead of a Deployment?",
      code: null,
      options: [
        { id: "a", text: "Use StatefulSet for stateless web applications that need horizontal scaling" },
        { id: "b", text: "Use StatefulSet for applications requiring stable network identifiers, ordered deployment/scaling, and persistent storage per pod (like databases), which Deployments do not provide" },
        { id: "c", text: "Use StatefulSet when pods need to share a single persistent volume among all replicas" },
        { id: "d", text: "Use StatefulSet for batch processing jobs that need to run to completion" }
      ],
      correct: "b",
      explanation: "StatefulSets are designed for stateful applications that require: stable, unique network identifiers (each pod gets a predictable hostname like `mysql-0`, `mysql-1`), stable persistent storage (each pod gets its own PersistentVolumeClaim), ordered deployment and scaling (pods are created/deleted sequentially, not simultaneously), and ordered rolling updates. Deployments treat pods as interchangeable and do not guarantee ordering or stable identities. StatefulSets are ideal for databases, distributed systems (Kafka, ZooKeeper), and applications that require persistent identity. Batch processing is handled by Jobs, not StatefulSets."
    },
    {
      id: "k8s-007",
      topic: "Kubernetes",
      subtopic: "Probes",
      difficulty: "Medium",
      question: "What is the difference between a liveness probe and a readiness probe in Kubernetes?",
      code: null,
      options: [
        { id: "a", text: "Liveness probes determine if the container is running and restart it if it fails, while readiness probes determine if the container can accept traffic and remove it from service endpoints if it fails" },
        { id: "b", text: "Liveness probes check if the pod has enough CPU and memory, while readiness probes check if the network is available" },
        { id: "c", text: "Liveness probes run only at startup, while readiness probes run continuously throughout the pod's lifecycle" },
        { id: "d", text: "Liveness probes are mandatory for all pods, while readiness probes are optional" }
      ],
      correct: "a",
      explanation: "Liveness probes determine if a container is still running correctly. If a liveness probe fails (after the configured failure threshold), the kubelet kills the container and restarts it according to the pod's restart policy. Readiness probes determine if a container is ready to accept traffic. If a readiness probe fails, the pod's IP is removed from the endpoints of all matching Services, so no traffic is routed to it, but the container is NOT restarted. Both probes run continuously throughout the pod's lifecycle, and neither is mandatory — they are optional but highly recommended for production workloads."
    },
    {
      id: "k8s-008",
      topic: "Kubernetes",
      subtopic: "DaemonSet",
      difficulty: "Medium",
      question: "What is a DaemonSet and when would you use one?",
      code: null,
      options: [
        { id: "a", text: "A DaemonSet ensures one copy of a pod runs on every (or selected) node in the cluster, ideal for node-level services like log collectors, monitoring agents, or network plugins" },
        { id: "b", text: "A DaemonSet is a high-priority Deployment that runs before all other pods during cluster startup" },
        { id: "c", text: "A DaemonSet limits each node to running a maximum number of pods to prevent resource exhaustion" },
        { id: "d", text: "A DaemonSet creates pods that run as root with full host access, bypassing all security policies" }
      ],
      correct: "a",
      explanation: "A DaemonSet ensures that a copy of a specific pod runs on every node (or a subset of nodes selected via nodeSelector or affinity rules) in the cluster. When new nodes are added, the DaemonSet automatically schedules pods on them. When nodes are removed, the pods are garbage collected. Common use cases include log collection daemons (Fluentd, Filebeat), node monitoring agents (Prometheus Node Exporter), and cluster networking plugins (Calico, Cilium). DaemonSets do not run with elevated privileges by default — that's a separate security context configuration."
    },

    // ── HARD (7) ──────────────────────────────────────────────────────────────
    {
      id: "k8s-009",
      topic: "Kubernetes",
      subtopic: "Requests vs Limits and QoS",
      difficulty: "Hard",
      question: "A pod has the following resource configuration. What QoS class does Kubernetes assign to it?",
      code: {
        language: "yaml",
        content: "containers:\n  - name: app\n    resources:\n      requests:\n        memory: \"256Mi\"\n        cpu: \"250m\"\n      limits:\n        memory: \"512Mi\"\n        cpu: \"500m\""
      },
      options: [
        { id: "a", text: "Guaranteed — because both requests and limits are set for all containers" },
        { id: "b", text: "Burstable — because requests and limits are set but are not equal, allowing the pod to burst above its requests up to the limits" },
        { id: "c", text: "BestEffort — because neither requests nor limits are set" },
        { id: "d", text: "Guaranteed — because the pod has both CPU and memory specifications defined" }
      ],
      correct: "b",
      explanation: "Kubernetes assigns QoS classes based on resource specifications. `Guaranteed` requires that every container in the pod has requests equal to limits for BOTH CPU and memory. `Burstable` means at least one container has requests or limits set, but they are not all equal. `BestEffort` means no container has any requests or limits. In this example, requests (256Mi/250m) differ from limits (512Mi/500m), so the pod is classified as `Burstable`. The QoS class matters for eviction priority: BestEffort pods are evicted first under memory pressure, then Burstable, and Guaranteed pods are evicted last."
    },
    {
      id: "k8s-010",
      topic: "Kubernetes",
      subtopic: "Taints and Tolerations",
      difficulty: "Hard",
      question: "What is the relationship between taints and tolerations in Kubernetes, and how do they differ from node affinity?",
      code: null,
      options: [
        { id: "a", text: "Taints on nodes repel pods unless those pods have matching tolerations; node affinity attracts pods to specific nodes. Taints are a node property that pushes pods away, while affinity is a pod property that pulls pods toward nodes" },
        { id: "b", text: "Taints and tolerations are newer replacements for node affinity, providing the same functionality with simpler syntax" },
        { id: "c", text: "Taints prevent all pods from being scheduled on a node permanently, while tolerations allow pods to override any node restriction" },
        { id: "d", text: "Node affinity is applied to nodes, while taints and tolerations are applied to namespaces" }
      ],
      correct: "a",
      explanation: "Taints and tolerations work together as a repulsion mechanism: a taint on a node tells the scheduler to avoid placing pods there unless the pod explicitly tolerates the taint. This is useful for dedicated nodes (e.g., GPU nodes, nodes for specific teams). Node affinity is an attraction mechanism: a pod's affinity rules express preferences or requirements for which nodes it should be scheduled on. Key distinction: taints are properties of nodes, tolerations are properties of pods, and node affinity rules are also pod properties. They are complementary, not replacements — taints repel unwanted pods, while affinity attracts desired pods."
    },
    {
      id: "k8s-011",
      topic: "Kubernetes",
      subtopic: "Ingress",
      difficulty: "Hard",
      question: "What is the role of an Ingress resource and an Ingress controller, and how do they differ from a LoadBalancer service?",
      code: null,
      options: [
        { id: "a", text: "An Ingress resource defines HTTP/HTTPS routing rules (host-based, path-based); an Ingress controller (like NGINX, Traefik) implements those rules. Unlike a LoadBalancer service which provisions a separate external LB per service, Ingress can route to multiple services through a single entry point" },
        { id: "b", text: "An Ingress resource replaces Services entirely, providing both internal and external load balancing" },
        { id: "c", text: "An Ingress controller is a built-in Kubernetes component that comes pre-installed, while LoadBalancer services require external plugins" },
        { id: "d", text: "An Ingress resource provisions a cloud load balancer automatically, while a LoadBalancer service only works with on-premise clusters" }
      ],
      correct: "a",
      explanation: "An Ingress resource is a Kubernetes API object that defines rules for HTTP/HTTPS routing — mapping hostnames and URL paths to backend Services (e.g., `api.example.com` → api-service, `example.com/docs` → docs-service). An Ingress controller is a pod that watches Ingress resources and implements the routing (popular controllers include NGINX, Traefik, HAProxy). The key advantage over LoadBalancer services is efficiency: a LoadBalancer service provisions a separate cloud load balancer for EACH service (costly), while Ingress routes multiple services through one entry point. Ingress controllers are NOT built-in — they must be installed separately."
    },
    {
      id: "k8s-012",
      topic: "Kubernetes",
      subtopic: "PV/PVC/StorageClass",
      difficulty: "Hard",
      question: "What is the relationship between PersistentVolume (PV), PersistentVolumeClaim (PVC), and StorageClass in Kubernetes?",
      code: null,
      options: [
        { id: "a", text: "A PV is a storage resource provisioned by an administrator, a PVC is a request for storage by a pod, and a StorageClass enables dynamic provisioning — when a PVC references a StorageClass, the PV is created automatically" },
        { id: "b", text: "A PV and PVC are the same resource with different names for different namespaces" },
        { id: "c", text: "A StorageClass is a specific type of PV, and a PVC is the configuration for that StorageClass" },
        { id: "d", text: "A PV is the physical disk, a PVC mounts it to the node's filesystem, and a StorageClass manages disk encryption" }
      ],
      correct: "a",
      explanation: "PersistentVolumes (PVs) represent actual storage resources (a piece of storage in the cluster, provisioned by an admin or dynamically). PersistentVolumeClaims (PVCs) are requests for storage by users/pods — they specify size, access mode, and optionally a StorageClass. StorageClasses define 'classes' of storage (e.g., fast-SSD, standard-HDD) and enable dynamic provisioning: when a PVC references a StorageClass, Kubernetes automatically creates a PV meeting the requirements without admin intervention. PVs are cluster-scoped (not namespaced), PVCs are namespaced, and they are bound together when a PVC's requirements match a PV."
    },
    {
      id: "k8s-013",
      topic: "Kubernetes",
      subtopic: "HPA and RBAC",
      difficulty: "Hard",
      question: "What does the Horizontal Pod Autoscaler (HPA) use to make scaling decisions, and what is a prerequisite for it to work?",
      code: null,
      options: [
        { id: "a", text: "HPA monitors node-level CPU and scales by adding more nodes to the cluster; it requires the Cluster Autoscaler" },
        { id: "b", text: "HPA monitors pod-level resource metrics (CPU, memory) or custom metrics and adjusts the replica count of a Deployment/ReplicaSet; it requires the Metrics Server (or a custom metrics adapter) to be installed" },
        { id: "c", text: "HPA monitors network traffic and scales based on the number of incoming HTTP requests; it requires an Ingress controller" },
        { id: "d", text: "HPA monitors disk usage and scales by attaching additional PersistentVolumes; it requires a StorageClass" }
      ],
      correct: "b",
      explanation: "The Horizontal Pod Autoscaler watches resource utilization metrics (primarily CPU and memory) for pods in a Deployment, ReplicaSet, or StatefulSet, and automatically adjusts the number of replicas to maintain target utilization levels. For HPA to function, the Metrics Server must be installed in the cluster to provide resource metrics via the Metrics API. HPA can also use custom metrics (like requests per second) via custom metrics adapters. HPA scales pods horizontally (more replicas), not nodes — that is the Cluster Autoscaler's role. HPA does not monitor disk usage or network traffic by default."
    },
    {
      id: "k8s-014",
      topic: "Kubernetes",
      subtopic: "Troubleshooting",
      difficulty: "Hard",
      question: "A pod is in `CrashLoopBackOff` status. What does this indicate, and what is the typical troubleshooting approach?",
      code: null,
      options: [
        { id: "a", text: "The pod's image cannot be pulled from the registry; check the image name and pull secrets with `kubectl describe pod`" },
        { id: "b", text: "The pod's container starts, crashes, gets restarted by kubelet, crashes again, and the restart delay increases exponentially; check logs with `kubectl logs --previous` and events with `kubectl describe pod`" },
        { id: "c", text: "The pod cannot be scheduled to any node due to insufficient resources; increase the cluster size or reduce resource requests" },
        { id: "d", text: "The pod is running but its readiness probe is failing; check the probe configuration and the application's health endpoint" }
      ],
      correct: "b",
      explanation: "`CrashLoopBackOff` means the container in the pod starts, exits with an error, and is being restarted by the kubelet. After each crash, Kubernetes applies an exponential backoff delay before restarting (10s, 20s, 40s, up to 5 minutes). The 'BackOff' part refers to this increasing wait time. To troubleshoot, use `kubectl logs <pod> --previous` to see logs from the crashed container (since the current one may have already restarted), and `kubectl describe pod` to see events. Common causes include application errors, missing configuration, failed health checks, or OOM kills. `ImagePullBackOff` is the status for image pull failures, and `Pending` indicates scheduling issues."
    },
    {
      id: "k8s-015",
      topic: "Kubernetes",
      subtopic: "YAML Code Reading",
      difficulty: "Hard",
      question: "What issue will prevent this Kubernetes Deployment from working correctly?",
      code: {
        language: "yaml",
        content: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: frontend\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:1.25\n          ports:\n            - containerPort: 80"
      },
      options: [
        { id: "a", text: "The `replicas: 3` is too low for a production deployment; it should be at least 5" },
        { id: "b", text: "The `selector.matchLabels` (`app: web`) does not match the pod template's labels (`app: frontend`), so the Deployment cannot manage the pods it creates — Kubernetes will reject this manifest" },
        { id: "c", text: "The `containerPort: 80` must have a corresponding `hostPort` for the pod to be accessible" },
        { id: "d", text: "The `apiVersion` should be `v1` instead of `apps/v1` for Deployment resources" }
      ],
      correct: "b",
      explanation: "The Deployment's `spec.selector.matchLabels` must match the labels in `spec.template.metadata.labels`. Here, the selector looks for `app: web` but the pod template has `app: frontend`. Kubernetes validates this during creation and will reject the manifest with an error because the selector does not match the template labels — the Deployment would never be able to find the pods it creates. This is a required invariant in Kubernetes. The correct fix is to make both labels consistent (either both `app: web` or both `app: frontend`). `apps/v1` is the correct apiVersion for Deployments."
    }
  ];

  window.QUESTION_BANK = window.QUESTION_BANK || [];
  window.QUESTION_BANK.push(...k8sQuestions);
})();
