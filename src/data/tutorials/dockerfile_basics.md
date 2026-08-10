# Dockerfile Temelleri

## Dockerfile Nedir?
Dockerfile, bir Docker image'ının nasıl oluşturulacağını tanımlayan
bir metin dosyasıdır. Her satır bir "direktif" (komut) içerir.

## FROM — Base Image Seçimi
Her Dockerfile bir FROM ile başlar. Hangi temel image'ı
kullanacağını belirtir.

  FROM python:3.11-slim
  FROM node:18-alpine
  FROM golang:1.21

## WORKDIR — Çalışma Dizini
Container içinde komutların çalışacağı dizini belirler.
Dizin yoksa otomatik oluşturulur.

  WORKDIR /app

## COPY — Dosya Kopyalama
Yerel dosyaları container'a kopyalar.

  COPY requirements.txt .
  COPY . .
  COPY src/ /app/src/

## RUN — Komut Çalıştırma
Image build sırasında komut çalıştırır.
Paket kurulumu, derleme gibi işlemler için kullanılır.

  RUN pip install -r requirements.txt
  RUN apt-get update && apt-get install -y curl

## EXPOSE — Port Belirleme
Container'ın hangi portu dinleyeceğini belirtir.
Sadece dokümantasyon amaçlıdır, gerçek port açmaz.

  EXPOSE 8080

## CMD — Varsayılan Çalıştırma Komutu
Container başlatıldığında çalışacak komutu belirler.

  CMD ["python", "app.py"]
  CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]

## ENV — Ortam Değişkeni
Container içinde ortam değişkeni tanımlar.

  ENV NODE_ENV=production
  ENV PORT=8080

## İyi Pratikler
1. Önce değişmeyen dosyaları kopyala (requirements.txt, package.json)
2. Sonra pip/npm install yap (cache'ten faydalanır)
3. En son kaynak kodunu kopyala
4. slim veya alpine image'ları tercih et (küçük boyut)
5. RUN komutlarını && ile birleştir (daha az katman)
