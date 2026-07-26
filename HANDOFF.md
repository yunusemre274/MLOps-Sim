# HANDOFF — Son Güncelleme: 2026-07-26

## Şu An Neredeyiz
- Aktif Faz: Faz 0 - Temel İskelet
- Son tamamlanan görev: Sahne yönetim sistemi (SceneManager bileşeni)
- Son commit: `[Faz 0] Sahne yönetim sistemi (SceneManager bileşeni)`

## Tamamlanan Görevler (Bu Session)
1. ✅ React projesi oluşturma (Vite ile)
2. ✅ Klasör yapısı oluşturma
3. ✅ Zustand ile merkezi GameState store kurulumu
4. ✅ Sahne yönetim sistemi (SceneManager bileşeni)

## Yarım Kalan İş (varsa)
- Yok — Görev 4 tamamlandı. HomeScene minimal placeholder olarak oluşturuldu (SceneManager bağımlılığı için). Görev 5'te detaylandırılacak.

## Bir Sonraki Session'da Yapılacak İlk Şey
- Faz 0, Görev 5: Boş HomeScene bileşenini detaylandırma (ev içi placeholder UI)

## Bilinen Sorunlar / Dikkat Edilmesi Gerekenler
- Vite scaffold `--overwrite` ile mevcut dosyaları silmişti, git checkout ile geri yüklendi.
- HomeScene şu an minimal placeholder — Görev 5'te tıklanabilir alan layout'u eklenecek.

## Bu Session'da Alınan Önemli Kararlar
- SceneManager SCENE_MAP pattern'i kullanıyor — yeni sahne eklemek için sadece import + map kaydı yeterli.
- SceneManager bilinmeyen sahne için hata yerine kullanıcıya görsel uyarı gösteriyor.
- HomeScene placeholder olarak oluşturuldu ki SceneManager commit'i tek başına çalışır olsun.
