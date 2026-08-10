# Kubernetes Temelleri

## Kubernetes (K8s) Nedir?
Container'ları büyük ölçekte yönetmek için bir orkestrasyon platformu.
Otomatik dağıtım, ölçekleme ve iyileşme sağlar.

## Temel Kavramlar
- Pod: En küçük deploy edilebilir birim (1+ container)
- Deployment: Pod'ların istenen durumunu tanımlar
- Service: Pod'lara ağ erişimi sağlar
- ConfigMap: Yapılandırma verilerini tutar
- Secret: Hassas bilgileri (şifre, token) tutar

## Deployment Manifest

  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: my-app
  spec:
    replicas: 3
    selector:
      matchLabels:
        app: my-app
    template:
      metadata:
        labels:
          app: my-app
      spec:
        containers:
          - name: my-app
            image: my-app:latest
            ports:
              - containerPort: 8080

## Service Manifest

  apiVersion: v1
  kind: Service
  metadata:
    name: my-app-service
  spec:
    selector:
      app: my-app
    ports:
      - port: 80
        targetPort: 8080
    type: ClusterIP

## Liveness ve Readiness Probe

  livenessProbe:
    httpGet:
      path: /health
      port: 8080
    initialDelaySeconds: 10
    periodSeconds: 5

## Resource Limits

  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "250m"

## Temel kubectl Komutları
- kubectl apply -f manifest.yml
- kubectl get pods
- kubectl get services
- kubectl describe pod <pod-name>
- kubectl logs <pod-name>
- kubectl delete -f manifest.yml
