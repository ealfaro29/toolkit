import { BRICK_TYPES, COLORS, GRID_X, GRID_Y } from './constants.js';
import { uuidv4 } from './utils.js';

export const Storage = {
    AUTO_SAVE_KEY: 'brickbuilder_autosave',
    AUTO_SAVE_TIMESTAMP_KEY: 'brickbuilder_autosave_timestamp',
    PROJECTS_KEY: 'brickbuilder_projects',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    app: null, // Will be set by App.init()

    init(app) {
        this.app = app;
        // Start auto-save interval
        setInterval(() => this.autoSave(), this.AUTO_SAVE_INTERVAL);
    },

    autoSave() {
        if (!this.app || !this.app.state) return;

        const data = {
            bricks: this.app.state.bricks,
            view: this.app.state.view,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(data));
            localStorage.setItem(this.AUTO_SAVE_TIMESTAMP_KEY, data.timestamp.toString());
            this.updateSaveIndicator();
        } catch (e) {
            console.warn('Auto-save failed:', e);
        }
    },

    loadAutoSave() {
        try {
            const data = localStorage.getItem(this.AUTO_SAVE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load auto-save:', e);
        }
        return null;
    },

    getLastSaveTime() {
        const timestamp = localStorage.getItem(this.AUTO_SAVE_TIMESTAMP_KEY);
        if (timestamp) {
            return parseInt(timestamp);
        }
        return null;
    },

    updateSaveIndicator() {
        const indicator = document.getElementById('save-indicator');
        if (!indicator) return;

        const lastSave = this.getLastSaveTime();
        if (lastSave) {
            const elapsed = Date.now() - lastSave;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);

            if (minutes > 0) {
                indicator.textContent = `Saved ${minutes}m ago`;
            } else {
                indicator.textContent = `Saved ${seconds}s ago`;
            }
        }
    },

    saveProject(name) {
        if (!this.app || !this.app.state) return;

        const projects = this.getProjects();
        const project = {
            id: uuidv4(),
            name: name || `Project ${projects.length + 1}`,
            bricks: this.app.state.bricks,
            view: this.app.state.view,
            timestamp: Date.now(),
            thumbnail: this.generateThumbnail()
        };

        projects.push(project);
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
        return project;
    },

    getProjects() {
        try {
            const data = localStorage.getItem(this.PROJECTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    loadProject(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },

    deleteProject(id) {
        const projects = this.getProjects().filter(p => p.id !== id);
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    },

    generateThumbnail() {
        // Simple thumbnail - just store brick count
        return this.app ? this.app.state.bricks.length : 0;
    },

    clearAutoSave() {
        localStorage.removeItem(this.AUTO_SAVE_KEY);
        localStorage.removeItem(this.AUTO_SAVE_TIMESTAMP_KEY);
    }
};
