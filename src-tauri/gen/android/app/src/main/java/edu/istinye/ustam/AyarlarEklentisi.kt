package edu.istinye.ustam

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin

// Reddedilen bir izni kullanıcının kendisinin açabilmesi için uygulamanın sistem ayar sayfasını açar.
// Rust tarafı: src-tauri/src/permissions.rs → ayarlar_eklentisi / sistem_ayarlarini_ac (docs/izinler.md).
@TauriPlugin
class AyarlarEklentisi(private val activity: Activity) : Plugin(activity) {
  @Command
  fun uygulamaAyarlariniAc(invoke: Invoke) {
    try {
      val niyet = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", activity.packageName, null))
      activity.startActivity(niyet)
      invoke.resolve()
    } catch (e: Exception) {
      invoke.reject(e.message ?: "ayarlar açılamadı")
    }
  }
}
