let currentTool = "select";
let dragState = null;
let resizeState = null;

$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("editor");
    app.applyThemeSettings();
    renderCanvas();
    renderPropertiesPanel();

    $(document).on("click", "[data-tool]", function () { setActiveTool($(this).data("tool")); });
    $(document).on("click", "#zoomIn", () => zoomCanvas(1));
    $(document).on("click", "#zoomOut", () => zoomCanvas(-1));
    $(document).on("click", "#toggleGrid", toggleGrid);
    $(document).on("click", "#saveDesign", saveDesignState);
    $(document).on("click", "#deleteSelected", deleteSelectedElement);
    $(document).on("input change", "[data-property]", function () { updateSelectedElementProperty($(this).data("property"), $(this).val()); });

    $(document).on("pointerdown", "#canvasWrap", onCanvasPointerDown);
    $(document).on("pointerdown", ".design-element", onElementPointerDown);
    $(document).on("pointerdown", ".resize-handle", onResizePointerDown);
    $(document).on("pointermove", onPointerMove);
    $(document).on("pointerup pointercancel", onPointerUp);
    $(document).on("keydown", onEditorKeyDown);
});

function renderCanvas() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const design = workspace.design;
    const gridClass = workspace.settings.showGrid ? "canvas-grid" : "";
    const transform = `translate(${design.viewport.panX}px, ${design.viewport.panY}px) scale(${design.viewport.zoom})`;

    const elementsHtml = design.elements.filter(el => el.visible !== false).map(el => renderCanvasElement(el, design.selectedElementId)).join("");

    $("#canvasWrap").html(`
    <div class="editor-topbar">
      <div class="zoom-pill">Zoom: <strong>${Math.round(design.viewport.zoom * 100)}%</strong></div>
      <div class="d-flex gap-2">
        <button class="btn-ghost" id="zoomOut">−</button>
        <button class="btn-ghost" id="zoomIn">+</button>
        <button class="btn-ghost" id="toggleGrid">Grid</button>
        <button class="btn-app" id="saveDesign">Save</button>
      </div>
    </div>
    <div id="canvasSurface" class="canvas-surface ${gridClass}" style="transform:${transform}">${elementsHtml}</div>
    <div id="snapGuides"></div>
  `);
}

function renderCanvasElement(el, selectedId) {
    const app = window.FigmaLite;
    const baseStyle = `left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;opacity:${el.opacity};`;
    const selected = selectedId === el.id ? "selected" : "";
    const locked = el.locked ? "locked" : "";
    const handles = selected && !el.locked ? `<span class="resize-handle" data-id="${el.id}"></span>` : "";

    if (el.type === "circle") {
        return `<div class="design-element ${selected} ${locked}" data-id="${el.id}" style="${baseStyle}border-radius:50%;background:${el.fill};border:${el.strokeWidth}px solid ${el.stroke};">${handles}</div>`;
    }
    if (el.type === "line") {
        return `<div class="design-element ${selected} ${locked}" data-id="${el.id}" style="${baseStyle}height:${Math.max(2, el.strokeWidth)}px;background:${el.stroke};transform:rotate(${el.rotation || 0}deg);">${handles}</div>`;
    }
    if (el.type === "text") {
        return `<div class="design-element ${selected} ${locked}" data-id="${el.id}" style="${baseStyle}color:${el.fill};font-size:${el.fontSize}px;line-height:1.2;">${app.escapeHtml(el.text || el.name)}${handles}</div>`;
    }
    return `<div class="design-element ${selected} ${locked}" data-id="${el.id}" style="${baseStyle}background:${el.fill};border:${el.strokeWidth}px solid ${el.stroke};border-radius:12px;">${handles}</div>`;
}

function setActiveTool(tool) {
    currentTool = tool;
    $("[data-tool]").removeClass("active");
    $(`[data-tool="${tool}"]`).addClass("active");
}

