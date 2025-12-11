/**
 * Visitor Badge - VGTools Pro
 * Adds a visitor counter badge using visitorbadge.io API
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const container = document.getElementById('visitor-badge');
        if (!container) return;

        const title = document.title;
        const pagePath = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
        const fullPath = `ealfaro29.toolkit.${pagePath}`;

        let accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        if (accentColor.startsWith('#')) {
            accentColor = accentColor.substring(1);
        }
        if (!accentColor || accentColor.length < 6) {
            accentColor = 'E72F2F'; // Fallback to brand red
        }

        const badgeUrl = `https://api.visitorbadge.io/api/visitors?path=${fullPath}&labelColor=%23555555&countColor=%23${accentColor}`;
        const linkUrl = `https://visitcount.itsvg.in/api?id=${fullPath}&color=12`;

        container.href = linkUrl;
        container.innerHTML = `<img src="${badgeUrl}" alt="Visitors" />`;
    });
})();
