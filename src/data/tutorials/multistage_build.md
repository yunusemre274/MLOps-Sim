# Multi-Stage Build

## Neden Multi-Stage?
Tek stage'li Dockerfile'larda build araçları (derleyici, SDK)
final image'a dahil olur. Bu gereksiz boyut artışına sebep olur.

Multi-stage build ile:
- Build aşaması ayrı bir stage'de yapılır
- Final image sadece çalıştırılabilir dosyaları içerir
- Image boyutu dramatik şekilde küçülür

## Temel Yapı

  # Stage 1: Build
  FROM python:3.11 AS builder
  WORKDIR /build
  COPY requirements.txt .
  RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

  # Stage 2: Runtime
  FROM python:3.11-slim
  WORKDIR /app
  COPY --from=builder /install /usr/local
  COPY . .
  CMD ["python", "app.py"]

## AS Keyword'ü
FROM satırında AS ile stage'e isim verilir.
Bu isim COPY --from=<isim> ile kullanılır.

  FROM node:18 AS frontend
  FROM golang:1.21 AS backend

## COPY --from
Başka bir stage'den dosya kopyalamak için kullanılır.

  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY --from=backend /app/server /usr/local/bin/

## Go Örneği (En Etkili)

  FROM golang:1.21 AS builder
  WORKDIR /src
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 go build -o /app

  FROM scratch
  COPY --from=builder /app /app
  CMD ["/app"]

Bu örnekte final image sadece derlenmiş binary'yi içerir.
Boyut: ~10MB (vs golang image: ~800MB)

## Node.js Örneği

  FROM node:18 AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  EXPOSE 80

## İpuçları
1. Her stage bağımsız bir FROM ile başlar
2. Stage isimleri küçük harf ve tire kullan (build-stage)
3. Final stage'de sadece gerekli dosyaları kopyala
4. scratch image'ı en küçük base image'dır (0 byte)
5. Alpine image'ları hafif alternatiflerdir (~5MB)