function createElement(type, x, y) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const count = workspace.design.elements.filter(el => el.type === type).length + 1;
    const element = app.makeElement(type, `${type.charAt(0).toUpperCase() + type.slice(1)} ${count}`, x, y, type === "line" ? 180 : 160, type === "line" ? 2 : 110, {});
    if (type === "circle") element.height = element.width;
    if (type === "text") Object.assign(element, { text: "Double click to edit", width: 240, height: 42, strokeWidth: 0, fill: "var(--text)" });
    workspace.design.elements.push(element);
    workspace.design.selectedElementId = element.id;
    app.saveWorkspace(workspace);
    app.addActivityLog("Editor", "Created element", `Created ${element.name}`);
    renderCanvas();
    renderPropertiesPanel();
}

function selectElement(id) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.design.selectedElementId = id;
    app.saveWorkspace(workspace);
    renderCanvas();
    renderPropertiesPanel();
}

function moveSelectedElement(dx, dy) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, workspace.design.selectedElementId);
    if (!el || el.locked) return;
    el.x += dx;
    el.y += dy;
    app.saveWorkspace(workspace);
    renderCanvas();
    renderPropertiesPanel();
}

function resizeSelectedElement(width, height) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, workspace.design.selectedElementId);
    if (!el || el.locked) return;
    el.width = Math.max(20, width);
    el.height = Math.max(20, height);
    app.saveWorkspace(workspace);
    renderCanvas();
    renderPropertiesPanel();
}

function deleteSelectedElement() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const id = workspace.design.selectedElementId;
    if (!id) return app.showStatus("No layer selected", "warning");
    app.deleteElement(workspace, id);
    app.addActivityLog("Editor", "Deleted element", "Deleted selected layer");
    renderCanvas();
    renderPropertiesPanel();
}

function renderPropertiesPanel() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, workspace.design.selectedElementId);
    if (!el) {
        $("#propertiesPanel").html(app.renderEmptyState("Select a layer to edit properties."));
        return;
    }

    $("#propertiesPanel").html(`
    <h3 class="card-title">${app.escapeHtml(el.name)}</h3>
    <p class="card-text">${app.escapeHtml(el.type)} layer</p>
    ${input("name", "Name", el.name)}
    ${numberInput("x", "X", el.x)}
    ${numberInput("y", "Y", el.y)}
    ${numberInput("width", "Width", el.width)}
    ${numberInput("height", "Height", el.height)}
    ${el.type === "text" ? input("text", "Text", el.text) + numberInput("fontSize", "Font Size", el.fontSize) : ""}
    ${input("fill", "Fill", el.fill)}
    ${input("stroke", "Stroke", el.stroke)}
    ${numberInput("strokeWidth", "Stroke Width", el.strokeWidth)}
    ${numberInput("opacity", "Opacity", el.opacity, "0", "1", "0.05")}
    <button class="btn-ghost w-100 mt-2" id="deleteSelected">Delete Selected</button>
  `);
}

function input(field, label, value) {
    return `<div class="property-group"><div class="property-label">${label}</div><input class="form-control" data-property="${field}" value="${String(value ?? "").replace(/"/g, "&quot;")}"></div>`;
}

function numberInput(field, label, value, min = "", max = "", step = "1") {
    return `<div class="property-group"><div class="property-label">${label}</div><input type="number" min="${min}" max="${max}" step="${step}" class="form-control" data-property="${field}" value="${value}"></div>`;
}

function updateSelectedElementProperty(field, value) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, workspace.design.selectedElementId);
    if (!el || el.locked) return;
    const numericFields = ["x", "y", "width", "height", "fontSize", "strokeWidth", "opacity"];
    el[field] = numericFields.includes(field) ? Number(value) : value;
    el.updatedAt = new Date().toISOString();
    app.saveWorkspace(workspace);
    renderCanvas();
}

function zoomCanvas(direction) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.design.viewport.zoom = Math.min(3, Math.max(0.25, workspace.design.viewport.zoom + direction * workspace.settings.zoomStep));
    app.saveWorkspace(workspace);
    renderCanvas();
}

