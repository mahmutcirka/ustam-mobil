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

## Android (APK)

Android projesi `src-tauri/gen/android/` altında hazırdır (`tauri android init` ile üretildi; derleme çıktıları ve `.so` dosyaları `.gitignore` ile repoya girmez).

**Ön gereksinimler:** JDK 17, Android SDK (`platform-tools`, `platforms;android-36`, `build-tools;36.0.0`), NDK (`ndk;28.2.13676358`) ve Rust Android hedefleri. Android Studio şart değildir; komut satırı araçları yeterlidir.

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

Ortam değişkenleri: `JAVA_HOME` → JDK 17, `ANDROID_HOME` → SDK klasörü, `NDK_HOME` → `$ANDROID_HOME/ndk/<sürüm>`.

**Telefona deneme sürümü (debug APK, 64-bit ARM telefonlar):**
```bash
./node_modules/.bin/tauri android build --debug --apk --target aarch64
```
> Çıktı: `src-tauri/gen/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk`. Telefonda **Geliştirici seçenekleri → USB hata ayıklama** açıkken `adb install -r <apk>` ile yüklenir (Xiaomi'de ayrıca **USB üzerinden yükle**).

> **Windows notu:** Tauri derlenen `libustam_lib.so` dosyasını `jniLibs/` klasörüne sembolik bağlantıyla koyar; bunun için Windows **Geliştirici Modu** açık olmalıdır (Ayarlar → Sistem → Geliştiriciler için). Kapalıysa `.so` dosyası elle `app/src/main/jniLibs/arm64-v8a/` içine kopyalanır ve `src-tauri/gen/android/` içinde Gradle, Rust adımı atlanarak çalıştırılır: `./gradlew assembleArm64Debug -x rustBuildArm64Debug`.

> `bun run tauri android …` yerine `./node_modules/.bin/tauri android …` kullanılır; `bun run` sarmalayıcısıyla `android init`, Tauri CLI 2.12'de çöküyor.

**Dağıtım sürümü** (`--release`) imzalama anahtarı ister; anahtar dosyaları (`key.properties`, `*.jks`) repoya eklenmez.

## iOS

iOS derlemesi yalnız macOS + Xcode ile yapılır (`tauri ios init`, `tauri ios build`); Windows'ta mümkün değildir.

---
