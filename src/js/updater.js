document.body.style.background = "#222";

document.body.insertAdjacentHTML(
  "beforeend",
  `
  <div id="debug-box" style="
    position:fixed;
    top:20px;
    left:20px;
    right:20px;
    z-index:999999;
    background:#111;
    color:#00ff00;
    padding:20px;
    font-family:monospace;
    white-space:pre-wrap;
    border:2px solid #00ff00;
    max-height:80vh;
    overflow:auto;
  ">
  Loading updater...
  </div>
`
);

function log(msg) {
  console.log(msg);
  document.getElementById("debug-box").innerHTML += "\n" + msg;
}

log("✅ updater.js loaded");

(async () => {
  try {
    log("Importing updater...");

    const updater = await import("@tauri-apps/plugin-updater");

    log("✅ updater imported");

    const process = await import("@tauri-apps/api/process");

    log("✅ process imported");

    log("Checking for updates...");

    const update = await updater.check();

    if (!update) {
      log("❌ No update available.");
      return;
    }

    log("✅ Update found!");

    log("Current: " + update.currentVersion);
    log("Latest : " + update.version);

    log("Downloading...");

    await update.downloadAndInstall();

    log("✅ Installed");

    log("Restarting...");

    await process.relaunch();

  } catch (e) {
    log("💥 ERROR:");
    log(String(e));

    if (e.stack) {
      log(e.stack);
    }
  }
})();