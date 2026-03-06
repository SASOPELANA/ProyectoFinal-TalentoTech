# AGENTS.md - Coding Agent Guidelines

Guidelines for AI coding agents working on this e-commerce codebase.

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Type** | E-commerce website for smartphones |
| **Stack** | HTML5, CSS3, Vanilla JavaScript (ES6+), Vite |
| **Language** | Spanish (UI text and code comments) |
| **Live URL** | <https://proyecto-final-talento-tech-rose.vercel.app/> |
| **Repository** | <https://github.com/SASOPELANA/ProyectoFinal-TalentoTech> |

## Build/Development Commands

```bash
# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Deployment:** Vercel (automatic on push to main branch)

## Testing

**No test framework configured.** Manual testing required:

1. Test cart functionality (add/remove items, localStorage persistence)
2. Verify responsive design at 768px and 480px breakpoints
3. Test all page navigation links
4. Check cross-page cart state consistency

## Linting/Formatting

**No linting tools configured.** Follow code style patterns below manually.

## Directory Structure

```
/
├── index.html                    # Main store page (entry point)
├── package.json                  # Vite config
├── src/
│   ├── assets/
│   │   ├── images/               # Product images (.avif, .webp preferred)
│   │   └── icons/                # Icon assets
│   ├── pages/
│   │   ├── about.html            # About page
│   │   ├── carrito.html          # Shopping cart page
│   │   ├── contacto.html         # Contact page
│   │   └── productos/            # 12 product detail pages (producto1-12.html)
│   ├── scripts/
│   │   ├── app.js                # Main store logic (cart operations)
│   │   ├── carrito.js            # Cart page logic
│   │   └── layout.js             # Shared header/footer injection
│   └── styles/
│       ├── main.css              # Global styles + CSS variables
│       ├── about.css             # About page styles
│       ├── carrito.css           # Cart page styles
│       ├── contacto.css          # Contact page styles
│       └── productos.css         # Product detail styles
└── docs/                         # Documentation
```

## Code Style Guidelines

### JavaScript

- Use `const` for constants, `let` for variables (never `var`)
- camelCase for names (Spanish allowed): `agregarAlCarrito`, `actualizarContador`
- Arrow functions for handlers: `const fn = () => {}`
- DOM: `document.getElementById()`, `addEventListener("DOMContentLoaded", ...)`
- localStorage for cart: `JSON.parse(localStorage.getItem("carrito")) || []`
- Error handling: defensive defaults (`|| []`), `alert()` for user feedback

### CSS

- Use CSS variables from `main.css`: `--bg-primary`, `--accent-primary`, etc.
- kebab-case for classes/IDs: `cart-btn`, `contador-carrito`
- Layout: CSS Grid for pages, Flexbox for components
- Fonts: `'Outfit'` (body), `'Syne'` (headings)
- Breakpoints: `768px` (tablet), `480px` (mobile)

### HTML

- `lang="es"`, include viewport meta, description meta
- Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Scripts at end of body, `layout.js` first, then `app.js`

### Naming Conventions Summary

| Element | Convention | Example |
|---------|------------|---------|
| JS variables | camelCase (Spanish) | `precioTotal`, `listaProductos` |
| JS functions | camelCase (Spanish) | `agregarAlCarrito()` |
| CSS classes | kebab-case | `cart-btn`, `product-card` |
| CSS IDs | kebab-case | `contador-carrito` |
| Files | kebab-case | `carrito.js`, `productos.css` |
| Images | kebab-case | `tcl-50pro-blue.webp` |

## Important Notes for Agents

1. **Vite Dev Server:** Run `npm run dev` for local development with hot reload
2. **Spanish Language:** All user-facing text and comments are in Spanish
3. **localStorage:** Cart persists via localStorage - test across pages
4. **Layout Injection:** `layout.js` injects consistent header/nav/footer on all pages
5. **Image Formats:** Prefer `.avif` or `.webp` for new images
6. **CSS Variables:** Use existing CSS variables from `main.css` for colors
7. **12 Products:** Store has 12 smartphone products with individual pages
8. **No npm dependencies:** Keep frontend vanilla JS - only Vite for dev server

## Common Tasks

**Add a new product page:**

1. Copy `src/pages/productos/producto1.html` as template
2. Update product info, images, prices
3. Add product image to `src/assets/images/`
4. Link from `index.html` product grid

**Modify cart behavior:**

- Main logic: `src/scripts/app.js` (adding items)
- Cart page: `src/scripts/carrito.js` (display, remove, totals)
- Styles: `src/styles/carrito.css`

**Update global styling:**

- CSS variables: `src/styles/main.css` `:root` section
- Global styles: `src/styles/main.css`
- Page-specific: files in `src/styles/`

**Modify shared layout (header/footer):**

- Edit templates in `src/scripts/layout.js`
- Styles in header/footer sections of `main.css`

## Key CSS Variables Reference

```css
/* Colors */
--bg-primary: #0a0a0f;        /* Main background */
--accent-primary: #ff6b35;    /* Orange accent (buttons, links) */
--text-primary: #ffffff;      /* Main text color */
--text-secondary: #a0a0b0;    /* Muted text */
```
