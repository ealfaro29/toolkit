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
        // Start a group for potential collection of state or transforms
        // but we'll only output <g> if we actually do something requiring scope
        // For simplicity in this specific app which pairs save sets with restores:
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
        // Assume full circle for this app's usage (webcam dot)
        this.xml.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${this.state.fill}" />`);
    }

    fill() {
        let filterAttr = '';
        if (this.state.shadow && this.state.shadow.color !== 'transparent' && this.state.shadow.blur > 0) {
            const id = 'shadow-' + (this.idCounter++);
            const s = this.state.shadow;
            // Note: stdDeviation is blur/2 roughly
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
        // Ensure we're using data URL
        this.xml.push(`<image href="${img.src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" />`);
    }
}
