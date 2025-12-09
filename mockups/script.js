const WIKI_DATA = {
    "title": "Device Mockups",
    "sections": [
        {
            "title": "How to Use",
            "content": [
                "<b>1. Upload Image:</b> Click or drag-drop your screenshot into the upload zone.",
                "<b>2. Select Device:</b> Choose from Phone, Tablet, Laptop, Watch, or Monitor.",
                "<b>3. Adjust Position:</b> Drag directly on the canvas to reposition your image.",
                "<b>4. Zoom:</b> Use your mouse wheel to scale the image up or down.",
                "<b>5. Customize:</b> Change orientation (for phones/tablets) and select frame color.",
                "<b>6. Download:</b> Click 'Download Mockup' to save your high-resolution PNG."
            ]
        },
        {
            "title": "Features",
            "content": [
                "<b>5 Devices:</b> Modern phone, tablet, laptop, smartwatch, and desktop monitor.",
                "<b>Realistic Materials:</b> Choose between white (glossy plastic), black (matte), or silver (metallic) finishes.",
                "<b>Direct Manipulation:</b> No sliders—just drag and scroll for intuitive control.",
                "<b>Transparent Export:</b> Perfect for presentations and marketing materials."
            ]
        }
    ]
};

/*
 * SVG Generator Class
 * Mimics CanvasRenderingContext2D for SVG export
 */
class SvgGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.xml = [];
        this.defs = [];
        this.currentPath = '';
        this.idCounter = 0;

        // State stack for save/restore
        this.stack = [];
        // Current state
        this.state = {
            fill: 'transparent',
            stroke: 'none',
            shadow: null,
            openTags: 0
        };

        this.xml.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    }

    getXml() {
        return this.xml.join('') + (this.defs.length ? `<defs>${this.defs.join('')}</defs>` : '') + '</svg>';
    }

    // Canvas API Mocks
    save() {
        this.stack.push(JSON.parse(JSON.stringify(this.state)));
        this.state.openTags = 0;
    }

    restore() {
        for (let i = 0; i < this.state.openTags; i++) {
            this.xml.push('</g>');
        }
        if (this.stack.length > 0) {
            this.state = this.stack.pop();
        }
    }

    translate(x, y) {
        this.xml.push(`<g transform="translate(${x}, ${y})">`);
        this.state.openTags++;
    }

    scale(x, y) {
        this.xml.push(`<g transform="scale(${x}, ${y})">`);
        this.state.openTags++;
    }

    // Shadow properties
    get shadowColor() { return (this.state.shadow && this.state.shadow.color) || 'transparent'; }
    set shadowColor(c) { this.initShadow(); this.state.shadow.color = c; }

    get shadowBlur() { return (this.state.shadow && this.state.shadow.blur) || 0; }
    set shadowBlur(b) { this.initShadow(); this.state.shadow.blur = b; }

    get shadowOffsetY() { return (this.state.shadow && this.state.shadow.offsetY) || 0; }
    set shadowOffsetY(y) { this.initShadow(); this.state.shadow.offsetY = y; }

    initShadow() { if (!this.state.shadow) this.state.shadow = { color: 'transparent', blur: 0, offsetY: 0, offsetX: 0 }; }

    get fillStyle() { return this.state.fill; }
    set fillStyle(v) { this.state.fill = v; }

    // Path methods
    beginPath() { this.currentPath = ''; }
    moveTo(x, y) { this.currentPath += `M ${x} ${y} `; }
    lineTo(x, y) { this.currentPath += `L ${x} ${y} `; }
    quadraticCurveTo(cpx, cpy, x, y) { this.currentPath += `Q ${cpx} ${cpy} ${x} ${y} `; }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.currentPath += `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y} `; }
    closePath() { this.currentPath += 'Z '; }

    rect(x, y, w, h) { this.currentPath += `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`; }

    fillRect(x, y, w, h) {
        this.xml.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${this.state.fill}" />`);
    }

    arc(x, y, r, start, end) {
        // Assume full circle for this app usage
        this.xml.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${this.state.fill}" />`);
    }

    fill() {
        let filterAttr = '';
        if (this.state.shadow && this.state.shadow.color !== 'transparent' && this.state.shadow.blur > 0) {
            const id = 'shadow-' + (this.idCounter++);
            const s = this.state.shadow;
            this.defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="${s.offsetX || 0}" dy="${s.offsetY}" stdDeviation="${s.blur / 2}" flood-color="${s.color}" />
            </filter>`);
            filterAttr = `filter="url(#${id})"`;
        }
        this.xml.push(`<path d="${this.currentPath}" fill="${this.state.fill}" ${filterAttr} />`);
    }

    clip() {
        const id = 'clip-' + (this.idCounter++);
        this.defs.push(`<clipPath id="${id}"><path d="${this.currentPath}" /></clipPath>`);
        this.xml.push(`<g clip-path="url(#${id})">`);
        this.state.openTags++;
    }

    drawImage(img, x, y, w, h) {
        this.xml.push(`<image href="${img.src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" />`);
    }

    // Text properties
    get font() { return this.state.font || '14px sans-serif'; }
    set font(v) { this.state.font = v; }

    get textAlign() { return this.state.textAlign || 'left'; }
    set textAlign(v) { this.state.textAlign = v; }

    get textBaseline() { return this.state.textBaseline || 'alphabetic'; }
    set textBaseline(v) { this.state.textBaseline = v; }

    fillText(text, x, y) {
        // Parse font to get size
        const fontMatch = this.state.font?.match(/(\d+)px/) || ['14px', '14'];
        const fontSize = fontMatch[1];
        const fontFamily = this.state.font?.includes('sans-serif') ? 'sans-serif' : 'serif';

        let anchor = 'start';
        if (this.state.textAlign === 'center') anchor = 'middle';
        else if (this.state.textAlign === 'right') anchor = 'end';

        let dy = '0';
        if (this.state.textBaseline === 'middle') dy = '0.35em';
        else if (this.state.textBaseline === 'top') dy = '0.8em';

        this.xml.push(`<text x="${x}" y="${y}" fill="${this.state.fill}" font-size="${fontSize}" font-family="${fontFamily}" text-anchor="${anchor}" dy="${dy}">${text}</text>`);
    }

    // Stroke properties
    get strokeStyle() { return this.state.stroke || 'none'; }
    set strokeStyle(v) { this.state.stroke = v; }

    get lineWidth() { return this.state.lineWidth || 1; }
    set lineWidth(v) { this.state.lineWidth = v; }

    stroke() {
        this.xml.push(`<path d="${this.currentPath}" fill="none" stroke="${this.state.stroke}" stroke-width="${this.state.lineWidth}" />`);
    }
}

const MockupApp = {
    el: {},
    state: {
        splashHidden: false,
        isWikiLoaded: false,
        currentDevice: 'phone',
        currentOrientation: 'portrait',
        currentColor: 'white',
        showStatusBar: false,

        uploadedImage: null,
        imageScale: 1.0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0
    },
    THEMES: ['light', 'dark', 'system'],
    THEME_ICONS: { light: '☀️', dark: '🌔', system: '⚙️' },

    // Device configurations with realistic proportions
    devices: {
        phone: {
            width: 400, height: 800,
            screenX: 25, screenY: 60,
            screenWidth: 350, screenHeight: 680,
            radius: 40,
            notch: 'island',
            colors: {
                white: { frame: '#ffffff', bezel: '#ffffff', shadow: '#f0f0f0' },
                black: { frame: '#1a1a1a', bezel: '#0a0a0a', shadow: '#000000' },
                silver: { frame: '#c0c0c0', bezel: '#d0d0d0', shadow: '#a0a0a0' }
            }
        },
        tablet: {
            width: 700, height: 500,
            screenX: 40, screenY: 40,
            screenWidth: 620, screenHeight: 420,
            radius: 20,
            colors: {
                white: { frame: '#ffffff', bezel: '#ffffff', shadow: '#f0f0f0' },
                black: { frame: '#1a1a1a', bezel: '#0a0a0a', shadow: '#000000' },
                silver: { frame: '#c0c0c0', bezel: '#d0d0d0', shadow: '#a0a0a0' }
            }
        },
        laptop: {
            width: 800, height: 520,
            screenX: 15, screenY: 15,
            screenWidth: 770, screenHeight: 460,
            radius: 10,
            hasStand: true,
            colors: {
                white: { frame: '#f0f0f0', bezel: '#1a1a1a', shadow: '#e0e0e0', base: '#e8e8e8' },
                black: { frame: '#2a2a2a', bezel: '#0a0a0a', shadow: '#1a1a1a', base: '#1a1a1a' },
                silver: { frame: '#c8c8c8', bezel: '#1a1a1a', shadow: '#a0a0a0', base: '#b0b0b0' }
            }
        },
        watch: {
            width: 250, height: 280,
            screenX: 25, screenY: 50,
            screenWidth: 200, screenHeight: 200,
            radius: 40,
            colors: {
                white: { frame: '#ffffff', bezel: '#ffffff', shadow: '#f0f0f0' },
                black: { frame: '#1a1a1a', bezel: '#0a0a0a', shadow: '#000000' },
                silver: { frame: '#c0c0c0', bezel: '#d0d0d0', shadow: '#a0a0a0' }
            }
        },
        monitor: {
            width: 900, height: 570,
            screenX: 25, screenY: 25,
            screenWidth: 850, screenHeight: 480,
            radius: 8,
            hasStand: true,
            standHeight: 70,
            colors: {
                white: { frame: '#f5f5f5', bezel: '#1a1a1a', shadow: '#e0e0e0', stand: '#ebebeb' },
                black: { frame: '#1a1a1a', bezel: '#0a0a0a', shadow: '#000000', stand: '#2a2a2a' },
                silver: { frame: '#c8c8c8', bezel: '#1a1a1a', shadow: '#a0a0a0', stand: '#b0b0b0' }
            }
        }
    },

    init() {
        this.cacheDOMElements();
        this.initTheme();
        this.checkSplashPreference();
        this.bindEvents();
        this.loadDefaultBackground();
        this.renderCanvas();
    },

    loadDefaultBackground() {
        const img = new Image();
        img.onload = () => {
            this.state.uploadedImage = img;
            this.state.imageScale = 1.0; // Cover mode will auto-fill screen
            this.el.downloadBtn.disabled = false;
            this.el.mockupCanvas.classList.add('has-image');
            this.renderCanvas();
        };
        img.src = 'background.png';
    },

    cacheDOMElements() {
        const ids = ['theme-toggle', 'wiki-open-btn', 'wiki-overlay', 'splash-screen', 'app-container', 'splash-close-btn', 'upload-zone', 'file-input', 'mockup-canvas', 'download-btn', 'orientation-toggle'];
        ids.forEach(id => {
            const key = id.replace(/-(\w)/g, (_, char) => char.toUpperCase());
            const element = document.getElementById(id);
            if (element) this.el[key] = element;
        });
    },

    bindEvents() {
        // Theme & Wiki
        if (this.el.themeToggle) this.el.themeToggle.addEventListener('click', () => this.cycleTheme());
        if (this.el.wikiOpenBtn) this.el.wikiOpenBtn.addEventListener('click', () => this.openWiki());

        // Splash
        if (this.el.splashScreen) {
            this.el.splashScreen.addEventListener('click', (e) => {
                if (e.target === this.el.splashScreen) {
                    const cb = document.getElementById('splash-dont-show-checkbox');
                    this.hideSplashScreen(cb?.checked || false);
                }
            });
        }
        if (this.el.splashCloseBtn) this.el.splashCloseBtn.addEventListener('click', () => {
            const cb = document.getElementById('splash-dont-show-checkbox');
            this.hideSplashScreen(cb?.checked || false);
        });

        // Upload
        if (this.el.uploadZone) {
            this.el.uploadZone.addEventListener('click', () => this.el.fileInput.click());
            this.el.uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.el.uploadZone.style.borderColor = 'var(--accent-color)';
            });
            this.el.uploadZone.addEventListener('dragleave', () => {
                this.el.uploadZone.style.borderColor = 'var(--border-color)';
            });
            this.el.uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.el.uploadZone.style.borderColor = 'var(--border-color)';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) this.handleImageUpload(file);
            });
        }

        if (this.el.fileInput) {
            this.el.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.handleImageUpload(e.target.files[0]);
            });
        }

        // Device Buttons
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentDevice = btn.dataset.device;

                // Default orientations
                if (this.state.currentDevice === 'tablet') {
                    this.state.currentOrientation = 'landscape';
                } else {
                    this.state.currentOrientation = 'portrait';
                }

                this.resetImageTransform();
                this.renderCanvas();
            });
        });

        // Orientation Toggle
        if (this.el.orientationToggle) {
            this.el.orientationToggle.addEventListener('click', () => {
                this.state.currentOrientation = this.state.currentOrientation === 'portrait' ? 'landscape' : 'portrait';
                this.resetImageTransform(); // Optional: reset image transform on rotate? better yes
                this.renderCanvas();
            });
        }

        // Status Bar Toggle (Floating button for Phone Portrait only)
        const statusBarToggle = document.getElementById('status-bar-toggle');
        if (statusBarToggle) {
            statusBarToggle.addEventListener('click', () => {
                this.state.showStatusBar = !this.state.showStatusBar;
                // Update button appearance based on state
                if (this.state.showStatusBar) {
                    statusBarToggle.style.background = 'var(--accent-color)';
                    statusBarToggle.style.color = 'white';
                } else {
                    statusBarToggle.style.background = 'var(--surface)';
                    statusBarToggle.style.color = 'var(--ink)';
                }
                this.renderCanvas();
            });
        }


        // Color Buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentColor = btn.dataset.color;
                this.renderCanvas();
            });
        });



        // Canvas interactions
        if (this.el.mockupCanvas) {
            // Mouse drag
            this.el.mockupCanvas.addEventListener('mousedown', (e) => {
                if (this.state.uploadedImage) {
                    this.state.isDragging = true;
                    this.state.dragStartX = e.offsetX;
                    this.state.dragStartY = e.offsetY;
                    this.el.mockupCanvas.classList.add('dragging');
                }
            });

            this.el.mockupCanvas.addEventListener('mousemove', (e) => {
                if (this.state.isDragging && this.state.uploadedImage) {
                    const deltaX = e.offsetX - this.state.dragStartX;
                    const deltaY = e.offsetY - this.state.dragStartY;

                    this.state.imageOffsetX += deltaX;
                    this.state.imageOffsetY += deltaY;

                    this.state.dragStartX = e.offsetX;
                    this.state.dragStartY = e.offsetY;

                    this.renderCanvas();
                }
            });

            this.el.mockupCanvas.addEventListener('mouseup', () => {
                this.state.isDragging = false;
                this.el.mockupCanvas.classList.remove('dragging');
            });

            this.el.mockupCanvas.addEventListener('mouseleave', () => {
                this.state.isDragging = false;
                this.el.mockupCanvas.classList.remove('dragging');
            });

            // Mouse wheel zoom
            this.el.mockupCanvas.addEventListener('wheel', (e) => {
                if (this.state.uploadedImage) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                    this.state.imageScale = Math.max(0.2, Math.min(3, this.state.imageScale + delta));
                    this.renderCanvas();
                }
            });
        }

        // Download
        if (this.el.downloadBtn) {
            this.el.downloadBtn.addEventListener('click', () => {
                this.downloadMockup();
            });
        }

        // Window resize
        window.addEventListener('resize', () => this.renderCanvas());
    },

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.uploadedImage = img;
                this.resetImageTransform();
                this.el.downloadBtn.disabled = false;
                this.el.mockupCanvas.classList.add('has-image');
                this.renderCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    resetImageTransform() {
        this.state.imageScale = 1.0;
        this.state.imageOffsetX = 0;
        this.state.imageOffsetY = 0;
    },

    getDeviceDims() {
        const device = this.devices[this.state.currentDevice];
        const isRotatable = this.state.currentDevice === 'phone' || this.state.currentDevice === 'tablet';

        if (isRotatable) {
            const isBasePortrait = device.width < device.height;
            const targetLandscape = this.state.currentOrientation === 'landscape';

            // Swap if base vs target orientation mismatch
            // 1. Base Portrait (Phone) & Target Landscape -> Swap
            // 2. Base Landscape (Tablet) & Target Portrait -> Swap
            const shouldSwap = (isBasePortrait && targetLandscape) || (!isBasePortrait && !targetLandscape);

            if (shouldSwap) {
                return {
                    ...device,
                    width: device.height,
                    height: device.width,
                    screenX: device.screenY,
                    screenY: device.screenX,
                    screenWidth: device.screenHeight,
                    screenHeight: device.screenWidth
                };
            }
        }
        return device;
    },

    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    // Unified drawing logic for both Canvas and SVG
    drawDevice(ctx, width, height, scale, offsetX, offsetY, dims, colors, uploadedImage, imageScale, imageOffsetX, imageOffsetY) {
        // Background handling (only for Canvas context usually, but good for safety)
        if (ctx instanceof CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, width, height);
        }

        ctx.save();

        // Center the device in the full canvas
        const scaledWidth = dims.width * scale;
        const scaledHeight = (dims.height + (this.state.currentDevice === 'monitor' ? (this.devices.monitor.standHeight || 70) : 0)) * scale;

        const centerX = (width - scaledWidth) / 2;
        const centerY = (height - scaledHeight) / 2;

        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Shadow for the whole device group
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 30 / scale;
        ctx.shadowOffsetY = 15 / scale;

        // Device-specific rendering
        if (this.state.currentDevice === 'laptop') {
            // LAPTOP: MacBook Pro style
            const sideOverhang = 20;
            const frameWidth = 12;
            const bezelWidth = 8;
            const baseHeight = 18;
            const screenPanelH = dims.height - baseHeight;

            const screenPanelX = sideOverhang;
            const screenPanelW = dims.width - (sideOverhang * 2);

            // Outer aluminum frame
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, screenPanelX, 0, screenPanelW, screenPanelH, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent'; // Reset shadow for inner elements

            // Black bezel layer
            ctx.fillStyle = colors.bezel;
            const bezelX = screenPanelX + frameWidth - 3;
            const bezelY = frameWidth - 3;
            const bezelW = screenPanelW - (frameWidth - 3) * 2;
            const bezelH = screenPanelH - (frameWidth - 3) * 2;
            this.drawRoundedRect(ctx, bezelX, bezelY, bezelW, bezelH, dims.radius - 3);
            ctx.fill();

            // Screen area (white/content area)
            const screenX = screenPanelX + frameWidth + bezelWidth - 4;
            const screenY = frameWidth + bezelWidth;
            const screenW = screenPanelW - (frameWidth + bezelWidth - 4) * 2;
            const screenH = screenPanelH - screenY - (frameWidth + bezelWidth - 4);

            // Draw white screen background
            ctx.fillStyle = '#ffffff';
            this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
            ctx.fill();

            // Draw uploaded image in screen
            if (uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
                ctx.clip();

                const imgRatio = uploadedImage.width / uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;

                // Cover mode: image always fills the screen completely
                if (imgRatio > screenRatio) {
                    drawH = screenH * imageScale;
                    drawW = drawH * imgRatio;
                } else {
                    drawW = screenW * imageScale;
                    drawH = drawW / imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (imageOffsetY / scale);

                ctx.drawImage(uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Webcam area
            ctx.fillStyle = '#000';
            const camW = 45;
            const camH = 12;
            const camX = (dims.width - camW) / 2;
            const camY = bezelY + 4;
            this.drawRoundedRect(ctx, camX, camY, camW, camH, 6);
            ctx.fill();

            // Webcam dot
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(dims.width / 2, camY + camH / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            // Bottom aluminum base
            ctx.fillStyle = colors.base || colors.frame;
            const baseY = screenPanelH;

            // Draw base
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            ctx.lineTo(dims.width, baseY);
            ctx.lineTo(dims.width, baseY + baseHeight - 10);
            ctx.quadraticCurveTo(dims.width, baseY + baseHeight, dims.width - 10, baseY + baseHeight);
            ctx.lineTo(10, baseY + baseHeight);
            ctx.quadraticCurveTo(0, baseY + baseHeight, 0, baseY + baseHeight - 10);
            ctx.closePath();
            ctx.fill();

            // Thumb groove
            ctx.fillStyle = (colors.frame === '#2a2a2a') ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';
            const notchW = 120;
            const notchH = 8;
            const notchX = (dims.width - notchW) / 2;

            ctx.beginPath();
            ctx.moveTo(notchX, baseY);
            ctx.bezierCurveTo(notchX + 15, baseY + notchH, notchX + notchW - 15, baseY + notchH, notchX + notchW, baseY);
            ctx.fill();

        } else if (this.state.currentDevice === 'monitor') {
            // MONITOR
            const frameSize = 12;
            const panelH = dims.height;

            // Screen panel frame
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, 0, 0, dims.width, panelH, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Black bezel
            ctx.fillStyle = colors.bezel;
            this.drawRoundedRect(ctx, frameSize, frameSize, dims.width - frameSize * 2, panelH - frameSize * 2, dims.radius - 4);
            ctx.fill();

            // Screen area
            const screenX = frameSize + 8;
            const screenY = frameSize + 8;
            const screenW = dims.width - (frameSize + 8) * 2;
            const screenH = panelH - (frameSize + 8) * 2;

            ctx.fillStyle = '#ffffff';
            this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
            ctx.fill();

            // Draw uploaded image
            if (uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
                ctx.clip();

                const imgRatio = uploadedImage.width / uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;

                // Cover mode: image always fills the screen completely
                if (imgRatio > screenRatio) {
                    drawH = screenH * imageScale;
                    drawW = drawH * imgRatio;
                } else {
                    drawW = screenW * imageScale;
                    drawH = drawW / imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (imageOffsetY / scale);

                ctx.drawImage(uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Stand neck
            ctx.fillStyle = colors.stand || colors.shadow;
            const neckW = 50;
            const neckH = 45;
            const neckX = (dims.width - neckW) / 2;
            const neckY = panelH;
            ctx.fillRect(neckX, neckY, neckW, neckH);

            // Stand base
            ctx.fillStyle = colors.stand || colors.shadow;
            const baseW = 180;
            const baseH = 12;
            const baseX = (dims.width - baseW) / 2;
            const baseY = neckY + neckH;
            this.drawRoundedRect(ctx, baseX, baseY, baseW, baseH, 6);
            ctx.fill();

        } else {
            // PHONE, TABLET, WATCH
            const frameThickness = 4;

            // Outer frame
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, 0, 0, dims.width, dims.height, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Screen area
            const screenX = frameThickness;
            const screenY = frameThickness;
            const screenW = dims.width - frameThickness * 2;
            const screenH = dims.height - frameThickness * 2;
            const screenRadius = dims.radius - 2;

            // White screen background
            ctx.fillStyle = '#ffffff';
            this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
            ctx.fill();

            // Draw uploaded image
            if (uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
                ctx.clip();

                const imgRatio = uploadedImage.width / uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;

                // Cover mode: image always fills the screen completely
                if (imgRatio > screenRatio) {
                    // Image is wider - scale by height to cover
                    drawH = screenH * imageScale;
                    drawW = drawH * imgRatio;
                } else {
                    // Image is taller - scale by width to cover
                    drawW = screenW * imageScale;
                    drawH = drawW / imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (imageOffsetY / scale);

                ctx.drawImage(uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Device-specific details
            if (this.state.currentDevice === 'phone') {
                // Dynamic Island / Notch
                ctx.fillStyle = '#000';
                if (this.state.currentOrientation === 'landscape') {
                    const notchW = 24;
                    const notchH = 80;
                    const notchX = 25;
                    const notchY = (dims.height - notchH) / 2;
                    this.drawRoundedRect(ctx, notchX, notchY, notchW, notchH, 12);
                    ctx.fill();
                } else {
                    const notchW = 80;
                    const notchH = 24;
                    const notchX = (dims.width - notchW) / 2;
                    const notchY = screenY + 10;
                    this.drawRoundedRect(ctx, notchX, notchY, notchW, notchH, 12);
                    ctx.fill();

                    // Status Bar (Portrait only)
                    if (this.state.showStatusBar && this.state.currentOrientation === 'portrait') {
                        const barY = screenY + 17;

                        ctx.fillStyle = '#fff';
                        ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
                        ctx.textBaseline = 'middle';

                        // Time (left side)
                        ctx.textAlign = 'left';
                        ctx.fillText('9:41', screenX + 28, barY);

                        // Right side icons with proper spacing
                        let x = screenX + screenW - 28;

                        // Battery icon
                        const batteryW = 22;
                        const batteryH = 10;
                        x -= batteryW;
                        const batteryY = barY - batteryH / 2;

                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1;
                        this.drawRoundedRect(ctx, x, batteryY, batteryW, batteryH, 2);
                        ctx.stroke();
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(x + 2, batteryY + 2, batteryW - 4, batteryH - 4);
                        ctx.fillRect(x + batteryW, batteryY + 2.5, 1.5, 5);

                        x -= 8; // gap

                        // WiFi icon - simple fan shape
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 1.5;
                        const wifiX = x - 6;

                        ctx.beginPath();
                        ctx.arc(wifiX, barY + 4, 1.5, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(wifiX, barY + 4, 5, -Math.PI * 0.75, -Math.PI * 0.25);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(wifiX, barY + 4, 8, -Math.PI * 0.75, -Math.PI * 0.25);
                        ctx.stroke();

                        x = wifiX - 14; // gap after wifi

                        // Signal bars
                        ctx.fillStyle = '#fff';
                        for (let i = 0; i < 4; i++) {
                            const h = 4 + i * 2;
                            const bx = x - (3 - i) * 4;
                            ctx.fillRect(bx, barY + 5 - h, 3, h);
                        }
                    }

                }

            } else if (this.state.currentDevice === 'watch') {
                // Crown and button
                ctx.fillStyle = colors.shadow;
                ctx.fillRect(dims.width - 2, dims.height / 2 - 15, 10, 30);
                ctx.fillRect(dims.width - 2, dims.height / 2 + 20, 8, 15);
            }
        }

        ctx.restore();
    },

    renderCanvas() {
        const canvas = this.el.mockupCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const device = this.devices[this.state.currentDevice];

        if (this.el.orientationToggle) {
            const supportsRotation = ['phone', 'tablet'].includes(this.state.currentDevice);
            this.el.orientationToggle.style.display = supportsRotation ? 'flex' : 'none';
        }

        // Status Bar toggle button visibility (Phone Portrait only)
        const statusBarToggle = document.getElementById('status-bar-toggle');
        if (statusBarToggle) {
            const showStatusBarToggle = this.state.currentDevice === 'phone' && this.state.currentOrientation === 'portrait';
            statusBarToggle.style.display = showStatusBarToggle ? 'flex' : 'none';
            // Update button appearance based on current state
            if (showStatusBarToggle) {
                if (this.state.showStatusBar) {
                    statusBarToggle.style.background = 'var(--accent-color)';
                    statusBarToggle.style.color = 'white';
                } else {
                    statusBarToggle.style.background = 'var(--surface)';
                    statusBarToggle.style.color = 'var(--ink)';
                }
            }
        }

        const dims = this.getDeviceDims();
        const colors = device.colors[this.state.currentColor];
        const mainPanel = canvas.parentElement;

        canvas.width = mainPanel.clientWidth;
        canvas.height = mainPanel.clientHeight;

        const margin = 50;
        const availableWidth = canvas.width - margin * 2;
        const availableHeight = canvas.height - margin * 2;
        const extraHeight = this.state.currentDevice === 'monitor' ? (device.standHeight || 70) : 0;
        const totalDeviceHeight = dims.height + extraHeight;

        const scaleX = availableWidth / dims.width;
        const scaleY = availableHeight / totalDeviceHeight;
        const scale = Math.min(scaleX, scaleY, 2.5);

        // Call unified drawing logic
        this.drawDevice(
            ctx,
            canvas.width,
            canvas.height,
            scale,
            0, 0, // No extra offset needed as it calculates center
            dims,
            colors,
            this.state.uploadedImage,
            this.state.imageScale,
            this.state.imageOffsetX,
            this.state.imageOffsetY
        );
    },

    downloadMockup() {
        const device = this.devices[this.state.currentDevice];
        const dims = this.getDeviceDims();
        const colors = device.colors[this.state.currentColor];
        const margin = 50;
        const extraHeight = this.state.currentDevice === 'monitor' ? (device.standHeight || 70) : 0;
        const totalW = dims.width + margin * 2;
        const totalH = dims.height + extraHeight + margin * 2;

        // Use 1.0 scale relative to device size for high-res output
        // We set canvas size to fit the device perfectly with margin

        const svgGen = new SvgGenerator(totalW, totalH);

        // Calculate scale that fits this 'virtual' SVG canvas (which is based on device size anyway)
        // Since we sized the canvas to fit the device + margin, scale can be 1.0 (or slightly less to ensure margin)
        // Actually, renderCanvas logic calculates scale based on available space. 
        // Here available space IS device size + margin, so scale should effectively be 1.0.

        const availableW = totalW - margin * 2;
        const availableH = totalH - margin * 2;
        // Re-use logic or just hard set scale=1 if we sized it perfectly
        const scale = 1.0;

        this.drawDevice(
            svgGen,
            totalW,
            totalH,
            scale,
            0, 0,
            dims,
            colors,
            this.state.uploadedImage,
            this.state.imageScale,
            this.state.imageOffsetX,
            this.state.imageOffsetY
        );

        const svgContent = svgGen.getXml();
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `mockup-${this.state.currentDevice}-${Date.now()}.svg`;
        link.href = url;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);
    },

    initTheme() {
        const savedTheme = localStorage.getItem('creative-toolkit-theme') || 'system';
        this.setTheme(savedTheme, false);
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('creative-toolkit-theme') === 'system') this.applyTheme('system');
        });
    },
    setTheme(theme, save = true) {
        if (save) localStorage.setItem('creative-toolkit-theme', theme);
        if (this.el.themeToggle) this.el.themeToggle.textContent = this.THEME_ICONS[theme];
        this.applyTheme(theme);
    },
    cycleTheme() {
        const currentTheme = localStorage.getItem('creative-toolkit-theme') || 'system';
        this.setTheme(this.THEMES[(this.THEMES.indexOf(currentTheme) + 1) % this.THEMES.length]);
    },
    applyTheme(theme) {
        const isDark = (theme === 'system') ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        this.renderCanvas();
    },

    hideSplashScreen(dontShowAgain = false) {
        if (!this.state.splashHidden) {
            this.state.splashHidden = true;
            this.el.splashScreen.classList.add('hidden');
            this.el.appContainer.classList.remove('loading');
            this.renderCanvas();
            if (dontShowAgain) {
                localStorage.setItem('mockups-splash-hidden', 'true');
            }
        }
    },

    checkSplashPreference() {
        if (localStorage.getItem('mockups-splash-hidden') === 'true') {
            this.state.splashHidden = true;
            this.el.splashScreen.classList.add('hidden');
            this.el.appContainer.classList.remove('loading');
        }
    },

    // Wiki Logic
    openWiki() {
        if (!this.el.wikiOverlay.querySelector('.wiki-modal-content')) {
            const wikiModal = document.createElement('div');
            wikiModal.className = 'wiki-modal-content';
            wikiModal.innerHTML = `
        <div class="wiki-header">
          <h3 id="wiki-title">Info</h3>
          <button id="wiki-close-btn" title="Close">×</button>
        </div>
        <div id="wiki-content"></div>
      `;
            this.el.wikiOverlay.appendChild(wikiModal);
            wikiModal.querySelector('#wiki-close-btn').addEventListener('click', () => this.closeWiki());
        }

        if (!this.state.isWikiLoaded) {
            const titleEl = this.el.wikiOverlay.querySelector('#wiki-title');
            const contentEl = this.el.wikiOverlay.querySelector('#wiki-content');
            if (titleEl) titleEl.textContent = WIKI_DATA.title;

            const col1 = document.createElement('div');
            col1.className = 'wiki-column';
            const col2 = document.createElement('div');
            col2.className = 'wiki-column';

            WIKI_DATA.sections.forEach((s, index) => {
                const sectionContainer = document.createElement('div');
                const h4 = document.createElement('h4'); h4.textContent = s.title;
                sectionContainer.appendChild(h4);
                s.content.forEach(c => { const p = document.createElement('p'); p.innerHTML = c; sectionContainer.appendChild(p); });

                if (index < Math.ceil(WIKI_DATA.sections.length / 2)) {
                    col1.appendChild(sectionContainer);
                } else {
                    col2.appendChild(sectionContainer);
                }
            });

            if (contentEl) {
                contentEl.innerHTML = '';
                contentEl.appendChild(col1);
                contentEl.appendChild(col2);
            }

            this.state.isWikiLoaded = true;
        }
        if (this.el.wikiOverlay) this.el.wikiOverlay.classList.add('show');
    },
    closeWiki() {
        if (this.el.wikiOverlay) this.el.wikiOverlay.classList.remove('show');
    }
};

document.addEventListener('DOMContentLoaded', () => MockupApp.init());
