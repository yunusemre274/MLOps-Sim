# NPC İçerik Üretim Skill

## Ne Zaman Tetiklenir
Yeni NPC karakteri veya NPC olayı/diyaloğu oluşturulurken.

## Adım Adım Nasıl Uygulanır

### Yeni NPC Oluşturma
1. README.md Bölüm 5.3'teki NPC JSON şemasını referans al
2. Mevcut NPC'lerin listesini kontrol et — kişilik/meslek çeşitliliği sağla
3. Yeni NPC JSON dosyasını `src/data/npcs/` altında oluştur
4. Zorunlu alanlar: id, name, gender, age, personality, interests, frequentLocations, profession, initialRelationship, eventPool, dialogueStyle
5. frequentLocations ağırlıkları toplamının 1.0'ı aşmamasına dikkat et
6. En az 3 benzersiz olay (eventPool) ata
7. Kariyer-NPC kesişimi varsa profession.canProvideJobReferral'ı true yap

### Yeni Olay Oluşturma
1. README.md Bölüm 5.6'daki Event JSON şemasını referans al
2. Olayın tetikleneceği mekanları ve minimum ilişki seviyesini belirle
3. Olay zincirini kur — her adımda en az 2 seçenek sun
4. Her seçeneğin effects'ini tanımla (relationship, money, stress, time)
5. Gerekiyorsa flag'lar ekle (setFlags, requiredFlags, excludedFlags)
6. futureEvent ile zincirleme olaylar oluştur
7. Dosyayı `src/data/events/` altındaki uygun kategoriye koy

## Ton Kuralları
- Diyaloglar doğal, günlük konuşma diliyle yazılır (Türkçe)
- NPC'nin kişilik tipine uygun konuşma stili kullanılır
- Manipülatif/toksik ilişki kalıpları özendirilmez
- Kariyer olayları gerçekçi ama teşvik edici tonda olur

## Sık Yapılan Hatalar
- NPC id formatını tutarsız yazmak (doğru: npc_isim_numara)
- Olay zincirinde nextStep: null olmayan sona ermeyen dallar bırakmak
- effects'te bilinmeyen anahtar kullanmak (geçerli: relationship, money, stress, health, time)
- Aynı mekan için çok fazla NPC yığmak — dağılım dengesi bozulur
- cooldownDays eklememek — aynı olay sürekli tetiklenir
