$(function () {
    const app = window.FigmaLite;
    app.renderSidebar("dashboard");
    app.applyThemeSettings();

    renderDashboardStats();
    renderRecentDesigns();
    renderRecentActivityLog();

    $(document).on("click", "[data-load-sample]", loadSampleDesign);
});

function renderDashboardStats() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const elements = workspace.design.elements;
    const html = [
        { label: "Design Elements", value: elements.length },
        { label: "Assets", value: workspace.assets.length },
        { label: "Activities", value: workspace.activityLog.length }
    ].map(stat => `
    <div class="glass-card stat-card">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${app.escapeHtml(stat.label)}</div>
    </div>
  `).join("");

    $("#dashboardStats").html(html);
}

function renderRecentDesigns() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    const design = workspace.design;
    const html = `
    <div class="glass-card action-card" data-open-editor>
      <span class="badge-soft">Current File</span>
      <h3 class="card-title mt-3">${app.escapeHtml(design.name)}</h3>
      <p class="card-text mb-3">${design.elements.length} layers saved locally. Zoom ${Math.round(design.viewport.zoom * 100)}%.</p>
      <a class="btn-app d-inline-flex" href="editor.html">Open Editor</a>
    </div>
  `;
    $("#recentDesigns").html(html);
}

function renderRecentActivityLog() {
    const app = window.FigmaLite;
    const workspace = app.loadWorkspace();
    if (!workspace.activityLog.length) {
        $("#recentActivity").html(app.renderEmptyState("No recent activity yet."));
        return;
    }

    const html = workspace.activityLog.slice(0, 7).map(log => `
    <div class="activity-item">
      <strong>${app.escapeHtml(log.action)}</strong>
      <div class="activity-meta">${app.escapeHtml(log.module)} • ${app.formatTimestamp(log.createdAt)}</div>
      <div class="card-text">${app.escapeHtml(log.detail)}</div>
    </div>
  `).join("");
    $("#recentActivity").html(html);
}

function loadSampleDesign() {
    const app = window.FigmaLite;
    app.seedDemoData();
    app.showStatus("Sample design loaded", "success");
    renderDashboardStats();
    renderRecentDesigns();
    renderRecentActivityLog();
}
