# Figma Lite

A browser-based collaborative-style design canvas for creating shapes,
text layers, managing layers, using snap guides, zooming, panning,
and exporting SVG designs.

## Live Links

- GitHub Repository: [fazal305/figma-lite](https://github.com/fazal305/figma-lite)
- Live Demo: [https://fazal305.github.io/figma-lite/](https://fazal305.github.io/figma-lite/)

## Overview

Figma Lite is not a Figma clone. It is a portfolio-ready frontend application that demonstrates canvas-style interactions, multi-page frontend architecture, dynamic theming, localStorage state management, and SVG export workflows.

## Pages

- Dashboard
- Canvas Editor
- Layers
- Assets
- Export
- Settings

## Features

- Multi-page browser application
- Shared sidebar navigation
- Smooth page transitions with loader fallback
- Dynamic theme system using CSS custom properties
- localStorage workspace persistence
- Create rectangles, circles, lines, and text
- Select, move, resize, and delete elements
- Grid and snap settings
- Zoom and pan support
- Layers manager
- Asset presets
- SVG preview and download
- Workspace JSON import/export

## Technologies Used

- HTML5
- CSS3 dynamic custom properties
- Bootstrap 5
- jQuery
- Vanilla JavaScript
- SVG
- Pointer Events
- LocalStorage
- Blob API
- Clipboard API

## Learning Outcomes

- Building modular multi-page frontend applications
- Managing shared state without frameworks
- Rendering UI from data
- Creating canvas-style interactions
- Exporting browser state as SVG and JSON
- Designing themeable UI systems

## Architecture Notes

The application uses a no-build browser architecture. Each page has its own HTML, CSS, and JavaScript module. Shared helpers live in `js/shared.js`, while extended engine aliases live in `js/Eshared.js`. CSS is split into a global `styles.css` file plus page-specific files. The theme system writes workspace theme values into root CSS variables at runtime.

## Folder Structure

```text
figma-lite/
  index.html
  editor.html
  layers.html
  assets.html
  export.html
  settings.html
  styles.css
  css/
    dashboard.css
    editor.css
    layers.css
    assets.css
    export.css
    settings.css
  js/
    shared.js
    Eshared.js
    dashboard.js
    editor.js
    layers.js
    assets.js
    export.js
    settings.js
  README.md
  LICENSE
  .gitignore
```

## How To Run Locally

```powershell
git clone https://github.com/fazal305/figma-lite.git
cd figma-lite
start index.html
```

## How To Use

1. Open `index.html`.
2. Go to Editor.
3. Select a tool and click the canvas.
4. Move elements by dragging them.
5. Edit selected layer properties from the panel.
6. Manage layers from the Layers page.
7. Add presets from Assets.
8. Export SVG or JSON from Export.
9. Customize theme and settings from Settings.

## Sample Workflow

Open editor, add shapes, add text, move and resize elements, manage layers, use snap/grid, then export SVG.

## Agentic Engineering Process

This project was built with a specification-first workflow, planned file groups, verification loops, sandboxing and isolation, quality gates, and an iterative feedback process.

## Future Improvements

- Multi-page design files
- Real-time collaboration with backend
- Comments
- Component system
- Boolean operations
- Pen tool
- Image upload
- Keyboard shortcuts
- Undo/redo history

## License

MIT License
