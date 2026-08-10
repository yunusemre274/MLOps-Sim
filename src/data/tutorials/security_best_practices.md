# Docker Güvenlik En İyi Pratikleri

## 1. Minimal Base Image Kullan
- python:3.11-slim yerine python:3.11 kullanma
- Alpine image'ları daha küçüktür (~5MB)
- scratch — en küçük image (Go binary'leri için ideal)

## 2. Non-Root User ile Çalıştır
Root kullanıcısı ile çalışmak güvenlik riski oluşturur.

  RUN adduser --disabled-password --no-create-home appuser
  USER appuser

Veya sayısal UID ile:

  USER 1001

## 3. Multi-Stage Build
Build araçlarını final image'a dahil etme:

  FROM python:3.11 AS builder
  RUN pip install --prefix=/install -r requirements.txt

  FROM python:3.11-slim
  COPY --from=builder /install /usr/local
  USER 1001

## 4. Secrets'ı Image'a Gömme
YANLIŞ:
  COPY .env /app/.env
  ENV DB_PASSWORD=mysecret

DOĞRU:
  - Runtime'da env variable olarak geçir
  - Docker secrets veya K8s secrets kullan
  - docker run -e DB_PASSWORD=xxx

## 5. .dockerignore Kullan
Gereksiz dosyaların image'a girmesini engelle:

  .git
  .env
  __pycache__
  node_modules
  *.pyc
  .vscode

## 6. HEALTHCHECK Ekle
Container'ın sağlıklı olup olmadığını kontrol et:

  HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost:8080/health || exit 1

## 7. Sabit Tag Kullan
YANLIŞ: FROM python:latest
DOĞRU: FROM python:3.11.7-slim-bookworm

## 8. Layer Sayısını Azalt
RUN komutlarını && ile birleştir:

  RUN apt-get update && \
      apt-get install -y --no-install-recommends curl && \
      rm -rf /var/lib/apt/lists/*

## 9. Read-Only Filesystem
  docker run --read-only my-app

## 10. Vulnerability Scanning
  docker scan my-app
  trivy image my-app
