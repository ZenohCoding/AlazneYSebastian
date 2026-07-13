function debug(msg) {
  let box = document.getElementById("updater-debug");

  if (!box) {
    box = document.createElement("div");
    box.id = "updater-debug";
    box.style.position = "fixed";
    box.style.bottom = "10px";
    box.style.right = "10px";
    box.style.background = "black";
    box.style.color = "lime";
    box.style.padding = "10px";
    box.style.zIndex = "999999";
    box.style.fontFamily = "monospace";
    document.body.appendChild(box);
  }

  box.innerHTML += "<br>" + msg;
}

window.addEventListener("DOMContentLoaded", async () => {
  debug("Updater started");

  if (!window.__TAURI__) {
    debug("ERROR: window.__TAURI__ is undefined. Check withGlobalTauri in tauri.conf.json");
    return;
  }

  if (!window.__TAURI__.updater) {
    debug("ERROR: updater plugin not found on window.__TAURI__. Check Rust plugin registration.");
    return;
  }

  try {
    const { check } = window.__TAURI__.updater;
    const { relaunch } = window.__TAURI__.process;

    const update = await check();

    if (!update) {
      debug("No update found");
      return;
    }

    debug(`Current: ${update.currentVersion}`);
    debug(`Latest: ${update.version}`);

    await update.downloadAndInstall();

    debug("Installed!");

    await relaunch();
  } catch (e) {
    debug("Error: " + String(e));
  }
});