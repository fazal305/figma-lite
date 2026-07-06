$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("assets");
    app.applyThemeSettings();
    loadDefaultAssets();
    renderAssets();

    $(document).on("click", "#createAssetPreset", createAssetPreset);
    $(document).on("click", "[data-delete-asset]", function () { deleteAssetPreset($(this).data("delete-asset")); });
    $(document).on("click", "[data-insert-asset]", function () { insertAssetIntoDesign($(this).data("insert-asset")); });
});

function renderAssets() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const html = workspace.assets.map(asset => `
    <div class="asset-card">
      <div class="asset-preview"><div class="asset-preview-shape ${asset.type === "circle" ? "circle" : ""}">${asset.type === "text" ? "T" : ""}</div></div>
      <h3 class="asset-title">${app.escapeHtml(asset.name)}</h3>
      <p class="asset-meta">${app.escapeHtml(asset.type)} • ${app.formatTimestamp(asset.createdAt)}</p>
      <div class="d-flex gap-2 mt-3">
        <button class="btn-app flex-fill" data-insert-asset="${asset.id}">Insert</button>
        <button class="btn-ghost" data-delete-asset="${asset.id}">Delete</button>
      </div>
    </div>
  `).join("");

    $("#assetGrid").html(html || app.renderEmptyState("No assets saved yet."));
    renderThemeTokens(workspace);
}

function renderThemeTokens(workspace) {
    const app = window.FigmaLite;
    const tokenNames = ["primary", "secondary", "success", "warning", "danger", "text", "muted"];
    const html = tokenNames.map(name => `
    <div class="token-chip">
      <span class="token-dot" style="--token-color:${workspace.theme[name]}"></span>
      <span>${app.escapeHtml(name)}</span>
    </div>
  `).join("");
    $("#themeTokens").html(html);
}

function createAssetPreset() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const selected = app.getElementById(workspace, workspace.design.selectedElementId);
    const asset = selected
        ? { id: app.generateId("asset"), name: `${selected.name} Preset`, type: selected.type, config: { ...selected }, createdAt: new Date().toISOString() }
        : { id: app.generateId("asset"), name: "New Rectangle Preset", type: "rectangle", config: { width: 180, height: 100, fill: "var(--primary)", stroke: "var(--text)" }, createdAt: new Date().toISOString() };
    delete asset.config.id;
    workspace.assets.push(asset);
    app.saveWorkspace(workspace);
    app.addActivityLog("Assets", "Created preset", asset.name);
    renderAssets();
}

function deleteAssetPreset(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.assets = workspace.assets.filter(asset => asset.id !== id);
    app.saveWorkspace(workspace);
    renderAssets();
}

function insertAssetIntoDesign(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const asset = workspace.assets.find(item => item.id === id);
    if (!asset) return;
    const element = app.makeElement(asset.type, asset.name, 140, 140, asset.config.width || 160, asset.config.height || 100, asset.config);
    element.id = app.generateId("element");
    element.name = `${asset.name} Copy`;
    workspace.design.elements.push(element);
    workspace.design.selectedElementId = element.id;
    app.saveWorkspace(workspace);
    app.addActivityLog("Assets", "Inserted preset", asset.name);
    app.showStatus("Asset inserted into canvas", "success");
}

function loadDefaultAssets() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    if (workspace.assets.length) return;
    app.seedDemoData();
}
