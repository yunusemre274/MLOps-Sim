# Docker Compose Parser Skill

## Ne Zaman Tetiklenir
Docker Compose parser modülü üzerinde çalışırken — yeni direktif desteği, hata simülasyonu, YAML ayrıştırma iyileştirmesi yaparken.

## Adım Adım Nasıl Uygulanır
1. `src/engine/composeParser.js` dosyasını aç
2. README.md Bölüm 9.1'deki Compose direktif listesini referans al
3. YAML ayrıştırma için js-yaml kütüphanesini kullan
4. Her servis için ayrıştır: build/image, ports, volumes, environment, env_file, networks, depends_on, deploy.resources, command, healthcheck, restart
5. Servisler arası bağımlılık grafiğini çıkar (depends_on)
6. Network tanımlarını doğrula — tanımsız network referansı → hata
7. Compose build log üretici'ye servis başlatma sırası bilgisini aktar
8. Birim testi yaz

## Örnek Girdi/Çıktı

Girdi (docker-compose.yml):
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '8000:8000'
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
```

Beklenen çıktı:
```json
{
  "version": "3.8",
  "services": {
    "api": { "build": ".", "ports": ["8000:8000"], "depends_on": ["db"] },
    "db": { "image": "postgres:15-alpine", "volumes": ["db_data:/var/lib/postgresql/data"] }
  },
  "volumes": { "db_data": {} },
  "startOrder": ["db", "api"],
  "errors": [],
  "warnings": []
}
```

## Sık Yapılan Hatalar
- depends_on'da tanımsız servis referansı kontrolü yapmamak
- Network tanımı olmadan servisin network'e bağlanması
- Port mapping formatını doğrulamamak (host:container)
- Volume tanımlarındaki named vs bind mount ayrımını atlamak
- deploy.resources altındaki limits ve reservations yapısını düz çevirmek
