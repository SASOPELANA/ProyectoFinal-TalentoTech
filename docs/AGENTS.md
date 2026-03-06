# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working on this codebase.

## Project Overview

- **Type**: Static e-commerce website for smartphones
- **Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Framework**: None (Bootstrap 5.3.3 used only on contact page via CDN)
- **Language**: Code comments and UI text are in **Spanish**
- **Live URL**: <https://proyecto-final-talento-tech-rose.vercel.app/>
- **Repository**: <https://github.com/SASOPELANA/ProyectoFinal-TalentoTech>

## Build/Development Commands

### Local Development

This is a static website with no build process. To run locally:

```bash
# Option 1: Using live-server (recommended)
npm install -g live-server
live-server

# Option 2: Using Python
python3 -m http.server 8000

# Option 3: Open index.html directly in browser
```

### Build Commands

No build step required - this is a static site.

### Deployment

- **Platform**: Vercel (automatic deployment from GitHub)
- **Trigger**: Push to main branch deploys automatically

## Testing

**No test framework is configured.** This project does not have automated tests.

When making changes:

1. Test manually in browser
2. Verify cart functionality (add/remove items, localStorage persistence)
3. Check responsive design at 768px and 480px breakpoints
4. Test all page navigation links

## Linting/Formatting

**No linting tools configured.** Follow the code style patterns below manually.

## Directory Structure

```
/
├── index.html              # Main store page (entry point)
├── carrito.html            # Shopping cart page
├── app.js                  # Main store JavaScript
├── carrito.js              # Cart page JavaScript
├── style.css               # Main styles
├── css/                    # Additional stylesheets
│   ├── carrito.css         # Cart page styles
│   ├── contacto.css        # Contact page styles
│   └── productos.css       # Product detail styles
├── html/                   # Additional HTML pages
│   ├── contacto.html       # Contact form (uses Bootstrap)
│   └── producto[1-5].html  # Product detail pages
├── iconos/                 # Icon images (.png)
├── imagenes/               # Product/background images
├── ColoresAleatorios/      # Mini-app: random colors
└── Input-Color-RGBA/       # Mini-app: RGB color picker
```

## Code Style Guidelines

### JavaScript

**Variables and Functions**

- Use `const` for constants, `let` for variables (never `var`)
- camelCase for variable and function names
- Names may be in Spanish: `agregarAlCarrito`, `actualizarContador`

```javascript
// Function declarations - use arrow functions for handlers
const agregarAlCarrito = (nombre, precio) => {
    // Implementation
};

// Traditional functions for utilities
function generarColorHexAleatorio() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}
```

**DOM Manipulation**

- Use `document.getElementById()` for IDs
- Use `document.querySelector()` / `querySelectorAll()` for CSS selectors
- Prefer `addEventListener()` over inline event handlers

```javascript
const boton = document.getElementById('btn-agregar');
boton.addEventListener('click', () => {
    // Handler code
});
```

**Data Storage**

- Use `localStorage` for cart persistence
- Store as JSON strings: `localStorage.setItem('carrito', JSON.stringify(carrito))`
- Parse on read: `JSON.parse(localStorage.getItem('carrito')) || []`

**Comments**

- Write comments in Spanish to match existing code
- Use `//` for single-line comments

### CSS

**Naming Conventions**

- kebab-case for class and ID names: `icono-carrito`, `lista-carrito`
- Descriptive Spanish names preferred: `resumen-carrito`, `total-productos`

**Reset and Box Model**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

**Layout**

- Use CSS Grid for page layouts
- Use Flexbox for component alignment
- Mobile-first responsive design

**Responsive Breakpoints**

```css
/* Tablet */
@media (max-width: 768px) { }

/* Mobile */
@media (max-width: 480px) { }
```

**Colors**

- Hex for simple colors: `#333`, `#f0f0f0`
- RGB for opacity needs: `rgb(140, 140, 145)`
- Named colors acceptable: `crimson`, `white`

### HTML

**Document Structure**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <link rel="stylesheet" href="path/to/styles.css">
</head>
<body>
    <!-- Semantic structure -->
    <header>...</header>
    <nav>...</nav>
    <main>...</main>
    <footer>...</footer>
    
    <!-- Scripts at end of body -->
    <script src="path/to/script.js"></script>
</body>
</html>
```

**Semantic Elements**

- Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Use `<button>` for clickable actions, `<a>` for navigation

**External Resources**

- Google Fonts via CDN link
- Bootstrap via CDN (contact page only)
- Local images in `imagenes/` and `iconos/`

### Error Handling

- No formal error handling framework
- Use console.log/console.error for debugging
- Validate localStorage data exists before parsing

```javascript
const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
```

### Naming Conventions Summary

| Element | Convention | Example |
|---------|------------|---------|
| JS variables | camelCase (Spanish) | `precioTotal`, `listaProductos` |
| JS functions | camelCase (Spanish) | `agregarAlCarrito()` |
| CSS classes | kebab-case | `icono-carrito` |
| CSS IDs | kebab-case | `contador-carrito` |
| Files | kebab-case or camelCase | `carrito.js`, `productos.css` |
| Images | kebab-case or descriptive | `tcl-50pro-blue.webp` |

## Important Notes for Agents

1. **No Build Step**: Changes are immediately reflected - just refresh browser
2. **Spanish Language**: All user-facing text and comments are in Spanish
3. **localStorage**: Cart data persists via localStorage - test across pages
4. **Responsive**: Always verify changes at desktop, tablet (768px), mobile (480px)
5. **No Dependencies**: Avoid adding npm packages - keep it static
6. **Bootstrap Scope**: Bootstrap is ONLY used on `html/contacto.html`
7. **Image Formats**: Prefer `.webp` or `.avif` for new images
8. **Cross-browser**: Test in Chrome, Firefox, and Safari if possible

## Common Tasks

**Add a new product page:**

1. Copy `html/producto1.html` as template
2. Update product info, images, prices
3. Link from `index.html` product grid
4. Add product image to `imagenes/`

**Modify cart behavior:**

- Main logic in `app.js` (adding items)
- Cart page logic in `carrito.js` (display, remove, totals)
- Styles in `css/carrito.css`

**Update styling:**

- Global styles: `style.css`
- Page-specific: files in `css/` directory
