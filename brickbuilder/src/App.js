import { BRICK_TYPES, COLORS, GRID_X, GRID_Y } from './constants.js';
import { uuidv4 } from './utils.js';
import { Storage } from './storage.js';

export const App = {
    el: {},
    state: {
        bricks: [],
        selectedIds: [],
        view: { x: 0, y: 0, scale: 1.0 },
        history: { past: [], future: [] },
        activeTool: 'select' // 'select' or 'hand'
    },
    isDragging: false,
    dragStart: { x: 0, y: 0 },

    init() {
        this.cacheDOM();
        this.initTheme();
        this.renderDock();
        this.renderColors();
        this.bindEvents();

        // Initialize storage and auto-save
        Storage.init(this);
        this.loadAutoSave();

        this.updateUI();

        // Update save indicator every 10 seconds
        setInterval(() => Storage.updateSaveIndicator(), 10000);

        // Check if splash screen should be shown (once per 24 hours)
        this.checkSplashScreen();
    },

    checkSplashScreen() {
        const SPLASH_KEY = 'brickbuilder_last_splash';
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        const lastShown = localStorage.getItem(SPLASH_KEY);
        const now = Date.now();

        let shouldShow = false;

        if (!lastShown) {
            // First time visit
            shouldShow = true;
        } else {
            const timeSinceLastShown = now - parseInt(lastShown);
            if (timeSinceLastShown >= TWENTY_FOUR_HOURS) {
                // Been 24+ hours since last shown
                shouldShow = true;
            }
        }

        // Remove loading state and show/hide splash
        setTimeout(() => {
            if (shouldShow) {
                this.el['splash-screen'].classList.remove('hidden');
                // Update timestamp when splash is shown
                localStorage.setItem(SPLASH_KEY, now.toString());
            } else {
                this.el['splash-screen'].classList.add('hidden');
            }
            this.el['app-container'].classList.remove('loading');
        }, 100);
    },

    cacheDOM() {
        // Cache important elements
        const ids = [
            'app-container', 'splash-screen', 'splash-close-btn', 'theme-toggle', 'wiki-open-btn', 'wiki-close-btn', 'wiki-overlay',
            'canvas-container', 'canvas-svg', 'canvas-transform', 'bricks-layer', 'selection-box',
            'dock', 'properties-panel', 'selection-info', 'properties-content', 'color-grid', 'custom-color',
            'prop-width', 'prop-height', 'bring-front-btn', 'send-back-btn',
            'flip-btn', 'delete-btn', 'clear-btn', 'export-btn', 'export-png-btn', 'save-indicator', 'restore-btn',
            'zoom-in', 'zoom-out', 'zoom-reset', 'zoom-level',
            'align-left', 'align-center-x', 'align-right', 'align-top', 'align-center-y', 'align-bottom',
            'context-menu', 'ctx-duplicate', 'ctx-rotate', 'ctx-group', 'ctx-ungroup', 'ctx-front', 'ctx-back', 'ctx-delete',
            'shortcuts-overlay', 'shortcuts-close-btn'
        ];
        ids.forEach(id => this.el[id] = document.getElementById(id));
    },

    initTheme() {
        const savedTheme = localStorage.getItem('creative-toolkit-theme') || 'system';
        this.setTheme(savedTheme, false);
    },

    setTheme(theme, save = true) {
        if (save) localStorage.setItem('creative-toolkit-theme', theme);
        const icon = theme === 'light' ? '☀️' : (theme === 'dark' ? '🌔' : '⚙️');
        this.el['theme-toggle'].textContent = icon;

        const isDark = (theme === 'system') ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    },

    renderDock() {
        this.el.dock.innerHTML = '';
        const svgNS = "http://www.w3.org/2000/svg";

        // No separators needed - only 3 items
        const groupEnds = [];

        BRICK_TYPES.forEach((type, index) => {
            const item = document.createElement('div');
            item.className = 'dock-item';

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "60");
            svg.setAttribute("height", "50");
            svg.setAttribute("viewBox", "0 0 100 45");
            svg.style.pointerEvents = "none";

            // Center the brick in viewBox
            const g = document.createElementNS(svgNS, "g");
            const offsetX = type.id === 'arch' ? 5 : 20;
            const offsetY = 5;
            g.setAttribute("transform", `translate(${offsetX}, ${offsetY})`);

            let body;
            const width = type.width;
            const height = type.height;

            // Render exactly like in canvas - use identical SVG paths
            if (type.shape === 'slope') {
                body = document.createElementNS(svgNS, "path");
                // Normal orientation: diagonal from bottom-left to top-right
                body.setAttribute("d", `M1 ${height - 1} L${width - 1} ${height - 1} L${width - 1} 1 Z`);
            } else if (type.shape === 'arch') {
                body = document.createElementNS(svgNS, "path");
                const legWidth = GRID_X;
                const archHeight = 20;
                body.setAttribute("d", `M1 ${height - 1} L1 1 L${width - 1} 1 L${width - 1} ${height - 1} L${width - legWidth} ${height - 1} L${width - legWidth} ${archHeight} Q${width / 2} -10 ${legWidth} ${archHeight} L${legWidth} ${height - 1} Z`);
            } else {
                // Standard brick
                body = document.createElementNS(svgNS, "rect");
                body.setAttribute("x", "1");
                body.setAttribute("y", "1");
                body.setAttribute("width", (width - 2).toString());
                body.setAttribute("height", (height - 2).toString());
            }

            body.setAttribute("fill", type.color);
            body.setAttribute("stroke", "#000");
            body.setAttribute("stroke-width", "1.5");
            g.appendChild(body);
            svg.appendChild(g);

            item.appendChild(svg);

            const tooltip = document.createElement('div');
            tooltip.className = 'dock-tooltip';
            tooltip.textContent = type.name;
            item.appendChild(tooltip);

            item.onclick = () => this.addBrick(type.id);
            this.el.dock.appendChild(item);

            // Add separator after certain groups (none for now with 3 items)
            if (groupEnds.includes(type.id) && index < BRICK_TYPES.length - 1) {
                const separator = document.createElement('div');
                separator.className = 'dock-separator';
                this.el.dock.appendChild(separator);
            }
        });
    },

    renderColors() {
        this.el['color-grid'].innerHTML = '';
        COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.onclick = () => this.updateBrickColor(color);
            this.el['color-grid'].appendChild(swatch);
        });
    },

    bindEvents() {
        this.el['theme-toggle'].onclick = () => {
            const current = localStorage.getItem('creative-toolkit-theme') || 'system';
            const next = current === 'light' ? 'dark' : (current === 'dark' ? 'system' : 'light');
            this.setTheme(next);
        };

        this.el['splash-close-btn'].onclick = () => this.el['splash-screen'].classList.add('hidden');
        this.el['wiki-open-btn'].onclick = () => this.el['wiki-overlay'].classList.add('show');
        this.el['wiki-close-btn'].onclick = () => this.el['wiki-overlay'].classList.remove('show');
        this.el['shortcuts-close-btn'].onclick = () => this.el['shortcuts-overlay'].classList.remove('show');
        this.el['restore-btn'].onclick = () => this.restoreAutoSave();

        // Canvas Events
        this.el['canvas-svg'].onmousedown = (e) => this.handleCanvasDown(e);
        window.onmousemove = (e) => this.handleCanvasMove(e);
        window.onmouseup = (e) => this.handleCanvasUp(e);

        // Controls
        this.el['clear-btn'].onclick = () => this.clearCanvas();
        this.el['delete-btn'].onclick = () => this.deleteSelected();
        this.el['flip-btn'].onclick = () => this.rotateSelected();
        this.el['export-btn'].onclick = () => this.handleExport();
        this.el['export-png-btn'].onclick = () => this.exportPNG();

        window.onkeydown = (e) => this.handleKeyDown(e);

        // Properties
        this.el['prop-width'].onchange = (e) => this.updateBrickProp('customWidth', parseInt(e.target.value) * GRID_X);
        this.el['prop-height'].onchange = (e) => this.updateBrickProp('customHeight', parseInt(e.target.value) * GRID_Y);

        // Custom color input
        this.el['custom-color'].onchange = (e) => this.updateBrickColor(e.target.value);

        this.el['bring-front-btn'].onclick = () => this.changeLayer(1);
        this.el['send-back-btn'].onclick = () => this.changeLayer(-1);

        // Alignment
        this.el['align-left'].onclick = () => this.align('left');
        this.el['align-center-x'].onclick = () => this.align('center-x');
        this.el['align-right'].onclick = () => this.align('right');
        this.el['align-top'].onclick = () => this.align('top');
        this.el['align-center-y'].onclick = () => this.align('center-y');
        this.el['align-bottom'].onclick = () => this.align('bottom');

        // Zoom controls
        this.el['zoom-in'].onclick = () => this.zoomIn();
        this.el['zoom-out'].onclick = () => this.zoomOut();
        this.el['zoom-reset'].onclick = () => this.zoomReset();

        // Context Menu
        window.oncontextmenu = (e) => {
            e.preventDefault();
            this.handleContextMenu(e);
        };

        window.onclick = (e) => {
            if (!e.target.closest('.context-menu')) {
                this.el['context-menu'].style.display = 'none';
            }
        };

        this.el['ctx-duplicate'].onclick = () => { this.duplicateSelected(); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-rotate'].onclick = () => { this.rotateSelected(); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-group'].onclick = () => { this.groupSelected(); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-ungroup'].onclick = () => { this.ungroupSelected(); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-front'].onclick = () => { this.changeLayer(1); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-back'].onclick = () => { this.changeLayer(-1); this.el['context-menu'].style.display = 'none'; };
        this.el['ctx-delete'].onclick = () => { this.deleteSelected(); this.el['context-menu'].style.display = 'none'; };
    },

    handleContextMenu(e) {
        // Determine if clicked on brick
        const isBrick = e.target.closest('g[data-id]');
        if (isBrick) {
            const id = isBrick.dataset.id;
            // If not already selected, select it (and its group)
            if (!this.state.selectedIds.includes(id)) {
                this.handleBrickDown(e, id);
                this.isDragging = false; // Don't start drag on right click
            }
        } else {
            // Background click - maybe clear selection?
        }

        const menu = this.el['context-menu'];
        menu.style.display = 'block';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
    },

    // --- History Management ---
    pushHistory() {
        const current = JSON.parse(JSON.stringify(this.state.bricks));
        this.state.history.past.push(this.state.history.present);
        this.state.history.present = current;
        this.state.history.future = [];
    },

    undo() {
        if (this.state.history.past.length === 0) return;
        const previous = this.state.history.past.pop();
        this.state.history.future.push(this.state.history.present);
        this.state.history.present = previous;
        this.state.bricks = JSON.parse(JSON.stringify(previous));
        this.state.selectedIds = []; // Clear selection on undo
        this.updateUI();
    },

    redo() {
        if (this.state.history.future.length === 0) return;
        const next = this.state.history.future.pop();
        this.state.history.past.push(this.state.history.present);
        this.state.history.present = next;
        this.state.bricks = JSON.parse(JSON.stringify(next));
        this.state.selectedIds = [];
        this.updateUI();
    },

    // --- Core Logic ---
    addBrick(typeId) {
        this.pushHistory();
        const type = BRICK_TYPES.find(t => t.id === typeId);
        const newBrick = {
            id: uuidv4(),
            typeId: type.id,
            x: 0, // Will be calculated
            y: 0,
            color: type.color,
            zIndex: this.state.bricks.length + 1,
            rotation: 0,
            groupId: null // Initialize groupId
        };

        // Find valid position (center of view, then spiral out or shift right)
        // Start at center of current view
        const viewCx = -this.state.view.x / this.state.view.scale + (window.innerWidth / 2) / this.state.view.scale;
        const viewCy = -this.state.view.y / this.state.view.scale + (window.innerHeight / 2) / this.state.view.scale;

        let startX = Math.round(viewCx / GRID_X) * GRID_X;
        let startY = Math.round(viewCy / GRID_Y) * GRID_Y;

        let isValid = false;
        let attempts = 0;
        let offsetX = 0;
        let offsetY = 0;

        while (!isValid && attempts < 100) {
            newBrick.x = startX + offsetX;
            newBrick.y = startY + offsetY;

            const rect = { x: newBrick.x, y: newBrick.y, w: type.width, h: type.height };
            isValid = true;

            for (const other of this.state.bricks) {
                const oType = BRICK_TYPES.find(t => t.id === other.typeId);
                const ow = other.customWidth || oType.width;
                const oh = other.customHeight || oType.height;
                const oRect = { x: other.x, y: other.y, w: ow, h: oh };

                if (this.checkCollision(rect, oRect)) {
                    isValid = false;
                    break;
                }
            }

            if (!isValid) {
                offsetX += GRID_X;
                if (offsetX > 300) {
                    offsetX = 0;
                    offsetY += GRID_Y;
                }
            }
            attempts++;
        }

        this.state.bricks.push(newBrick);
        this.state.selectedIds = [newBrick.id];
        this.state.isValidPlacement = true; // Ensure it's valid initially
        this.updateUI();
    },

    groupSelected() {
        if (this.state.selectedIds.length < 2) return;
        this.pushHistory();
        const newGroupId = uuidv4();
        this.state.bricks.forEach(b => {
            if (this.state.selectedIds.includes(b.id)) {
                b.groupId = newGroupId;
            }
        });
        this.updateUI();
    },

    ungroupSelected() {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();
        this.state.bricks.forEach(b => {
            if (this.state.selectedIds.includes(b.id)) {
                b.groupId = null;
            }
        });
        this.updateUI();
    },

    updateBrickColor(color) {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();
        this.state.bricks.forEach(b => {
            if (this.state.selectedIds.includes(b.id)) b.color = color;
        });
        this.updateUI();
    },

    updateBrickProp(prop, value) {
        if (this.state.selectedIds.length === 0) return;

        // Create a potential state to check for collisions
        const potentialBricks = this.state.bricks.map(b => {
            if (this.state.selectedIds.includes(b.id)) {
                let newValue = value;
                const type = BRICK_TYPES.find(t => t.id === b.typeId);

                // Enforce min width for arches
                if (prop === 'customWidth' && type.shape === 'arch') {
                    newValue = Math.max(value, 2 * GRID_X);
                }

                return { ...b, [prop]: newValue };
            }
            return b;
        });

        // Check for collisions
        let hasCollision = false;
        const modifiedIds = this.state.selectedIds;

        for (const modifiedBrick of potentialBricks.filter(b => modifiedIds.includes(b.id))) {
            const mType = BRICK_TYPES.find(t => t.id === modifiedBrick.typeId);
            const mw = modifiedBrick.customWidth || mType.width;
            const mh = modifiedBrick.customHeight || mType.height;
            const mRect = { x: modifiedBrick.x, y: modifiedBrick.y, w: mw, h: mh };

            for (const staticBrick of potentialBricks.filter(b => !modifiedIds.includes(b.id))) {
                const sType = BRICK_TYPES.find(t => t.id === staticBrick.typeId);
                const sw = staticBrick.customWidth || sType.width;
                const sh = staticBrick.customHeight || sType.height;
                const sRect = { x: staticBrick.x, y: staticBrick.y, w: sw, h: sh };

                if (this.checkCollision(mRect, sRect)) {
                    hasCollision = true;
                    break;
                }
            }
            if (hasCollision) break;
        }

        if (hasCollision) {
            alert('Cannot resize: Collision detected!');
            // Revert UI input values
            this.updateUI();
            return;
        }

        this.pushHistory();
        this.state.bricks = potentialBricks;
        this.updateUI();
    },

    changeLayer(dir) {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();
        const zIndices = this.state.bricks.map(b => b.zIndex || 0);
        const maxZ = Math.max(...zIndices);
        const minZ = Math.min(...zIndices);

        this.state.bricks.forEach(b => {
            if (this.state.selectedIds.includes(b.id)) {
                if (dir > 0) b.zIndex = maxZ + 1;
                else b.zIndex = minZ - 1;
            }
        });
        this.updateUI();
    },

    rotateSelected() {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();
        this.state.bricks.forEach(b => {
            if (this.state.selectedIds.includes(b.id)) {
                b.rotation = b.rotation === 0 ? 180 : 0;
            }
        });
        this.updateUI();
    },

    deleteSelected() {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();
        this.state.bricks = this.state.bricks.filter(b => !this.state.selectedIds.includes(b.id));
        this.state.selectedIds = [];
        this.updateUI();
    },

    align(mode) {
        if (this.state.selectedIds.length < 2) return;
        this.pushHistory();

        const selectedBricks = this.state.bricks.filter(b => this.state.selectedIds.includes(b.id));

        // Calculate bounds of selection
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        selectedBricks.forEach(b => {
            const type = BRICK_TYPES.find(t => t.id === b.typeId);
            const w = b.customWidth || type.width;
            const h = b.customHeight || type.height;
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + w);
            maxY = Math.max(maxY, b.y + h);
        });

        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;

        selectedBricks.forEach(b => {
            const type = BRICK_TYPES.find(t => t.id === b.typeId);
            const w = b.customWidth || type.width;
            const h = b.customHeight || type.height;

            switch (mode) {
                case 'left': b.x = minX; break;
                case 'center-x': b.x = centerX - w / 2; break;
                case 'right': b.x = maxX - w; break;
                case 'top': b.y = minY; break;
                case 'center-y': b.y = centerY - h / 2; break;
                case 'bottom': b.y = maxY - h; break;
            }

            // Snap to grid after alignment
            b.x = Math.round(b.x / GRID_X) * GRID_X;
            b.y = Math.round(b.y / GRID_Y) * GRID_Y;
        });

        this.updateUI();
    },

    duplicateSelected() {
        if (this.state.selectedIds.length === 0) return;
        this.pushHistory();

        const selectedBricks = this.state.bricks.filter(b => this.state.selectedIds.includes(b.id));

        // Calculate bounding box of selection
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        selectedBricks.forEach(b => {
            const type = BRICK_TYPES.find(t => t.id === b.typeId);
            const w = b.customWidth || type.width;
            const h = b.customHeight || type.height;
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + w);
            maxY = Math.max(maxY, b.y + h);
        });

        const groupWidth = maxX - minX;
        // Initial offset: Place immediately to the right of the selection
        let offsetX = groupWidth;
        let offsetY = 0;

        // Find valid position (non-overlapping)
        let isValid = false;
        let attempts = 0;

        // Clone bricks for collision checking
        const newBricks = selectedBricks.map(b => {
            const newBrick = JSON.parse(JSON.stringify(b));
            newBrick.id = uuidv4();
            newBrick.zIndex = this.state.bricks.length + 1; // Temporary zIndex
            return newBrick;
        });

        while (!isValid && attempts < 100) {
            isValid = true;

            // Update positions of new bricks
            newBricks.forEach((nb, i) => {
                const original = selectedBricks[i];
                nb.x = original.x + offsetX;
                nb.y = original.y + offsetY;
            });

            // Check collisions against ALL existing bricks (including the ones we are duplicating)
            for (const nb of newBricks) {
                const type = BRICK_TYPES.find(t => t.id === nb.typeId);
                const w = nb.customWidth || type.width;
                const h = nb.customHeight || type.height;
                const nbRect = { x: nb.x, y: nb.y, w, h };

                for (const existing of this.state.bricks) {
                    const eType = BRICK_TYPES.find(t => t.id === existing.typeId);
                    const ew = existing.customWidth || eType.width;
                    const eh = existing.customHeight || eType.height;
                    const eRect = { x: existing.x, y: existing.y, w: ew, h: eh };

                    if (this.checkCollision(nbRect, eRect)) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }

            if (!isValid) {
                offsetX += GRID_X; // Shift right by one unit
            }
            attempts++;
        }

        // Add new bricks
        newBricks.forEach((nb, i) => {
            nb.zIndex = this.state.bricks.length + i;
        });

        this.state.bricks.push(...newBricks);
        this.state.selectedIds = newBricks.map(b => b.id);
        this.updateUI();
    },

    clearCanvas() {
        if (confirm('Clear canvas?')) {
            this.pushHistory();
            this.state.bricks = [];
            this.state.selectedIds = [];
            this.updateUI();
        }
    },

    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT') return; // Don't trigger when typing in inputs

        // Show shortcuts panel with ?  or Shift+/
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            this.el['shortcuts-overlay'].classList.add('show');
            return;
        }

        // Esc to deselect
        if (e.key === 'Escape') {
            this.state.selectedIds = [];
            this.updateUI();
            // Also close any open modals
            this.el['wiki-overlay'].classList.remove('show');
            this.el['shortcuts-overlay'].classList.remove('show');
            return;
        }

        // Ctrl+A to select all
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            this.state.selectedIds = this.state.bricks.map(b => b.id);
            this.updateUI();
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace' || e.key.toLowerCase() === 'x') this.deleteSelected();
        if (e.key.toLowerCase() === 'r') this.rotateSelected();
        if (e.key.toLowerCase() === 'd') {
            e.preventDefault(); // Prevent browser bookmark shortcut
            this.duplicateSelected();
        }
        if (e.key.toLowerCase() === 'h') {
            this.state.activeTool = this.state.activeTool === 'hand' ? 'select' : 'hand';
            this.el['canvas-svg'].style.cursor = this.state.activeTool === 'hand' ? 'grab' : 'default';
        }
        if (e.key.toLowerCase() === 'v') {
            this.state.activeTool = 'select';
            this.el['canvas-svg'].style.cursor = 'default';
        }

        // Grouping
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            if (e.shiftKey) {
                this.ungroupSelected();
            } else {
                this.groupSelected();
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) this.redo(); else this.undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
    },

    handleCanvasDown(e) {
        // Store initial click position to detect click vs drag
        this.mouseDownPos = { x: e.clientX, y: e.clientY };
        this.hasMovedMouse = false;

        // Check if clicking on a brick (more reliable check)
        const clickedElement = e.target;
        const brickGroup = clickedElement.closest('g[data-id]');

        if (brickGroup) {
            // Clicked on a brick - handle brick selection/drag
            const brickId = brickGroup.dataset.id;
            this.handleBrickDown(e, brickId);
            return;
        }

        // Clicked on empty canvas
        if (this.state.activeTool === 'select') {
            // Start potential marquee selection
            this.isSelecting = true;
            this.selectionBoxStart = this.getSVGPoint(e.clientX, e.clientY);
            this.el['selection-box'].setAttribute('x', this.selectionBoxStart.x);
            this.el['selection-box'].setAttribute('y', this.selectionBoxStart.y);
            this.el['selection-box'].setAttribute('width', '0');
            this.el['selection-box'].setAttribute('height', '0');
            this.el['selection-box'].style.display = 'block';

            // Don't clear selection yet - wait to see if it's a click or drag
            // If Shift is held, we're adding to selection
            this.shiftHeldOnDown = e.shiftKey;
        } else if (this.state.activeTool === 'hand' || e.code === 'Space') {
            // Start Panning
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.viewStart = { ...this.state.view };
            this.el['canvas-svg'].style.cursor = 'grabbing';
        }
    },

    handleCanvasMove(e) {
        if (this.isResizing) {
            const dx = (e.clientX - this.resizeStart.x) / this.state.view.scale;
            const dy = (e.clientY - this.resizeStart.y) / this.state.view.scale;

            const brick = this.state.bricks.find(b => b.id === this.resizeTargetId);
            const start = this.resizeStartBrick;

            let newW = start.w;
            let newH = start.h;
            let newX = start.x;
            let newY = start.y;

            // Calculate new dimensions based on direction
            if (this.resizeDir.includes('r')) newW = Math.max(30, start.w + dx);
            if (this.resizeDir.includes('b')) newH = Math.max(36, start.h + dy);
            if (this.resizeDir.includes('l')) {
                const w = Math.max(30, start.w - dx);
                newW = w;
                newX = start.x + (start.w - w);
            }
            if (this.resizeDir.includes('t')) {
                const h = Math.max(36, start.h - dy);
                newH = h;
                newY = start.y + (start.h - h);
            }

            // Enforce min width for arches
            const type = BRICK_TYPES.find(t => t.id === brick.typeId);
            if (type.shape === 'arch') {
                if (newW < 2 * GRID_X) {
                    if (this.resizeDir.includes('l')) {
                        // If resizing from left, adjust X to maintain right edge
                        newX = (start.x + start.w) - (2 * GRID_X);
                    }
                    newW = 2 * GRID_X;
                }
            }

            // Snap to grid
            newW = Math.round(newW / GRID_X) * GRID_X;
            newH = Math.round(newH / GRID_Y) * GRID_Y;
            newX = Math.round(newX / GRID_X) * GRID_X;
            newY = Math.round(newY / GRID_Y) * GRID_Y;

            // Update brick
            brick.customWidth = newW;
            brick.customHeight = newH;
            brick.x = newX;
            brick.y = newY;

            // Collision Check
            let hasCollision = false;
            const mRect = { x: brick.x, y: brick.y, w: brick.customWidth, h: brick.customHeight };

            for (const other of this.state.bricks) {
                if (other.id === brick.id) continue;
                const oType = BRICK_TYPES.find(t => t.id === other.typeId);
                const ow = other.customWidth || oType.width;
                const oh = other.customHeight || oType.height;
                const oRect = { x: other.x, y: other.y, w: ow, h: oh };

                if (this.checkCollision(mRect, oRect)) {
                    hasCollision = true;
                    break;
                }
            }

            if (hasCollision) {
                // Revert visual feedback (optional: show red outline)
                this.state.isValidPlacement = false;
            } else {
                this.state.isValidPlacement = true;
            }

            this.updateUI();
        } else if (this.isDragging) {
            const dx = (e.clientX - this.dragStart.x) / this.state.view.scale;
            const dy = (e.clientY - this.dragStart.y) / this.state.view.scale;

            // Snap movement to grid
            const snapX = Math.round(dx / GRID_X) * GRID_X;
            const snapY = Math.round(dy / GRID_Y) * GRID_Y;

            // Update positions of all selected bricks
            this.state.bricks.forEach(b => {
                if (this.state.selectedIds.includes(b.id)) {
                    const start = this.state.dragStartBricks.find(sb => sb.id === b.id);
                    if (start) {
                        b.x = start.x + snapX;
                        b.y = start.y + snapY;
                    }
                }
            });

            // Check collisions
            let hasCollision = false;
            for (const id of this.state.selectedIds) {
                const brick = this.state.bricks.find(b => b.id === id);
                const type = BRICK_TYPES.find(t => t.id === brick.typeId);
                const w = brick.customWidth || type.width;
                const h = brick.customHeight || type.height;
                const rect = { x: brick.x, y: brick.y, w, h };

                for (const other of this.state.bricks) {
                    if (this.state.selectedIds.includes(other.id)) continue;
                    const oType = BRICK_TYPES.find(t => t.id === other.typeId);
                    const ow = other.customWidth || oType.width;
                    const oh = other.customHeight || oType.height;
                    const oRect = { x: other.x, y: other.y, w: ow, h: oh };

                    if (this.checkCollision(rect, oRect)) {
                        hasCollision = true;
                        break;
                    }
                }
                if (hasCollision) break;
            }

            this.state.isValidPlacement = !hasCollision;
            this.updateUI();
        } else if (this.isPanning) {
            const dx = e.clientX - this.panStart.x;
            const dy = e.clientY - this.panStart.y;
            this.state.view.x = this.viewStart.x + dx;
            this.state.view.y = this.viewStart.y + dy;
            this.setZoom(this.state.view.scale); // Update transform
        } else if (this.isSelecting) {
            // Track if mouse has moved significantly (more than 3 pixels)
            if (this.mouseDownPos) {
                const dx = Math.abs(e.clientX - this.mouseDownPos.x);
                const dy = Math.abs(e.clientY - this.mouseDownPos.y);
                if (dx > 3 || dy > 3) {
                    this.hasMovedMouse = true;
                }
            }

            const pt = this.getSVGPoint(e.clientX, e.clientY);
            const x = Math.min(pt.x, this.selectionBoxStart.x);
            const y = Math.min(pt.y, this.selectionBoxStart.y);
            const w = Math.abs(pt.x - this.selectionBoxStart.x);
            const h = Math.abs(pt.y - this.selectionBoxStart.y);

            this.el['selection-box'].setAttribute('x', x);
            this.el['selection-box'].setAttribute('y', y);
            this.el['selection-box'].setAttribute('width', w);
            this.el['selection-box'].setAttribute('height', h);
        }
    },

    handleCanvasUp(e) {
        if (this.isResizing) {
            this.isResizing = false;
            if (!this.state.isValidPlacement) {
                this.state.bricks = JSON.parse(JSON.stringify(this.state.dragStartBricks));
            } else {
                this.pushHistory(); // Save state after resize
            }
            this.updateUI();
        }
        if (this.isDragging) {
            this.isDragging = false;

            if (!this.state.isValidPlacement) {
                // Revert to start position if invalid
                this.state.bricks = JSON.parse(JSON.stringify(this.state.dragStartBricks));
                this.updateUI();
                return;
            }

            // Snap to grid (if not magnetically snapped, or maybe always snap to grid?)
            // Let's enforce grid snap on drop for consistency
            this.state.bricks.forEach(b => {
                if (this.state.selectedIds.includes(b.id)) {
                    b.x = Math.round(b.x / GRID_X) * GRID_X;
                    b.y = Math.round(b.y / GRID_Y) * GRID_Y;
                }
            });

            this.updateUI();
        }
        if (this.isPanning) {
            this.isPanning = false;
            this.el['canvas-svg'].style.cursor = this.state.activeTool === 'hand' ? 'grab' : 'default';
        }
        if (this.isSelecting) {
            this.isSelecting = false;
            this.el['selection-box'].style.display = 'none';

            // Check if this was a simple click (no drag) or a drag
            if (!this.hasMovedMouse) {
                // Simple click on empty canvas - deselect all (unless Shift was held)
                if (!this.shiftHeldOnDown) {
                    this.state.selectedIds = [];
                    this.updateUI();
                }
            } else {
                // This was a drag - do marquee selection
                // Use the stored coordinates from the selection box attributes
                const x = parseFloat(this.el['selection-box'].getAttribute('x'));
                const y = parseFloat(this.el['selection-box'].getAttribute('y'));
                const width = parseFloat(this.el['selection-box'].getAttribute('width'));
                const height = parseFloat(this.el['selection-box'].getAttribute('height'));

                const box = { x, y, width, height };

                const selected = this.state.bricks.filter(b => {
                    const type = BRICK_TYPES.find(t => t.id === b.typeId);
                    const w = b.customWidth || type.width;
                    const h = b.customHeight || type.height;

                    const isIntersecting = (
                        b.x < box.x + box.width &&
                        b.x + w > box.x &&
                        b.y < box.y + box.height &&
                        b.y + h > box.y
                    );

                    return isIntersecting;
                });

                if (this.shiftHeldOnDown) {
                    const newIds = selected.map(b => b.id);
                    // Add to existing selection
                    const combined = [...this.state.selectedIds, ...newIds];
                    this.state.selectedIds = [...new Set(combined)];
                } else {
                    // Replace selection
                    this.state.selectedIds = selected.map(b => b.id);
                }
                this.updateUI();
            }
        }
    },

    checkCollision(r1, r2) {
        return (
            r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y
        );
    },

    getSVGPoint(x, y) {
        const pt = this.el['canvas-svg'].createSVGPoint();
        pt.x = x;
        pt.y = y;
        const ctm = this.el['canvas-transform'].getScreenCTM();
        if (ctm) {
            return pt.matrixTransform(ctm.inverse());
        }
        return pt;
    },

    setZoom(scale) {
        this.state.view.scale = Math.max(0.1, Math.min(5, scale));
        this.el['zoom-level'].textContent = Math.round(this.state.view.scale * 100) + '%';
        this.el['canvas-transform'].setAttribute('transform', `translate(${this.state.view.x},${this.state.view.y}) scale(${this.state.view.scale})`);
    },

    zoomIn() {
        const newScale = this.state.view.scale + 0.1;
        this.setZoom(newScale);
    },

    zoomOut() {
        const newScale = this.state.view.scale - 0.1;
        this.setZoom(newScale);
    },

    zoomReset() {
        this.setZoom(1.0);
    },

    // --- Rendering ---
    renderBricks() {
        const container = this.el['bricks-layer'];
        container.innerHTML = '';

        // Sort by Z-Index
        const sorted = [...this.state.bricks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        const svgNS = "http://www.w3.org/2000/svg";

        sorted.forEach(brick => {
            const type = BRICK_TYPES.find(t => t.id === brick.typeId);
            if (!type) return;

            const width = brick.customWidth || type.width;
            const height = brick.customHeight || type.height;
            const isSelected = this.state.selectedIds.includes(brick.id);

            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("transform", `translate(${brick.x}, ${brick.y})`);
            g.dataset.id = brick.id;
            g.style.cursor = "move";

            // Selection Highlight
            if (isSelected) {
                const highlight = document.createElementNS(svgNS, "rect");
                highlight.setAttribute("x", "-2");
                highlight.setAttribute("y", "-2");
                highlight.setAttribute("width", (width + 4).toString());
                highlight.setAttribute("height", (height + 4).toString());
                highlight.setAttribute("fill", "none");
                highlight.setAttribute("stroke", this.state.isValidPlacement ? "#4f46e5" : "#ef4444");
                highlight.setAttribute("stroke-width", "2");
                g.appendChild(highlight);

                // Resize Handles
                const handles = [
                    { x: -6, y: -6, cursor: 'nwse-resize', dir: 'tl' }, // Top-Left
                    { x: width - 2, y: -6, cursor: 'nesw-resize', dir: 'tr' }, // Top-Right
                    { x: -6, y: height - 2, cursor: 'nesw-resize', dir: 'bl' }, // Bottom-Left
                    { x: width - 2, y: height - 2, cursor: 'nwse-resize', dir: 'br' } // Bottom-Right
                ];

                handles.forEach(h => {
                    const rect = document.createElementNS(svgNS, "rect");
                    rect.setAttribute("x", h.x.toString());
                    rect.setAttribute("y", h.y.toString());
                    rect.setAttribute("width", "8");
                    rect.setAttribute("height", "8");
                    rect.setAttribute("fill", "white");
                    rect.setAttribute("stroke", "#4f46e5");
                    rect.setAttribute("stroke-width", "1");
                    rect.style.cursor = h.cursor;

                    rect.onmousedown = (e) => {
                        e.stopPropagation();
                        this.handleResizeDown(e, brick.id, h.dir);
                    };

                    g.appendChild(rect);
                });
            }

            if (isSelected && !this.state.isValidPlacement) {
                g.style.opacity = "0.5";
            }

            // Brick Body
            let body;
            if (type.shape === 'slope') {
                body = document.createElementNS(svgNS, "path");
                if (brick.rotation === 180) {
                    // Rotated: diagonal from bottom-right to top-left
                    body.setAttribute("d", `M1 ${height - 1} L${width - 1} ${height - 1} L1 1 Z`);
                } else {
                    // Normal: diagonal from bottom-left to top-right
                    body.setAttribute("d", `M1 ${height - 1} L${width - 1} ${height - 1} L${width - 1} 1 Z`);
                }
            } else if (type.shape === 'arch') {
                body = document.createElementNS(svgNS, "path");
                // Legs are 1 unit (GRID_X) wide
                const legWidth = GRID_X;
                const archHeight = 20;
                body.setAttribute("d", `M1 ${height - 1} L1 1 L${width - 1} 1 L${width - 1} ${height - 1} L${width - legWidth} ${height - 1} L${width - legWidth} ${archHeight} Q${width / 2} -10 ${legWidth} ${archHeight} L${legWidth} ${height - 1} Z`);
            } else {
                // Default: rectangle for standard brick
                body = document.createElementNS(svgNS, "rect");
                body.setAttribute("x", "1");
                body.setAttribute("y", "1");
                body.setAttribute("width", (width - 2).toString());
                body.setAttribute("height", (height - 2).toString());
            }
            body.setAttribute("fill", brick.color);
            body.setAttribute("stroke", "rgba(0,0,0,0.1)");
            g.appendChild(body);

            // Studs
            if (type.shape !== 'slope') {
                const studCount = Math.floor(width / 30);
                for (let i = 0; i < studCount; i++) {
                    const stud = document.createElementNS(svgNS, "rect");
                    const studX = i * 30 + (30 - 18) / 2 + 1;
                    stud.setAttribute("x", studX.toString());
                    stud.setAttribute("y", "-6");
                    stud.setAttribute("width", "16");
                    stud.setAttribute("height", "6");
                    stud.setAttribute("fill", brick.color);
                    stud.setAttribute("stroke", "rgba(0,0,0,0.1)");
                    g.appendChild(stud);
                }
            }

            // Event Listener for Selection
            g.onmousedown = (e) => {
                // If Hand tool is active, let the event propagate to the canvas for panning
                if (this.state.activeTool === 'hand' || e.code === 'Space') return;

                e.stopPropagation();
                this.handleBrickDown(e, brick.id);
            };

            container.appendChild(g);
        });
    },

    handleResizeDown(e, id, dir) {
        this.isResizing = true;
        this.resizeTargetId = id;
        this.resizeDir = dir;
        this.resizeStart = { x: e.clientX, y: e.clientY };

        const brick = this.state.bricks.find(b => b.id === id);
        const type = BRICK_TYPES.find(t => t.id === brick.typeId);
        this.resizeStartBrick = {
            ...brick,
            w: brick.customWidth || type.width,
            h: brick.customHeight || type.height
        };

        this.state.dragStartBricks = JSON.parse(JSON.stringify(this.state.bricks)); // Backup for revert
    },

    updateUI() {
        this.renderBricks();

        const hasSelection = this.state.selectedIds.length > 0;
        const brickCount = this.state.bricks.length;

        this.el['delete-btn'].disabled = !hasSelection;
        this.el['flip-btn'].disabled = !hasSelection;

        // Update selection info with brick count badge
        if (hasSelection) {
            if (this.state.selectedIds.length === 1) {
                const brick = this.state.bricks.find(b => b.id === this.state.selectedIds[0]);
                const type = BRICK_TYPES.find(t => t.id === brick.typeId);
                this.el['selection-info'].innerHTML = `<strong>${type.name}</strong> selected`;
            } else {
                this.el['selection-info'].innerHTML = `<strong>${this.state.selectedIds.length} bricks</strong> selected`;
            }
        } else {
            this.el['selection-info'].innerHTML = `<span style="opacity: 0.6;">${brickCount} ${brickCount === 1 ? 'brick' : 'bricks'} total</span>`;
        }

        this.el['properties-content'].style.display = hasSelection ? 'flex' : 'none';

        if (hasSelection) {
            // Update properties panel values based on first selected brick
            if (this.state.selectedIds.length === 1) {
                const brick = this.state.bricks.find(b => b.id === this.state.selectedIds[0]);
                const type = BRICK_TYPES.find(t => t.id === brick.typeId);

                this.el['properties-panel'].classList.remove('hidden');

                this.el['prop-width'].value = (brick.customWidth || type.width) / GRID_X;
                this.el['prop-height'].value = (brick.customHeight || type.height) / GRID_Y;
            } else if (this.state.selectedIds.length > 1) {
                this.el['properties-panel'].classList.remove('hidden');
                this.el['prop-width'].value = '';
                this.el['prop-height'].value = '';
            } else {
                this.el['properties-panel'].classList.add('hidden');
            }
        }
    },

    handleBrickDown(e, id) {
        const clickedBrick = this.state.bricks.find(b => b.id === id);
        let idsToSelect = [id];

        // If part of a group, select all in group
        if (clickedBrick && clickedBrick.groupId) {
            idsToSelect = this.state.bricks.filter(b => b.groupId === clickedBrick.groupId).map(b => b.id);
        }

        if (e.shiftKey) {
            // Toggle selection
            if (idsToSelect.some(sid => this.state.selectedIds.includes(sid))) {
                this.state.selectedIds = this.state.selectedIds.filter(sid => !idsToSelect.includes(sid));
            } else {
                this.state.selectedIds.push(...idsToSelect);
            }
        } else {
            // Single selection (unless already selected, then don't clear others yet to allow drag)
            if (!idsToSelect.some(sid => this.state.selectedIds.includes(sid))) {
                this.state.selectedIds = idsToSelect;
            }
        }

        // Deduplicate
        this.state.selectedIds = [...new Set(this.state.selectedIds)];

        this.updateUI();

        // Start Drag
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.state.dragStartBricks = JSON.parse(JSON.stringify(this.state.bricks));
        this.state.isValidPlacement = true;
    },

    handleExport() {
        if (this.state.bricks.length === 0) {
            alert('Nothing to export!');
            return;
        }

        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.state.bricks.forEach(b => {
            const type = BRICK_TYPES.find(t => t.id === b.typeId);
            const w = b.customWidth || type.width;
            const h = b.customHeight || type.height;
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + w);
            maxY = Math.max(maxY, b.y + h);
        });

        const padding = 20;
        const width = maxX - minX + (padding * 2);
        const height = maxY - minY + (padding * 2);
        const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('xmlns', svgNS);
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.backgroundColor = "transparent";

        // Sort by Z-Index
        const sorted = [...this.state.bricks].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        sorted.forEach(brick => {
            const type = BRICK_TYPES.find(t => t.id === brick.typeId);
            if (!type) return;

            const bWidth = brick.customWidth || type.width;
            const bHeight = brick.customHeight || type.height;

            const g = document.createElementNS(svgNS, "g");
            g.setAttribute("transform", `translate(${brick.x}, ${brick.y})`);

            // Brick Body
            let body;
            if (type.shape === 'slope') {
                body = document.createElementNS(svgNS, "path");
                if (brick.rotation === 180) {
                    body.setAttribute("d", `M1 ${bHeight - 1} L${bWidth - 1} ${bHeight - 1} L${bWidth - 1} 1 Z`);
                } else {
                    body.setAttribute("d", `M1 ${bHeight - 1} L${bWidth - 1} ${bHeight - 1} L${bWidth - 1} 1 Z`);
                }
            } else if (type.shape === 'arch') {
                body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", `M1 ${bHeight - 1} L1 1 L${bWidth - 1} 1 L${bWidth - 1} ${bHeight - 1} L${bWidth - 20} ${bHeight - 1} L${bWidth - 20} ${20} Q${bWidth / 2} -10 20 20 L20 ${bHeight - 1} Z`);
            } else {
                body = document.createElementNS(svgNS, "rect");
                body.setAttribute("x", "1");
                body.setAttribute("y", "1");
                body.setAttribute("width", (bWidth - 2).toString());
                body.setAttribute("height", (bHeight - 2).toString());
            }
            body.setAttribute("fill", brick.color);
            body.setAttribute("stroke", "rgba(0,0,0,0.1)");
            g.appendChild(body);

            // Studs
            if (type.shape !== 'slope') {
                const studCount = Math.floor(bWidth / 30);
                for (let i = 0; i < studCount; i++) {
                    const stud = document.createElementNS(svgNS, "rect");
                    const studX = i * 30 + (30 - 18) / 2 + 1;
                    stud.setAttribute("x", studX.toString());
                    stud.setAttribute("y", "-6");
                    stud.setAttribute("width", "16");
                    stud.setAttribute("height", "6");
                    stud.setAttribute("fill", brick.color);
                    stud.setAttribute("stroke", "rgba(0,0,0,0.1)");
                    g.appendChild(stud);
                }
            }

            svg.appendChild(g);
        });

        const svgData = svg.outerHTML;
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'brick-creation.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    loadAutoSave() {
        const autoSave = Storage.loadAutoSave();
        if (autoSave && autoSave.bricks && autoSave.bricks.length > 0) {
            // Show discrete restore button instead of invasive confirm
            this.el['restore-btn'].style.display = 'inline-block';
            this.el['restore-btn'].title = `Restore ${autoSave.bricks.length} auto-saved bricks`;
        }
    },

    restoreAutoSave() {
        const autoSave = Storage.loadAutoSave();
        if (autoSave && autoSave.bricks) {
            this.state.bricks = autoSave.bricks;
            this.state.view = autoSave.view || this.state.view;
            this.updateUI();
            this.setZoom(this.state.view.scale);
            // Hide restore button after restoring
            this.el['restore-btn'].style.display = 'none';
            Storage.clearAutoSave();
        }
    },

    exportPNG() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate bounding box
        if (this.state.bricks.length === 0) {
            alert('No bricks to export!');
            return;
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.state.bricks.forEach(brick => {
            const type = BRICK_TYPES.find(t => t.id === brick.typeId);
            const w = brick.customWidth || type.width;
            const h = brick.customHeight || type.height;
            minX = Math.min(minX, brick.x);
            minY = Math.min(minY, brick.y);
            maxX = Math.max(maxX, brick.x + w);
            maxY = Math.max(maxY, brick.y + h);
        });

        const padding = 20;
        canvas.width = (maxX - minX) + padding * 2;
        canvas.height = (maxY - minY) + padding * 2;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw each brick
        this.state.bricks.forEach(brick => {
            const type = BRICK_TYPES.find(t => t.id === brick.typeId);
            const bWidth = brick.customWidth || type.width;
            const bHeight = brick.customHeight || type.height;
            const x = brick.x - minX + padding;
            const y = brick.y - minY + padding;

            ctx.fillStyle = brick.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;

            if (type.shape === 'slope' || type.shape === 'inv-slope') {
                // Draw as polygon
                ctx.beginPath();
                if (type.shape === 'slope') {
                    ctx.moveTo(x, y + bHeight);
                    ctx.lineTo(x + bWidth, y + bHeight);
                    ctx.lineTo(x + bWidth, y + 10);
                    ctx.lineTo(x, y);
                } else {
                    ctx.moveTo(x, y + bHeight);
                    ctx.lineTo(x + bWidth, y + bHeight);
                    ctx.lineTo(x + bWidth, y);
                    ctx.lineTo(x, y + 10);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                // Rectangle
                ctx.fillRect(x, y, bWidth, bHeight);
                ctx.strokeRect(x, y, bWidth, bHeight);
            }
        });

        // Download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'brick-creation.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }
};
