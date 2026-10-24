locals {
  kubeconfig_path = pathexpand(var.kubeconfig_path)
}

provider "kind" {}

provider "helm" {
  kubernetes = {
    host                   = var.create_cluster ? kind_cluster.this[0].endpoint : null
    client_certificate     = var.create_cluster ? kind_cluster.this[0].client_certificate : null
    client_key             = var.create_cluster ? kind_cluster.this[0].client_key : null
    cluster_ca_certificate = var.create_cluster ? kind_cluster.this[0].cluster_ca_certificate : null
    config_path            = var.create_cluster ? null : local.kubeconfig_path
    config_context         = var.create_cluster ? null : var.kube_context
  }
}
