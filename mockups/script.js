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

const MockupApp = {
    el: {},
    state: {
        splashHidden: false,
        isWikiLoaded: false,
        currentDevice: 'phone',
        currentOrientation: 'portrait',
        currentColor: 'white',

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
                white: { frame: '#f5f5f5', bezel: '#ffffff', shadow: '#e0e0e0' },
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
                white: { frame: '#f5f5f5', bezel: '#ffffff', shadow: '#e0e0e0' },
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
                white: { frame: '#d4d4d4', bezel: '#1a1a1a', shadow: '#a8a8a8', base: '#c0c0c0' },
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
                white: { frame: '#f5f5f5', bezel: '#ffffff', shadow: '#e0e0e0' },
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
                white: { frame: '#e8e8e8', bezel: '#1a1a1a', shadow: '#c0c0c0', stand: '#d0d0d0' },
                black: { frame: '#1a1a1a', bezel: '#0a0a0a', shadow: '#000000', stand: '#2a2a2a' },
                silver: { frame: '#c8c8c8', bezel: '#1a1a1a', shadow: '#a0a0a0', stand: '#b0b0b0' }
            }
        }
    },

    init() {
        this.cacheDOMElements();
        this.initTheme();
        this.bindEvents();
        this.renderCanvas();
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
                if (e.target === this.el.splashScreen) this.hideSplashScreen();
            });
        }
        if (this.el.splashCloseBtn) this.el.splashCloseBtn.addEventListener('click', () => this.hideSplashScreen());

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
                const link = document.createElement('a');
                link.download = `mockup-${this.state.currentDevice}-${Date.now()}.png`;
                link.href = this.el.mockupCanvas.toDataURL('image/png');
                link.click();
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

    renderCanvas() {
        const canvas = this.el.mockupCanvas;
        if (!canvas) return;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const device = this.devices[this.state.currentDevice];

        // Show/Hide orientation toggle
        if (this.el.orientationToggle) {
            const supportsRotation = ['phone', 'tablet'].includes(this.state.currentDevice);
            this.el.orientationToggle.style.display = supportsRotation ? 'flex' : 'none';
        }

        const dims = this.getDeviceDims();
        const colors = device.colors[this.state.currentColor];

        // Get available space from the main panel
        const mainPanel = canvas.parentElement;

        // Full canvas size - now matches parent exactly
        canvas.width = mainPanel.clientWidth;
        canvas.height = mainPanel.clientHeight;

        // Calculate scale to fit the device within the full canvas (with margin)
        const margin = 50;
        const availableWidth = canvas.width - margin * 2;
        const availableHeight = canvas.height - margin * 2;

        // Add extra height for monitor stand
        const extraHeight = this.state.currentDevice === 'monitor' ? 70 : 0;
        const totalDeviceHeight = dims.height + extraHeight;

        const scaleX = availableWidth / dims.width;
        const scaleY = availableHeight / totalDeviceHeight;
        const scale = Math.min(scaleX, scaleY, 2.5); // Cap max scale

        const scaledWidth = dims.width * scale;
        const scaledHeight = totalDeviceHeight * scale;

        // Background handling
        // Clear canvas first - if transparent, this leaves it transparent (CSS shows checkerboard)
        ctx.clearRect(0, 0, canvas.width, canvas.height);



        ctx.save();

        // Center the device in the full canvas
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 30 / scale;
        ctx.shadowOffsetY = 15 / scale;

        // Device-specific rendering
        if (this.state.currentDevice === 'laptop') {
            // LAPTOP: MacBook Pro style - screen panel with thin base
            const sideOverhang = 20; // How much the base sticks out on each side
            const frameWidth = 12; // Gray outer frame
            const bezelWidth = 8; // Black bezel inside frame
            const baseHeight = 18; // Bottom aluminum base
            const screenPanelH = dims.height - baseHeight;

            const screenPanelX = sideOverhang;
            const screenPanelW = dims.width - (sideOverhang * 2);

            // Outer aluminum frame (rounded rectangle for screen panel)
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, screenPanelX, 0, screenPanelW, screenPanelH, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Black bezel layer (inside the frame)
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
            if (this.state.uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
                ctx.clip();

                const imgRatio = this.state.uploadedImage.width / this.state.uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;
                if (imgRatio > screenRatio) {
                    drawW = screenW * this.state.imageScale;
                    drawH = drawW / imgRatio;
                } else {
                    drawH = screenH * this.state.imageScale;
                    drawW = drawH * imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (this.state.imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (this.state.imageOffsetY / scale);

                ctx.drawImage(this.state.uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Webcam area at top center (small black oval in the black bezel)
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

            // Bottom aluminum base (Keyboard deck edge)
            ctx.fillStyle = colors.base || colors.frame;
            const baseY = screenPanelH;

            // Draw base as a clean rounded rectangle bottom
            // The base spans the FULL dims.width, making it wider than the screen panel
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            ctx.lineTo(dims.width, baseY);
            ctx.lineTo(dims.width, baseY + baseHeight - 10);
            ctx.quadraticCurveTo(dims.width, baseY + baseHeight, dims.width - 10, baseY + baseHeight);
            ctx.lineTo(10, baseY + baseHeight);
            ctx.quadraticCurveTo(0, baseY + baseHeight, 0, baseY + baseHeight - 10);
            ctx.closePath();
            ctx.fill();

            // Thumb groove / Opening notch (Smooth curve in the center top of the base)
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Subtle shadow for the groove
            const notchW = 120;
            const notchH = 8;
            const notchX = (dims.width - notchW) / 2;

            ctx.beginPath();
            ctx.moveTo(notchX, baseY);
            ctx.bezierCurveTo(notchX + 15, baseY + notchH, notchX + notchW - 15, baseY + notchH, notchX + notchW, baseY);
            ctx.fill();

        } else if (this.state.currentDevice === 'monitor') {
            // MONITOR: Clean design with stand
            const frameSize = 12;
            const panelH = dims.height; // Screen panel height

            // Screen panel frame
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, 0, 0, dims.width, panelH, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Black bezel
            ctx.fillStyle = colors.bezel;
            this.drawRoundedRect(ctx, frameSize, frameSize, dims.width - frameSize * 2, panelH - frameSize * 2, dims.radius - 4);
            ctx.fill();

            // Screen area (white background)
            const screenX = frameSize + 8;
            const screenY = frameSize + 8;
            const screenW = dims.width - (frameSize + 8) * 2;
            const screenH = panelH - (frameSize + 8) * 2;

            ctx.fillStyle = '#ffffff';
            this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
            ctx.fill();

            // Draw uploaded image
            if (this.state.uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, 2);
                ctx.clip();

                const imgRatio = this.state.uploadedImage.width / this.state.uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;
                if (imgRatio > screenRatio) {
                    drawW = screenW * this.state.imageScale;
                    drawH = drawW / imgRatio;
                } else {
                    drawH = screenH * this.state.imageScale;
                    drawW = drawH * imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (this.state.imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (this.state.imageOffsetY / scale);

                ctx.drawImage(this.state.uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Stand neck (vertical part)
            ctx.fillStyle = colors.stand || colors.shadow;
            const neckW = 50;
            const neckH = 45;
            const neckX = (dims.width - neckW) / 2;
            const neckY = panelH;
            ctx.fillRect(neckX, neckY, neckW, neckH);

            // Stand base (horizontal ellipse-like base)
            ctx.fillStyle = colors.stand || colors.shadow;
            const baseW = 180;
            const baseH = 12;
            const baseX = (dims.width - baseW) / 2;
            const baseY = neckY + neckH;
            this.drawRoundedRect(ctx, baseX, baseY, baseW, baseH, 6);
            ctx.fill();

        } else {
            // PHONE, TABLET, WATCH: Modern edge-to-edge design
            const frameThickness = 4; // Thin outer frame

            // Outer frame (device body)
            ctx.fillStyle = colors.frame;
            this.drawRoundedRect(ctx, 0, 0, dims.width, dims.height, dims.radius);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Screen area (directly inside frame - edge to edge)
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
            if (this.state.uploadedImage) {
                ctx.save();
                this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
                ctx.clip();

                const imgRatio = this.state.uploadedImage.width / this.state.uploadedImage.height;
                const screenRatio = screenW / screenH;

                let drawW, drawH, drawX, drawY;
                if (imgRatio > screenRatio) {
                    drawW = screenW * this.state.imageScale;
                    drawH = drawW / imgRatio;
                } else {
                    drawH = screenH * this.state.imageScale;
                    drawW = drawH * imgRatio;
                }

                drawX = screenX + (screenW - drawW) / 2 + (this.state.imageOffsetX / scale);
                drawY = screenY + (screenH - drawH) / 2 + (this.state.imageOffsetY / scale);

                ctx.drawImage(this.state.uploadedImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Device-specific details
            if (this.state.currentDevice === 'phone') {
                // Dynamic Island
                ctx.fillStyle = '#000';

                if (this.state.currentOrientation === 'landscape') {
                    // Landscape: Notch on the left (island rotates with phone)
                    const notchW = 24;
                    const notchH = 80;
                    const notchX = 25; // Approximate margin
                    const notchY = (dims.height - notchH) / 2;
                    this.drawRoundedRect(ctx, notchX, notchY, notchW, notchH, 12);
                    ctx.fill();
                } else {
                    // Portrait: Notch at top
                    const notchW = 80;
                    const notchH = 24;
                    const notchX = (dims.width - notchW) / 2;
                    const notchY = screenY + 10;
                    this.drawRoundedRect(ctx, notchX, notchY, notchW, notchH, 12);
                    ctx.fill();
                }

            } else if (this.state.currentDevice === 'watch') {
                // Digital Crown
                ctx.fillStyle = colors.shadow;
                ctx.fillRect(dims.width - 2, dims.height / 2 - 15, 10, 30);
                // Side button
                ctx.fillRect(dims.width - 2, dims.height / 2 + 20, 8, 15);
            }
        }

        ctx.restore();
    },

    // Theme Logic (from baseapp.html)
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

    hideSplashScreen() {
        if (!this.state.splashHidden) {
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
