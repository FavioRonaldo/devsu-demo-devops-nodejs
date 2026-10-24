output "cluster_name" {
  description = "Name of the Kubernetes cluster that hosts the platform."
  value       = var.create_cluster ? kind_cluster.this[0].name : var.kube_context
}

output "cluster_endpoint" {
  description = "Kubernetes API server endpoint."
  value       = var.create_cluster ? kind_cluster.this[0].endpoint : "existing cluster (${var.kube_context})"
}

output "kubeconfig_path" {
  description = "Kubeconfig file to use with kubectl."
  value       = local.kubeconfig_path
}

output "ingress_class" {
  description = "IngressClass served by Traefik."
  value       = "traefik"
}

output "cluster_issuer" {
  description = "cert-manager ClusterIssuer that signs the application certificates."
  value       = "devsu-demo-ca"
}

output "platform_releases" {
  description = "Helm releases installed on the cluster."
  value = {
    for release in [helm_release.metrics_server, helm_release.cert_manager, helm_release.traefik, helm_release.cluster_issuer] :
    release.name => "${release.chart} ${release.version} (${release.namespace})"
  }
}

output "app_urls" {
  description = "Application URLs per environment once the overlays are deployed."
  value       = { for env, host in var.app_hosts : env => "https://${host}" }
}

output "hosts_file_entry" {
  description = "Line to add to the hosts file to resolve the application hostnames locally."
  value       = "127.0.0.1 ${join(" ", values(var.app_hosts))}"
}
