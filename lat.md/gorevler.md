# Görevler ve durum

Ders görevlerinin (MYO063 Mobil Programlama) bu repodaki karşılığı ve güncel durumu; ayrıntılı görev → PR eşlemesi teslim belgesindedir.

Görev metinleri [[docs/tasks]] altında ve salt okunurdur; eşleme [[docs/teslim.md]], istem günlükleri [[docs/istemler]]. Bu bölüm yalnız şu anki durumu özetler.

## Batch 01 (Hafta 03)

Fork, proje fikri, README, AGENTS.md, markalama, bilgi sayfaları ve mimari görevleri tamamlandı ve `v0.1.0-batch-01` etiketiyle teslim edildi.

Denetim matrisi [[docs/ilerleme-batch-01.md]]. Sonraki tasarım, kural motoru ve takip çalışmaları `v0.2.0` etiketinde toplandı.

## Batch 02 (Hafta 04)

Veri sözleşmesi, Kart bileşeni, liste ve üç durum, detay ekranı ve Rust komutu görevleri (11–15) master'da; çalışma yöntemi (10) belgelendi.

Denetim matrisi [[docs/ilerleme-batch-02.md]]; masaüstü penceresinin en küçük boyutu 360×600 ([[src-tauri/tauri.conf.json]]). Açık kalanlar öğrencinin GitHub'da yapacağı adımlardır: master için kural seti ve ekran görüntüsü (09.1) ile yeni sohbette kural testi yanıtı (10). Görev 16 bu adımlar bitince `v0.2.0-batch-02` etiketiyle kapanır.

## Hafta 05

Projeyi yapay zekânın anlayacağı hale getirmek için lat.md bilgi grafiği eklendi; yönetim paneli görev dosyası gelince ana projede `admin/` altına eklenecek.

Bilgi grafiği bu klasördür; ajan kuralları tek kaynak olarak [[AGENTS.md]] içindedir ve [[CLAUDE.md]] ile [[GEMINI.md]] yalnız ona yönlendirir. Ek olarak yetkiler (izinler) haftasında izin merkezi, tek seferlik konum ve yerel bildirimler eklendi ([[izinler]]).
