$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("export");
    app.applyThemeSettings();
    renderSvgPreview();

    $(document).on("click", "#copySvg", copySvgCode);
    $(document).on("click", "#downloadSvg", downloadSvg);
    $(document).on("click", "#downloadJson", downloadWorkspaceJson);
    $(document).on("change", "#importJson", importWorkspaceJson);
    $(document).on("click", "#exportSelected", exportSelectedLayerSvg);
});

function renderSvgPreview() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const svg = app.generateSvgFromDesign(workspace.design);
    const bounds = app.calculateDesignBounds(workspace.design.elements);
    $("#svgPreview").html(svg);
    $("#svgCode").val(svg);
    $("#exportInfo").html(`
    <div class="export-info-card"><div class="export-info-value">${Math.round(bounds.width)}</div><div class="export-info-label">Width</div></div>
    <div class="export-info-card"><div class="export-info-value">${Math.round(bounds.height)}</div><div class="export-info-label">Height</div></div>
    <div class="export-info-card"><div class="export-info-value">${workspace.design.elements.length}</div><div class="export-info-label">Layers</div></div>
    <div class="export-info-card"><div class="export-info-value">SVG</div><div class="export-info-label">Format</div></div>
  `);
}

function copySvgCode() {
    window.FigmaLite.copyText($("#svgCode").val(), "SVG code copied");
}

function downloadSvg() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    app.downloadTextFile(`${workspace.design.name.replace(/\s+/g, "-").toLowerCase()}.svg`, app.generateSvgFromDesign(workspace.design), "image/svg+xml");
    app.addActivityLog("Export", "Downloaded SVG", workspace.design.name);
}

function downloadWorkspaceJson() {
    const app = window.FigmaLite;
    app.downloadJson("figma-lite-workspace.json", app.loadWorkspace());
}

function importWorkspaceJson(event) {
    const app = window.FigmaLite;
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const workspace = JSON.parse(reader.result);
            app.saveWorkspace(workspace);
            app.applyThemeSettings(workspace);
            app.showStatus("Workspace imported", "success");
            renderSvgPreview();
        } catch (error) {
            app.showStatus("Invalid JSON file", "danger");
        }
    };
    reader.readAsText(file);
}

function exportSelectedLayerSvg() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const id = workspace.design.selectedElementId;
    if (!id) return app.showStatus("No selected layer to export", "warning");
    const svg = app.generateSvgFromDesign(workspace.design, id);
    app.downloadTextFile("selected-layer.svg", svg, "image/svg+xml");
}
