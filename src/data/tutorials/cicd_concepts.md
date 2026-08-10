# CI/CD Kavramları

## CI — Continuous Integration (Sürekli Entegrasyon)
Her kod değişikliğinde otomatik build ve test çalıştırmak.
Amaç: Hataları erken yakalamak.

Tipik CI adımları:
1. Kod çekilir (checkout)
2. Bağımlılıklar kurulur
3. Lint çalıştırılır (kod kalite kontrolü)
4. Unit testler çalıştırılır
5. Build yapılır
6. Sonuçlar raporlanır

## CD — Continuous Delivery/Deployment
CI'dan sonra otomatik deployment.

Continuous Delivery: Her başarılı build deploy'a HAZIR
Continuous Deployment: Her başarılı build OTOMATİK deploy edilir

## Pipeline Kavramı
Sıralı adımlardan oluşan otomasyon zinciri:

  Commit → Build → Test → Package → Deploy

## Ortamlar (Environments)
- Development (dev): Geliştiricilerin test ettiği ortam
- Staging: Production'a en yakın test ortamı
- Production (prod): Kullanıcıların eriştiği canlı ortam

## Deployment Stratejileri
- Rolling Update: Eski pod'lar birer birer yenileniyle değiştirilir
- Blue-Green: İki ortam arasında geçiş yapılır
- Canary: Yeni versiyon küçük bir kullanıcı grubuna sunulur

## Artifact ve Registry
- Artifact: Build çıktısı (Docker image, JAR, binary)
- Registry: Artifact'ların depolandığı yer
  - Docker Hub, GitHub Container Registry, AWS ECR

## İyi Pratikler
1. Her commit'te CI çalıştır
2. Test kapsamını (coverage) takip et
3. Rollback stratejisi planla
4. Infrastructure as Code (IaC) kullan
5. Monitoring ve alerting kur
