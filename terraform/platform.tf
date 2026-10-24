locals {
  traefik_kind_values = [
    { name = "service.type", value = "NodePort" },
    { name = "ports.web.nodePort", value = "30080" },
    { name = "ports.websecure.nodePort", value = "30443" },
  ]
}

resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = var.metrics_server_chart_version
  namespace  = "kube-system"
  wait       = true
  timeout    = 300

  set_list = [
    {
      name  = "args"
      value = ["--kubelet-insecure-tls"]
    },
  ]

  depends_on = [kind_cluster.this]
}

resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = var.cert_manager_chart_version
  namespace        = "cert-manager"
  create_namespace = true
  wait             = true
  timeout          = 300

  set = [
    {
      name  = "crds.enabled"
      value = "true"
    },
  ]

  depends_on = [kind_cluster.this]
}

resource "helm_release" "traefik" {
  name             = "traefik"
  repository       = "https://traefik.github.io/charts"
  chart            = "traefik"
  version          = var.traefik_chart_version
  namespace        = "traefik"
  create_namespace = true
  wait             = false
  timeout          = 300

  values = [file("${path.module}/../k8s/platform/traefik-values.yaml")]
  set    = var.create_cluster ? local.traefik_kind_values : []

  depends_on = [kind_cluster.this]
}

resource "helm_release" "cluster_issuer" {
  name      = "cluster-issuer"
  chart     = "${path.module}/charts/cluster-issuer"
  namespace = "cert-manager"
  wait      = true
  timeout   = 120

  depends_on = [helm_release.cert_manager]
}
