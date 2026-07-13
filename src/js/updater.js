import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/api/process";

async function checkForUpdates() {
  alert("🚀 Updater started");

  try {
    alert("🔍 Checking GitHub for updates...");

    const update = await check();

    alert("✅ check() finished");

    if (!update) {
      alert("❌ No update available (check() returned null)");
      return;
    }

    alert(
      "🎉 UPDATE FOUND!\n\n" +
      "Current Version: " + update.currentVersion + "\n" +
      "Latest Version: " + update.version
    );

    alert("⬇️ Starting download...");

    await update.downloadAndInstall();

    alert("✅ Download and installation completed!");

    alert("🔄 Relaunching app...");

    await relaunch();
  } catch (err) {
    alert(
      "💥 ERROR!\n\n" +
      "Type: " + typeof err + "\n\n" +
      "Message:\n" + String(err)
    );

    if (err?.message) {
      alert("Error message:\n\n" + err.message);
    }

    if (err?.stack) {
      alert("Stack:\n\n" + err.stack);
    }

    alert("JSON:\n\n" + JSON.stringify(err, null, 2));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  checkForUpdates();
});