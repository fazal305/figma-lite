$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("layers");
    app.applyThemeSettings();
    renderLayers();

    $(document).on("change", ".layer-name", function () { renameLayer($(this).data("id"), $(this).val()); });
    $(document).on("click", "[data-layer-select]", function () { selectLayer($(this).data("layer-select")); });
    $(document).on("click", "[data-layer-visible]", function () { toggleLayerVisibility($(this).data("layer-visible")); });
    $(document).on("click", "[data-layer-lock]", function () { toggleLayerLock($(this).data("layer-lock")); });
    $(document).on("click", "[data-layer-delete]", function () { deleteLayer($(this).data("layer-delete")); });
    $(document).on("click", "[data-layer-up]", function () { moveLayerUp($(this).data("layer-up")); });
    $(document).on("click", "[data-layer-down]", function () { moveLayerDown($(this).data("layer-down")); });
});

function renderLayers() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const elements = workspace.design.elements;
    if (!elements.length) {
        $("#layersList").html(app.renderEmptyState("No layers yet. Add elements in the editor."));
        return;
    }

    const html = elements.map((element, index) => `
    <div class="layer-item ${workspace.design.selectedElementId === element.id ? "active" : ""}">
      <button class="layer-icon" data-layer-select="${element.id}">${getLayerIcon(element.type)}</button>
      <div>
        <input class="layer-name" data-id="${element.id}" value="${app.escapeHtml(element.name)}">
        <div class="layer-meta">${app.escapeHtml(element.type)} • ${Math.round(element.width)}×${Math.round(element.height)}</div>
        <div class="layer-state">${element.visible ? "Visible" : "Hidden"} • ${element.locked ? "Locked" : "Editable"}</div>
      </div>
      <div class="layer-actions">
        <button class="layer-action-btn" data-layer-up="${element.id}">↑</button>
        <button class="layer-action-btn" data-layer-down="${element.id}">↓</button>
        <button class="layer-action-btn" data-layer-visible="${element.id}">${element.visible ? "Hide" : "Show"}</button>
        <button class="layer-action-btn" data-layer-lock="${element.id}">${element.locked ? "Unlock" : "Lock"}</button>
        <button class="layer-action-btn" data-layer-delete="${element.id}">Delete</button>
      </div>
    </div>
  `).join("");

    $("#layersList").html(html);
    $("#layerSummary").html(`
    <div class="glass-card section-card">
      <h3 class="card-title">Layer Summary</h3>
      <p class="card-text">Total layers: ${elements.length}</p>
      <p class="card-text">Visible layers: ${elements.filter(e => e.visible).length}</p>
      <p class="card-text">Locked layers: ${elements.filter(e => e.locked).length}</p>
    </div>
  `);
}

function getLayerIcon(type) {
    return { rectangle: "▭", circle: "○", line: "─", text: "T" }[type] || "□";
}

function renameLayer(id, name) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    app.updateElement(workspace, id, { name: name || "Untitled Layer" });
    app.addActivityLog("Layers", "Renamed layer", name || "Untitled Layer");
    renderLayers();
}

function toggleLayerVisibility(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, id);
    if (!el) return;
    el.visible = !el.visible;
    app.saveWorkspace(workspace);
    renderLayers();
}

function toggleLayerLock(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, id);
    if (!el) return;
    el.locked = !el.locked;
    app.saveWorkspace(workspace);
    renderLayers();
}

function deleteLayer(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    app.deleteElement(workspace, id);
    app.addActivityLog("Layers", "Deleted layer", "Deleted a layer from the layers page");
    renderLayers();
}

function moveLayerUp(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const index = workspace.design.elements.findIndex(el => el.id === id);
    app.reorderElements(workspace, index, index - 1);
    renderLayers();
}

function moveLayerDown(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const index = workspace.design.elements.findIndex(el => el.id === id);
    app.reorderElements(workspace, index, index + 1);
    renderLayers();
}

function selectLayer(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.design.selectedElementId = id;
    app.saveWorkspace(workspace);
    renderLayers();
    app.showStatus("Layer selected. Open editor to edit it.", "success");
}
