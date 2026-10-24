#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

METRICS_SERVER_CHART_VERSION="3.14.0"
CERT_MANAGER_CHART_VERSION="v1.21.2"
TRAEFIK_CHART_VERSION="41.6.1"

helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/ --force-update
helm repo add jetstack https://charts.jetstack.io --force-update
helm repo add traefik https://traefik.github.io/charts --force-update
helm repo update

helm upgrade --install metrics-server metrics-server/metrics-server \
    --version "${METRICS_SERVER_CHART_VERSION}" \
    --namespace kube-system \
    --set 'args={--kubelet-insecure-tls}'

helm upgrade --install cert-manager jetstack/cert-manager \
    --version "${CERT_MANAGER_CHART_VERSION}" \
    --namespace cert-manager --create-namespace \
    --set crds.enabled=true \
    --wait --timeout 5m

helm upgrade --install traefik traefik/traefik \
    --version "${TRAEFIK_CHART_VERSION}" \
    --namespace traefik --create-namespace \
    --values "${DIR}/traefik-values.yaml" \
    "$@"

kubectl -n kube-system rollout status deployment/metrics-server --timeout=180s
kubectl -n traefik rollout status deployment/traefik --timeout=180s

kubectl apply -f "${DIR}/cluster-issuer.yaml"
kubectl -n cert-manager wait certificate/devsu-demo-ca --for=condition=Ready --timeout=120s
