# Kurulum ve Çalıştırma

### Ön Gereksinimler
- [Bun](https://bun.sh/) kurulu olmalıdır — macOS/Linux: `curl -fsSL https://bun.sh/install | bash`, Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`.
- [Rust & Cargo](https://rustup.rs/) kurulu olmalıdır.
- İşletim sisteminize göre [Tauri Önkoşulları](https://v2.tauri.app/start/prerequisites/) tamamlanmış olmalıdır.

### Adım Adım Çalıştırma

1. **Depoyu klonlayın:**
```bash
git clone https://github.com/mahmutcirka/ustam-mobil.git
cd ustam-mobil
```

2. **Bağımlılıkları yükleyin:**
```bash
bun install
```

3. **Web geliştirme sunucusunu başlatın:**
```bash
bun run dev
```
> Tarayıcınızda [http://127.0.0.1:1420](http://127.0.0.1:1420) adresinde açılır.

4. **Telefon görünümünde kontrol edin (Windows/macOS/Linux):**
```bash
bun run telefon
```
> Geliştirme sunucusu kapalıysa başlatır ve [http://localhost:1421](http://localhost:1421) adresinde uygulamayı telefon çerçevelerinin içinde açar: iPhone 15 / SE / 15 Pro Max, Pixel 8, Galaxy A54 boyutları, yatay–dikey döndürme, iPhone + Android yan yana görünüm ve sayfa kısayolları (AR/FA ile RTL kontrolü dahil). Yalnızca geliştirme aracıdır (`araclar/`); `dist/` ve Tauri paketine girmez.

5. **Tauri masaüstü/mobil penceresinde çalıştırın:**
```bash
bun run tauri dev
```

6. **Üretim sürümünü statik olarak derleyin:**
```bash
bun run build
```
> Çıktılar `dist/` klasörüne üretilir ve Tauri tarafından paketlenir.

---
