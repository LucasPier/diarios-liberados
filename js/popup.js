document.addEventListener('DOMContentLoaded', () => {
    const versionElement = document.getElementById('extension-version');
    if (versionElement) {
        try {
            const manifest = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest() : null;
            const version = manifest ? manifest.version : '1.1.0';
            versionElement.textContent = `v${version}`;
        } catch (e) {
            versionElement.textContent = 'v1.1.0';
        }
    }
});