function panCanvas(dx, dy) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.design.viewport.panX += dx;
    workspace.design.viewport.panY += dy;
    app.saveWorkspace(workspace);
    renderCanvas();
}

function toggleGrid() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    workspace.settings.showGrid = !workspace.settings.showGrid;
    app.saveWorkspace(workspace);
    renderCanvas();
}

function renderSnapGuides(element) {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const grid = workspace.settings.canvasGridSize;
    const snappedX = app.snapValue(element.x, grid, workspace.settings.snapDistance);
    const snappedY = app.snapValue(element.y, grid, workspace.settings.snapDistance);
    $("#snapGuides").html(`
    <div class="snap-guide vertical" style="left:${snappedX}px"></div>
    <div class="snap-guide horizontal" style="top:${snappedY}px"></div>
  `);
}

function saveDesignState() {
    window.FigmaLite.addActivityLog("Editor", "Saved design", "Workspace saved to localStorage");
    window.FigmaLite.showStatus("Design saved", "success");
}

function onCanvasPointerDown(event) {
    if (event.target.id !== "canvasWrap" && event.target.id !== "canvasSurface") return;
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const rect = document.getElementById("canvasWrap").getBoundingClientRect();
    const x = (event.clientX - rect.left - workspace.design.viewport.panX) / workspace.design.viewport.zoom;
    const y = (event.clientY - rect.top - workspace.design.viewport.panY) / workspace.design.viewport.zoom;
    if (["rectangle", "circle", "line", "text"].includes(currentTool)) createElement(currentTool, x, y);
    if (currentTool === "hand") dragState = { mode: "pan", startX: event.clientX, startY: event.clientY };
    if (currentTool === "select") selectElement("");
}

function onElementPointerDown(event) {
    event.stopPropagation();
    const id = $(this).data("id");
    selectElement(id);
    if (currentTool !== "select") return;
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, id);
    if (!el || el.locked) return;
    dragState = { mode: "move", id, startX: event.clientX, startY: event.clientY, originalX: el.x, originalY: el.y };
}

function onResizePointerDown(event) {
    event.stopPropagation();
    const id = $(this).data("id");
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const el = app.getElementById(workspace, id);
    if (!el || el.locked) return;
    resizeState = { id, startX: event.clientX, startY: event.clientY, width: el.width, height: el.height };
}

function onPointerMove(event) {
    const app = window.FigmaLite;
    if (dragState?.mode === "pan") return panCanvas(event.clientX - dragState.startX, event.clientY - dragState.startY);
    if (dragState?.mode === "move") {
        const workspace = app.loadWorkspace();
        const el = app.getElementById(workspace, dragState.id);
        if (!el) return;
        const zoom = workspace.design.viewport.zoom;
        const nextX = dragState.originalX + (event.clientX - dragState.startX) / zoom;
        const nextY = dragState.originalY + (event.clientY - dragState.startY) / zoom;
        el.x = app.snapValue(nextX, workspace.settings.canvasGridSize, workspace.settings.snapDistance);
        el.y = app.snapValue(nextY, workspace.settings.canvasGridSize, workspace.settings.snapDistance);
        app.saveWorkspace(workspace);
        renderCanvas();
        renderSnapGuides(el);
    }
    if (resizeState) {
        const workspace = app.loadWorkspace();
        const zoom = workspace.design.viewport.zoom;
        resizeSelectedElement(resizeState.width + (event.clientX - resizeState.startX) / zoom, resizeState.height + (event.clientY - resizeState.startY) / zoom);
    }
}

function onPointerUp() {
    dragState = null;
    resizeState = null;
    $("#snapGuides").empty();
}

function onEditorKeyDown(event) {
    if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    if (event.key === "Delete" || event.key === "Backspace") deleteSelectedElement();
    if (event.key === "ArrowLeft") moveSelectedElement(-4, 0);
    if (event.key === "ArrowRight") moveSelectedElement(4, 0);
    if (event.key === "ArrowUp") moveSelectedElement(0, -4);
    if (event.key === "ArrowDown") moveSelectedElement(0, 4);
}
