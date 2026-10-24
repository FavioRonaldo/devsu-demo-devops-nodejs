variable "create_cluster" {
  description = "Create a local kind cluster. Set to false to install the platform on an existing cluster such as Docker Desktop."
  type        = bool
  default     = true
}

variable "cluster_name" {
  description = "Name of the kind cluster."
  type        = string
  default     = "devsu-demo"
}

variable "node_image" {
  description = "kindest/node image used by every node of the kind cluster."
  type        = string
  default     = "kindest/node:v1.35.0@sha256:452d707d4862f52530247495d180205e029056831160e22870e37e3f6c1ac31f"
}

variable "worker_count" {
  description = "Number of worker nodes of the kind cluster."
  type        = number
  default     = 2

  validation {
    condition     = var.worker_count >= 1 && var.worker_count <= 5
    error_message = "worker_count must be between 1 and 5."
  }
}

variable "http_host_port" {
  description = "Host port mapped to the HTTP entrypoint of the ingress controller when using kind."
  type        = number
  default     = 80
}

variable "https_host_port" {
  description = "Host port mapped to the HTTPS entrypoint of the ingress controller when using kind."
  type        = number
  default     = 443
}

variable "kubeconfig_path" {
  description = "Kubeconfig file written for the kind cluster or read for an existing cluster."
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubeconfig context of the existing cluster when create_cluster is false."
  type        = string
  default     = "docker-desktop"
}

variable "metrics_server_chart_version" {
  description = "metrics-server Helm chart version."
  type        = string
  default     = "3.14.0"
}

variable "cert_manager_chart_version" {
  description = "cert-manager Helm chart version."
  type        = string
  default     = "v1.21.2"
}

variable "traefik_chart_version" {
  description = "Traefik Helm chart version."
  type        = string
  default     = "41.6.1"
}

variable "app_hosts" {
  description = "Hostnames published by the application Ingress in each environment."
  type        = map(string)
  default = {
    dev  = "api.dev.devsu-demo.local"
    test = "api.test.devsu-demo.local"
    prod = "api.devsu-demo.local"
  }
}
