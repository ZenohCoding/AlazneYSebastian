import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/api/process';

async function checkForUpdates() {
    try {
        console.log("Checking for updates...");
        
        // Check if an update is available based on your remote update.json
        const update = await check();
        
        if (update) {
            console.log(`New update found! Current version: ${update.currentVersion} -> New version: ${update.version}`);
            
            // You can optionally update your UI here (e.g., showing a status text like "Downloading update...")
            console.log("Downloading and installing update...");
            
            // This downloads and installs the update bundle securely
            await update.downloadAndInstall();
            
            console.log("Update installed successfully! Relaunching application...");
            
            // Restarts the application to apply the update immediately
            await relaunch();
        } else {
            console.log("Application is already up to date.");
        }
    } catch (error) {
        console.error("Failed to check or install update:", error);
    }
}

// Automatically trigger the update check as soon as the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    checkForUpdates();
}); 