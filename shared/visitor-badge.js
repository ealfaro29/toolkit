/**
 * Visitor Badge - VGTools Pro
 * Adds a visitor counter badge using visitorbadge.io API
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const container = document.getElementById('visitor-badge');
        if (!container) return;

        const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
        const cleanPath = window.location.pathname.replace(/index\.html$/i, '').replace(/\/+$/, '/');
        const canonicalPath = isLocalHost
            ? `https://vgtools.pro${cleanPath === '' ? '/' : cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`
            : `${window.location.origin}${cleanPath === '' ? '/' : cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;

        let accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        if (accentColor.startsWith('#')) {
            accentColor = accentColor.substring(1);
        }
        if (!accentColor || accentColor.length < 6) {
            accentColor = 'E72F2F'; // Fallback to brand red
        }

        const encodedPath = encodeURIComponent(canonicalPath);
        const badgeUrl = `https://api.visitorbadge.io/api/visitors?path=${encodedPath}&label=Visitors&labelColor=%23555555&countColor=%23${accentColor}&style=flat`;
        const linkUrl = `https://api.visitorbadge.io/api/visitors?path=${encodedPath}`;
        const img = new Image();
        img.alt = 'Visitors';
        img.decoding = 'async';
        img.loading = 'eager';
        img.referrerPolicy = 'no-referrer';

        container.href = linkUrl;
        container.textContent = 'Visitors';
        img.addEventListener('load', function () {
            container.replaceChildren(img);
        });
        img.addEventListener('error', function () {
            container.textContent = 'Visitors unavailable';
            container.removeAttribute('href');
        });
        img.src = badgeUrl;
    });
})();
