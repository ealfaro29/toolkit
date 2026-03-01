/**
 * ColorEngine - SVG Color Detection, Grouping, and Replacement
 * Handles all color operations for the SVG Recolor app
 */

export const ColorEngine = {
    /**
     * Extract all colors from an SVG document
     * @param {SVGElement} svgElement - The SVG DOM element
     * @returns {Array} Array of {color, count, elements, type} objects
     */
    extractColorsFromSVG(svgElement) {
        const colorMap = new Map();

        // Helper to track a color
        const trackColor = (colorStr, element, type) => {
            if (!colorStr || colorStr === 'none' || colorStr === 'transparent') return;

            const normalized = this.normalizeColor(colorStr);
            if (!normalized) return;

            if (!colorMap.has(normalized)) {
                colorMap.set(normalized, { color: normalized, count: 0, elements: [], type });
            }

            const data = colorMap.get(normalized);
            data.count++;
            data.elements.push({ element, type });
        };

        // Extract from fill attributes
        svgElement.querySelectorAll('[fill]').forEach(el => {
            const fill = el.getAttribute('fill');
            if (fill && !fill.startsWith('url(')) { // Skip gradient references
                trackColor(fill, el, 'fill');
            }
        });

        // Extract from stroke attributes
        svgElement.querySelectorAll('[stroke]').forEach(el => {
            const stroke = el.getAttribute('stroke');
            if (stroke && !stroke.startsWith('url(')) {
                trackColor(stroke, el, 'stroke');
            }
        });

        // Extract from inline styles
        svgElement.querySelectorAll('[style]').forEach(el => {
            const style = el.getAttribute('style');
            if (style) {
                // Match fill: color
                const fillMatch = style.match(/fill\s*:\s*([^;]+)/);
                if (fillMatch && !fillMatch[1].startsWith('url(')) {
                    trackColor(fillMatch[1].trim(), el, 'fill-style');
                }
                // Match stroke: color
                const strokeMatch = style.match(/stroke\s*:\s*([^;]+)/);
                if (strokeMatch && !strokeMatch[1].startsWith('url(')) {
                    trackColor(strokeMatch[1].trim(), el, 'stroke-style');
                }
            }
        });

        // Extract from gradients (stop-color)
        svgElement.querySelectorAll('stop').forEach(stop => {
            const stopColor = stop.getAttribute('stop-color');
            if (stopColor) {
                trackColor(stopColor, stop, 'gradient-stop');
            }
        });

        // Extract from embedded CSS style tags
        svgElement.querySelectorAll('style').forEach(styleEl => {
            const cssText = styleEl.textContent;
            if (cssText) {
                // Match patterns like .className{fill:#hex} or {fill:rgb(...)}
                const colorPatterns = [
                    /fill\s*:\s*#([0-9a-fA-F]{3,6})/g,
                    /fill\s*:\s*(rgb\([^)]+\))/g,
                    /stroke\s*:\s*#([0-9a-fA-F]{3,6})/g,
                    /stroke\s*:\s*(rgb\([^)]+\))/g,
                    /stop-color\s*:\s*#([0-9a-fA-F]{3,6})/g
                ];

                // Extract hex colors from fill/stroke
                const hexMatches = cssText.matchAll(/(?:fill|stroke|stop-color)\s*:\s*#([0-9a-fA-F]{3,6})/gi);
                for (const match of hexMatches) {
                    trackColor('#' + match[1], styleEl, 'css-style');
                }

                // Extract rgb colors
                const rgbMatches = cssText.matchAll(/(?:fill|stroke)\s*:\s*(rgb\([^)]+\))/gi);
                for (const match of rgbMatches) {
                    trackColor(match[1], styleEl, 'css-style');
                }
            }
        });

        // Convert to array and sort by count (most used first)
        return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
    },

    /**
     * Normalize any color format to hex
     * @param {string} colorStr - Color in any CSS format
     * @returns {string|null} Hex color or null if invalid
     */
    normalizeColor(colorStr) {
        const trimmed = colorStr.trim().toLowerCase();

        // Already hex
        if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
            return trimmed.toUpperCase();
        }

        // Short hex (#rgb -> #rrggbb)
        if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
            return '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
        }

        // rgb(r, g, b) or rgba(r, g, b, a)
        const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            return this.rgbToHex(r, g, b);
        }

        // Named colors (basic support)
        const namedColors = {
            'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000',
            'green': '#008000', 'blue': '#0000FF', 'yellow': '#FFFF00',
            'cyan': '#00FFFF', 'magenta': '#FF00FF', 'gray': '#808080',
            'grey': '#808080', 'orange': '#FFA500', 'purple': '#800080',
            'pink': '#FFC0CB', 'brown': '#A52A2A', 'lime': '#00FF00'
        };

        if (namedColors[trimmed]) {
            return namedColors[trimmed];
        }

        return null;
    },

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, x)).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    },

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to HSL
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h, s, l };
    },

    /**
     * Convert HSL to RGB
     */
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    /**
     * Shift the hue of a color by a specific amount
     * @param {string} hexColor - Original hex color
     * @param {number} hueDelta - Amount to shift hue (in degrees, -180 to 180)
     * @returns {string} New hex color with shifted hue
     */
    shiftHue(hexColor, hueDelta) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return hexColor;

        const { h, s, l } = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

        // Shift hue (hueDelta is in degrees, h is 0-1)
        let newH = h + (hueDelta / 360);

        // Wrap around to keep in 0-1 range
        while (newH < 0) newH += 1;
        while (newH > 1) newH -= 1;

        const newRgb = this.hslToRgb(newH, s, l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    },

    /**
     * Get hue category name from hue value (0-1)
     */
    getHueCategory(hue, saturation, lightness) {
        // Handle grays, blacks, whites first
        if (saturation < 0.1) {
            if (lightness < 0.2) return 'blacks';
            if (lightness > 0.8) return 'whites';
            return 'grays';
        }

        const hueDeg = hue * 360;

        if (hueDeg < 15 || hueDeg >= 345) return 'reds';
        if (hueDeg < 45) return 'oranges';
        if (hueDeg < 75) return 'yellows';
        if (hueDeg < 165) return 'greens';
        if (hueDeg < 195) return 'cyans';
        if (hueDeg < 255) return 'blues';
        if (hueDeg < 315) return 'purples';
        return 'magentas';
    },

    /**
     * Group colors by hue
     */
    groupColorsByHue(colors) {
        const groups = {
            reds: [], oranges: [], yellows: [], greens: [],
            cyans: [], blues: [], purples: [], magentas: [],
            grays: [], blacks: [], whites: []
        };

        colors.forEach(colorData => {
            const rgb = this.hexToRgb(colorData.color);
            if (!rgb) return;

            const { h, s, l } = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const category = this.getHueCategory(h, s, l);

            groups[category].push({ ...colorData, hsl: { h, s, l } });
        });

        // Sort within each group by lightness
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                if (a.hsl && b.hsl) {
                    return a.hsl.l - b.hsl.l;
                }
                return 0;
            });
        });

        return groups;
    },

    /**
     * Apply color replacements to SVG
     * @param {SVGElement} svgElement - The SVG to modify
     * @param {Map} colorMap - Map of oldColor -> newColor
     */
    applyColorReplacement(svgElement, colorMap) {
        colorMap.forEach((newColor, oldColor) => {
            const oldNormalized = this.normalizeColor(oldColor);
            const newNormalized = this.normalizeColor(newColor);

            if (!oldNormalized || !newNormalized) return;

            // Replace in fill attributes
            svgElement.querySelectorAll('[fill]').forEach(el => {
                const fill = el.getAttribute('fill');
                if (fill && this.normalizeColor(fill) === oldNormalized) {
                    el.setAttribute('fill', newNormalized);
                }
            });

            // Replace in stroke attributes
            svgElement.querySelectorAll('[stroke]').forEach(el => {
                const stroke = el.getAttribute('stroke');
                if (stroke && this.normalizeColor(stroke) === oldNormalized) {
                    el.setAttribute('stroke', newNormalized);
                }
            });

            // Replace in inline styles
            svgElement.querySelectorAll('[style]').forEach(el => {
                let style = el.getAttribute('style');
                if (style) {
                    // Replace fill in style
                    style = style.replace(/fill\s*:\s*([^;]+)/gi, (match, color) => {
                        if (this.normalizeColor(color.trim()) === oldNormalized) {
                            return `fill: ${newNormalized}`;
                        }
                        return match;
                    });
                    // Replace stroke in style
                    style = style.replace(/stroke\s*:\s*([^;]+)/gi, (match, color) => {
                        if (this.normalizeColor(color.trim()) === oldNormalized) {
                            return `stroke: ${newNormalized}`;
                        }
                        return match;
                    });
                    el.setAttribute('style', style);
                }
            });

            // Replace in gradients
            svgElement.querySelectorAll('stop').forEach(stop => {
                const stopColor = stop.getAttribute('stop-color');
                if (stopColor && this.normalizeColor(stopColor) === oldNormalized) {
                    stop.setAttribute('stop-color', newNormalized);
                }
            });

            // Replace in embedded CSS style tags
            svgElement.querySelectorAll('style').forEach(styleEl => {
                let cssText = styleEl.textContent;
                if (cssText) {
                    // Replace hex colors
                    cssText = cssText.replace(/(fill|stroke|stop-color)\s*:\s*#([0-9a-fA-F]{3,6})/gi, (match, prop, hex) => {
                        if (this.normalizeColor('#' + hex) === oldNormalized) {
                            return `${prop}:${newNormalized}`;
                        }
                        return match;
                    });
                    // Replace rgb colors
                    cssText = cssText.replace(/(fill|stroke)\s*:\s*(rgb\([^)]+\))/gi, (match, prop, rgb) => {
                        if (this.normalizeColor(rgb) === oldNormalized) {
                            return `${prop}:${newNormalized}`;
                        }
                        return match;
                    });
                    styleEl.textContent = cssText;
                }
            });
        });
    }
};
