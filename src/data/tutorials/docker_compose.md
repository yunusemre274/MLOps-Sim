# Docker Compose Temelleri

## Docker Compose Nedir?
Docker Compose, birden fazla container'ı tek bir dosya ile
tanımlayıp yönetmeyi sağlayan bir araçtır.

## docker-compose.yml Yapısı

  version: '3.8'
  services:
    web:
      image: nginx:alpine
      ports:
        - "80:80"
    db:
      image: postgres:15
      environment:
        POSTGRES_PASSWORD: secret

## Temel Komutlar
- docker compose up — servisleri başlatır
- docker compose down — servisleri durdurur ve siler
- docker compose ps — çalışan servisleri listeler
- docker compose logs — servis loglarını gösterir
- docker compose config — yapılandırmayı doğrular

## services Bölümü
Her servis bir container tanımlar:
- image: Kullanılacak Docker image
- build: Dockerfile'dan build etmek için
- ports: Port eşleme (host:container)
- environment: Ortam değişkenleri
- volumes: Dosya paylaşımı
- depends_on: Servis bağımlılıkları
- networks: Bağlı olduğu ağlar

## depends_on
Servislerin başlatma sırasını belirler:

  services:
    web:
      depends_on:
        - db
        - redis
    db:
      image: postgres:15
    redis:
      image: redis:7

Bu durumda önce db ve redis, sonra web başlatılır.

## volumes
Verileri kalıcı hale getirmek için:

  services:
    db:
      volumes:
        - db_data:/var/lib/postgresql/data
  volumes:
    db_data:

## networks
Servisler arası iletişim için:

  services:
    web:
      networks:
        - frontend
    api:
      networks:
        - frontend
        - backend
  networks:
    frontend:
    backend:
