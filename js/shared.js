(function () {
    const storageKey = "figmaLiteWorkspace";

    const defaultWorkspace = {
        settings: {
            compactSidebar: false,
            transitionSpeedMs: 320,
            loaderDelayMs: 180,
            canvasGridSize: 24,
            snapDistance: 8,
            zoomStep: 0.1,
            showGrid: true
        },
        theme: {
            bg: "#040712",
            bgSoft: "#07111f",
            card: "rgba(10, 18, 36, 0.9)",
            text: "#f7fbff",
            muted: "#9aabc7",
            primary: "#22d3ee",
            secondary: "#a855f7",
            success: "#4ade80",
            warning: "#facc15",
            danger: "#fb7185",
            radius: 18,
            fontFamily: "Inter, system-ui, sans-serif"
        },
        design: {
            name: "Untitled Design",
            viewport: { panX: 0, panY: 0, zoom: 1 },
            selectedElementId: "",
            elements: []
        },
        assets: [],
        activityLog: []
    };

    const navItems = [
        { page: "dashboard", label: "Dashboard", icon: "⌂", href: "index.html" },
        { page: "editor", label: "Editor", icon: "✦", href: "editor.html" },
        { page: "layers", label: "Layers", icon: "▤", href: "layers.html" },
        { page: "assets", label: "Assets", icon: "◈", href: "assets.html" },
        { page: "export", label: "Export", icon: "⇩", href: "export.html" },
        { page: "settings", label: "Settings", icon: "⚙", href: "settings.html" }
    ];

    function clone(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function formatTimestamp(dateString) {
        const date = dateString ? new Date(dateString) : new Date();
        return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    }

    function loadWorkspace() {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return seedDemoData();

        try {
            const parsed = JSON.parse(raw);
            return mergeWorkspace(defaultWorkspace, parsed);
        } catch (error) {
            console.warn("Workspace reset because saved data was invalid.", error);
            return seedDemoData();
        }
    }

    function mergeWorkspace(base, saved) {
        return {
            settings: { ...base.settings, ...(saved.settings || {}) },
            theme: { ...base.theme, ...(saved.theme || {}) },
            design: {
                ...base.design,
                ...(saved.design || {}),
                viewport: { ...base.design.viewport, ...((saved.design || {}).viewport || {}) },
                elements: Array.isArray((saved.design || {}).elements) ? saved.design.elements : []
            },
            assets: Array.isArray(saved.assets) ? saved.assets : [],
            activityLog: Array.isArray(saved.activityLog) ? saved.activityLog : []
        };
    }

    function saveWorkspace(workspace) {
        localStorage.setItem(storageKey, JSON.stringify(workspace));
        applyThemeSettings(workspace);
        return workspace;
    }

    function resetWorkspace() {
        localStorage.removeItem(storageKey);
        return seedDemoData();
    }

    function seedDemoData() {
        const workspace = clone(defaultWorkspace);
        const now = new Date().toISOString();
        workspace.design.name = "Landing Page Hero Concept";
        workspace.design.elements = [
            makeElement("rectangle", "Hero Background", 120, 110, 540, 310, { fill: "var(--bg-soft)", stroke: "var(--primary)", opacity: 1 }),
            makeElement("rectangle", "CTA Button", 170, 340, 180, 56, { fill: "var(--primary)", stroke: "var(--primary)" }),
            makeElement("circle", "Glow Circle", 520, 150, 120, 120, { fill: "var(--secondary)", stroke: "var(--secondary)", opacity: 0.75 }),
            makeElement("line", "Divider Line", 170, 315, 320, 4, { fill: "var(--warning)", stroke: "var(--warning)", strokeWidth: 4 }),
            makeElement("text", "Headline Text", 170, 170, 410, 72, { text: "Design faster with Figma Lite", fill: "var(--text)", fontSize: 34, strokeWidth: 0 }),
            makeElement("text", "Subtitle Text", 172, 260, 380, 48, { text: "Create shapes, text layers, manage layers and export SVG.", fill: "var(--muted)", fontSize: 18, strokeWidth: 0 })
        ];
        workspace.assets = [
            { id: generateId("asset"), name: "Primary Card", type: "rectangle", config: { width: 220, height: 140, fill: "var(--card)", stroke: "var(--primary)" }, createdAt: now },
            { id: generateId("asset"), name: "Action Button", type: "rectangle", config: { width: 170, height: 56, fill: "var(--primary)", stroke: "var(--primary)" }, createdAt: now },
            { id: generateId("asset"), name: "Accent Circle", type: "circle", config: { width: 96, height: 96, fill: "var(--secondary)", stroke: "var(--secondary)" }, createdAt: now },
            { id: generateId("asset"), name: "Heading Text", type: "text", config: { width: 360, height: 60, fill: "var(--text)", text: "Reusable Heading", fontSize: 32, strokeWidth: 0 }, createdAt: now }
        ];
        workspace.activityLog = [
            { id: generateId("log"), module: "Dashboard", action: "Demo seeded", detail: "Created starter workspace", createdAt: now },
            { id: generateId("log"), module: "Editor", action: "Created shape", detail: "Created Hero Background", createdAt: now },
            { id: generateId("log"), module: "Export", action: "Ready", detail: "SVG export is available", createdAt: now }
        ];
        saveWorkspace(workspace);
        return workspace;
    }

    function makeElement(type, name, x, y, width, height, patch) {
        const now = new Date().toISOString();
        return {
            id: generateId("element"),
            type,
            name,
            x,
            y,
            width,
            height,
            rotation: 0,
            fill: "var(--primary)",
            stroke: "var(--text)",
            strokeWidth: 2,
            opacity: 1,
            text: "",
            fontSize: 24,
            visible: true,
            locked: false,
            createdAt: now,
            updatedAt: now,
            ...(patch || {})
        };
    }

    function addActivityLog(module, action, detail) {
        const workspace = loadWorkspace();
        workspace.activityLog.unshift({ id: generateId("log"), module, action, detail, createdAt: new Date().toISOString() });
        workspace.activityLog = workspace.activityLog.slice(0, 40);
        saveWorkspace(workspace);
    }

    function applyThemeSettings(workspace) {
        workspace = workspace || loadWorkspace();
        const theme = workspace.theme;
        const root = document.documentElement;
        root.style.setProperty("--bg", theme.bg);
        root.style.setProperty("--bg-soft", theme.bgSoft);
        root.style.setProperty("--card", theme.card);
        root.style.setProperty("--text", theme.text);
        root.style.setProperty("--muted", theme.muted);
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--secondary", theme.secondary);
        root.style.setProperty("--success", theme.success);
        root.style.setProperty("--warning", theme.warning);
        root.style.setProperty("--danger", theme.danger);
        root.style.setProperty("--radius", `${theme.radius}px`);
        root.style.setProperty("--font-family", theme.fontFamily);
        root.style.setProperty("--transition-speed", `${workspace.settings.transitionSpeedMs}ms`);
        root.style.setProperty("--grid-size", `${workspace.settings.canvasGridSize}px`);
        document.body.dataset.compactSidebar = String(workspace.settings.compactSidebar);
    }

    function renderSidebar(activePage) {
        const holder = document.querySelector("[data-sidebar]");
        if (!holder) return;
        const navHtml = navItems.map(item => `
      <a class="nav-link ${item.page === activePage ? "active" : ""}" href="${item.href}" data-page="${item.page}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-text">${escapeHtml(item.label)}</span>
      </a>
    `).join("");

        holder.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">FL</div>
          <div class="brand-copy">
            <p class="brand-title">Figma Lite</p>
            <p class="brand-subtitle">Design Canvas</p>
          </div>
        </div>
        <nav class="sidebar-nav">${navHtml}</nav>
      </aside>
    `;
        setActiveNav();
    }

    function setActiveNav() {
        const path = location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === path || (path === "" && href === "index.html"));
        });
    }

    function showStatus(message, type) {
        let toast = document.querySelector(".status-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "status-toast";
            document.body.appendChild(toast);
        }
        toast.className = `status-toast ${type || "success"} show`;
        toast.textContent = message;
        setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function renderEmptyState(message) {
        return `<div class="empty-state"><div>${escapeHtml(message)}</div></div>`;
    }

    function downloadJson(filename, data) {
        downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json");
    }

    function downloadTextFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType || "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function copyText(text, message) {
        navigator.clipboard.writeText(text).then(() => showStatus(message || "Copied to clipboard", "success"));
    }

    function ensureTransitionOverlay() {
        let overlay = document.querySelector(".transition-overlay");
        if (overlay) return overlay;
        overlay = document.createElement("div");
        overlay.className = "transition-overlay";
        overlay.innerHTML = `<div class="transition-loader"><div class="loader-ring"></div><div class="loader-text">Loading workspace...</div></div>`;
        document.body.appendChild(overlay);
        return overlay;
    }

    function initPageTransitions() {
        const workspace = loadWorkspace();
        const overlay = ensureTransitionOverlay();
        setTimeout(() => hideTransitionOverlay(), 80);

        document.addEventListener("click", event => {
            const link = event.target.closest("a[href]");
            if (!link) return;
            const href = link.getAttribute("href");
            if (!href || href.startsWith("http") || href.startsWith("#") || link.target === "_blank") return;
            event.preventDefault();
            navigateWithTransition(href);
        });

        overlay.style.transitionDuration = `${workspace.settings.transitionSpeedMs}ms`;
    }

    function showTransitionOverlay(withLoader) {
        const workspace = loadWorkspace();
        const overlay = ensureTransitionOverlay();
        overlay.classList.remove("hidden", "show-loader");
        if (withLoader) overlay.classList.add("show-loader");
        setTimeout(() => overlay.classList.add("show-loader"), workspace.settings.loaderDelayMs);
    }

    function hideTransitionOverlay() {
        const overlay = ensureTransitionOverlay();
        overlay.classList.add("hidden");
    }

    function navigateWithTransition(url) {
        const workspace = loadWorkspace();
        showTransitionOverlay(false);
        setTimeout(() => { window.location.href = url; }, workspace.settings.transitionSpeedMs);
    }

    function getElementById(workspace, id) {
        return workspace.design.elements.find(element => element.id === id);
    }

    function updateElement(workspace, id, patch) {
        const element = getElementById(workspace, id);
        if (!element || element.locked) return workspace;
        Object.assign(element, patch, { updatedAt: new Date().toISOString() });
        return saveWorkspace(workspace);
    }

    function deleteElement(workspace, id) {
        workspace.design.elements = workspace.design.elements.filter(element => element.id !== id);
        if (workspace.design.selectedElementId === id) workspace.design.selectedElementId = "";
        return saveWorkspace(workspace);
    }

    function reorderElements(workspace, fromIndex, toIndex) {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= workspace.design.elements.length || toIndex >= workspace.design.elements.length) return workspace;
        const [item] = workspace.design.elements.splice(fromIndex, 1);
        workspace.design.elements.splice(toIndex, 0, item);
        return saveWorkspace(workspace);
    }

    function calculateDesignBounds(elements) {
        const visible = elements.filter(element => element.visible !== false);
        if (!visible.length) return { x: 0, y: 0, width: 800, height: 600 };
        const minX = Math.min(...visible.map(element => element.x));
        const minY = Math.min(...visible.map(element => element.y));
        const maxX = Math.max(...visible.map(element => element.x + element.width));
        const maxY = Math.max(...visible.map(element => element.y + element.height));
        return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
    }

    function resolveCssValue(value) {
        if (!String(value).startsWith("var(")) return value;
        const name = String(value).replace("var(", "").replace(")", "").trim();
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || value;
    }

    function generateSvgFromDesign(design, onlyElementId) {
        const elements = design.elements.filter(element => element.visible !== false && (!onlyElementId || element.id === onlyElementId));
        const bounds = calculateDesignBounds(elements);
        const padding = 40;
        const width = Math.ceil(bounds.width + padding * 2);
        const height = Math.ceil(bounds.height + padding * 2);
        const offsetX = padding - bounds.x;
        const offsetY = padding - bounds.y;

        const svgElements = elements.map(element => {
            const x = element.x + offsetX;
            const y = element.y + offsetY;
            const fill = resolveCssValue(element.fill);
            const stroke = resolveCssValue(element.stroke);
            const opacity = element.opacity ?? 1;
            const strokeWidth = element.strokeWidth ?? 0;
            if (element.type === "circle") {
                return `<ellipse cx="${x + element.width / 2}" cy="${y + element.height / 2}" rx="${element.width / 2}" ry="${element.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
            }
            if (element.type === "line") {
                return `<line x1="${x}" y1="${y}" x2="${x + element.width}" y2="${y + element.height}" stroke="${stroke}" stroke-width="${strokeWidth || 2}" opacity="${opacity}" />`;
            }
            if (element.type === "text") {
                return `<text x="${x}" y="${y + element.fontSize}" fill="${fill}" font-size="${element.fontSize}" font-family="Inter, Arial, sans-serif" opacity="${opacity}">${escapeHtml(element.text || element.name)}</text>`;
            }
            return `<rect x="${x}" y="${y}" width="${element.width}" height="${element.height}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;
        }).join("\n  ");

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  ${svgElements}\n</svg>`;
    }

    function snapValue(value, gridSize, snapDistance) {
        const target = Math.round(value / gridSize) * gridSize;
        return Math.abs(target - value) <= snapDistance ? target : value;
    }

    window.FigmaLite = {
        storageKey,
        defaultWorkspace,
        navItems,
        escapeHtml,
        generateId,
        formatTimestamp,
        loadWorkspace,
        saveWorkspace,
        resetWorkspace,
        seedDemoData,
        makeElement,
        addActivityLog,
        applyThemeSettings,
        renderSidebar,
        setActiveNav,
        showStatus,
        renderEmptyState,
        downloadJson,
        downloadTextFile,
        copyText,
        initPageTransitions,
        showTransitionOverlay,
        hideTransitionOverlay,
        navigateWithTransition,
        getElementById,
        updateElement,
        deleteElement,
        reorderElements,
        generateSvgFromDesign,
        calculateDesignBounds,
        snapValue
    };

    document.addEventListener("DOMContentLoaded", () => {
        applyThemeSettings(loadWorkspace());
        initPageTransitions();
    });
})();
