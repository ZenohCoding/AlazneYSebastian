import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

async function checkForUpdates() {
    try {
        const update = await check();

        if (update) {
            console.log(`Update available: ${update.version}`);

            const shouldUpdate = confirm(
                `A new update (${update.version}) is available. Do you want to install it?`
            );

            if (shouldUpdate) {
                console.log("Downloading update...");

                await update.downloadAndInstall();

                console.log("Update installed. Restarting...");

                await relaunch();
            }
        } else {
            console.log("Your app is up to date.");
        }
    } catch (error) {
        console.error("Updater error:", error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    checkForUpdates();
});