$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("settings");
    app.applyThemeSettings();
    renderThemeCustomizer();

    $(document).on("input change", "[data-theme-token]", function () { updateThemeToken($(this).data("theme-token"), $(this).val()); });
    $(document).on("input change", "[data-setting]", function () { saveCanvasSettings(); });
    $(document).on("click", "#resetTheme", resetThemeToDefault);
    $(document).on("click", "#resetDemo", resetDemoWorkspace);
    $(document).on("click", "#clearWorkspace", clearWorkspace);
});

function renderThemeCustomizer() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const theme = workspace.theme;
    const settings = workspace.settings;
    const colorTokens = ["bg", "bgSoft", "text", "muted", "primary", "secondary", "success", "warning", "danger"];

    const colorControls = colorTokens.map(token => `
    <div class="setting-control">
      <label>${token}</label>
      <div class="color-control">
        <input type="color" data-theme-token="${token}" value="${normalizeColor(theme[token])}">
        <input class="form-control" data-theme-token="${token}" value="${theme[token]}">
      </div>
    </div>
  `).join("");

    $("#themeCustomizer").html(`
    <div class="settings-grid">${colorControls}</div>
    <div class="settings-grid mt-3">
      <div class="setting-control"><label>Card Background</label><input class="form-control" data-theme-token="card" value="${theme.card}"></div>
      <div class="setting-control"><label>Font Family</label><input class="form-control" data-theme-token="fontFamily" value="${theme.fontFamily}"></div>
      <div class="setting-control"><label>Border Radius</label><input type="range" min="4" max="34" class="form-range" data-theme-token="radius" value="${theme.radius}"><span class="range-value">${theme.radius}px</span></div>
    </div>
  `);

    $("#canvasSettings").html(`
    <div class="settings-grid">
      ${rangeControl("canvasGridSize", "Canvas Grid Size", settings.canvasGridSize, 8, 80, 1, "px")}
      ${rangeControl("snapDistance", "Snap Distance", settings.snapDistance, 0, 40, 1, "px")}
      ${rangeControl("zoomStep", "Zoom Step", settings.zoomStep, 0.05, 0.5, 0.05, "")}
      ${rangeControl("transitionSpeedMs", "Transition Speed", settings.transitionSpeedMs, 100, 900, 20, "ms")}
      ${rangeControl("loaderDelayMs", "Loader Delay", settings.loaderDelayMs, 0, 800, 20, "ms")}
      <div class="setting-control"><label>Compact Sidebar</label><select class="form-select" data-setting="compactSidebar"><option value="false" ${!settings.compactSidebar ? "selected" : ""}>No</option><option value="true" ${settings.compactSidebar ? "selected" : ""}>Yes</option></select></div>
    </div>
  `);

    $("#themePreview").html(`
    <div class="theme-preview">
      <div class="theme-preview-card">
        <div class="theme-preview-title">Live Theme Preview</div>
        <p class="theme-preview-text mb-3">Settings update CSS variables and persist to localStorage.</p>
        <button class="btn-app">Primary Action</button>
      </div>
    </div>
  `);
}

function rangeControl(field, label, value, min, max, step, suffix) {
    return `<div class="setting-control"><label>${label}</label><input type="range" min="${min}" max="${max}" step="${step}" class="form-range" data-setting="${field}" value="${value}"><span class="range-value">${value}${suffix}</span></div>`;
}

function normalizeColor(value) {
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    return "#111827";
}

function updateThemeToken(name, value) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.theme[name] = name === "radius" ? Number(value) : value;
    app.saveWorkspace(workspace);
    app.applyThemeSettings(workspace);
    renderThemeCustomizer();
}

function resetThemeToDefault() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.theme = { ...app.defaultWorkspace.theme };
    app.saveWorkspace(workspace);
    app.showStatus("Theme reset", "success");
    renderThemeCustomizer();
}

function saveCanvasSettings() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    $("[data-setting]").each(function () {
        const field = $(this).data("setting");
        const raw = $(this).val();
        workspace.settings[field] = raw === "true" ? true : raw === "false" ? false : Number(raw);
    });
    app.saveWorkspace(workspace);
    app.applyThemeSettings(workspace);
    renderThemeCustomizer();
}

function setTransitionSpeed(ms) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.settings.transitionSpeedMs = Number(ms);
    app.saveWorkspace(workspace);
}

function setLoaderDelay(ms) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.settings.loaderDelayMs = Number(ms);
    app.saveWorkspace(workspace);
}

function resetDemoWorkspace() {
    const app = window.FigmaLite;
    app.seedDemoData();
    app.showStatus("Demo workspace restored", "success");
    renderThemeCustomizer();
}

function clearWorkspace() {
    const app = window.FigmaLite;
    localStorage.removeItem(app.storageKey);
    app.showStatus("Workspace cleared. Demo data will seed on reload.", "warning");
}
