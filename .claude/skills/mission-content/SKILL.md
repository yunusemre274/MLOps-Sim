# Görev/Senaryo Şablonu Oluşturma Skill

## Ne Zaman Tetiklenir
Yeni görev (mission) şablonu, statik asset veya senaryo şablonu eklenirken.

## Adım Adım Nasıl Uygulanır

### Yeni Görev Oluşturma
1. README.md Bölüm 7'deki ilgili aşamayı referans al — hangi beceriler test edilecek?
2. README.md Bölüm 10.4'teki Mission JSON şemasını referans al
3. Görevin aşamasına uygun zorluk seviyesini belirle
4. Statik asset'leri hazırla (main.py, requirements.txt vb.) — `public/assets/stageX/` altına koy
5. Statik asset'lerin çalıştığını doğrula (syntax check, import kontrolü)
6. expectedCriteria'yı tanımla — parser'ın kontrol edeceği kriterler
7. Ödül değerlerini README.md Bölüm 6.3'teki tabloya uygun belirle
8. Görev JSON dosyasını `src/data/missions/stageX/` altında oluştur

### Zorluk Seviyesi Kriterleri
| Aşama | İzin Verilen | İzin Verilmeyen |
|-------|-------------|------------------|
| 1 (Junior) | FROM, WORKDIR, COPY, RUN, EXPOSE, CMD | Multi-stage, USER, HEALTHCHECK, Compose, K8s |
| 2 (Junior+) | + Multi-stage, USER, ARG | Compose, K8s |
| 3 (Junior→Mid) | + Compose (tek/iki servis), .env, volumes | Çoklu network, resource limits, K8s |
| 4 (Mid) | + Çoklu servis, networks, deploy.resources | K8s, CI/CD |
| 5 (Mid-Senior) | + CI/CD YAML, temel K8s | HPA, Ingress, monitoring |
| 6 (Senior) | + Tam K8s stack, monitoring, incident | — |
| 7 (Lead) | + Yönetim, delegasyon, maliyet | — |

### Senaryo Şablonu
1. aiPromptTemplate alanını yaz — AI'ya gönderilecek prompt
2. variables alanını tanımla — değişken yerleştiriciler
3. Şablonun farklı seed'lerle farklı çıktılar üreteceğini doğrula

## Sık Yapılan Hatalar
- Aşama 1 görevine multi-stage build kriteri koymak (seviye tutarsızlığı)
- Statik asset'lerdeki kodun gerçekten çalışıp çalışmadığını test etmemek
- expectedCriteria'da parser'ın henüz desteklemediği bir kriter kullanmak
- Ödül değerlerini README'deki tabloyla tutarsız belirlemek
- Senaryo şablonunda teknik kısıtlamaları belirsiz bırakmak
