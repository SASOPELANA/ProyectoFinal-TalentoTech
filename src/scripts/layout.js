// Layout compartido para todas las páginas de TechStore
// Este script inyecta el header y footer consistentes en todas las páginas

(function() {
    // Detectar la ruta base según la ubicación del archivo actual
    const path = window.location.pathname;
    let basePath = '';
    
    if (path.includes('/src/pages/productos/')) {
        basePath = '../../../';
    } else if (path.includes('/src/pages/')) {
        basePath = '../../';
    } else {
        basePath = './';
    }

    // Rutas relativas para los enlaces
    const routes = {
        home: basePath + 'index.html',
        productos: basePath + 'index.html#productos',
        about: basePath + 'src/pages/about.html',
        contacto: basePath + 'src/pages/contacto.html',
        carrito: basePath + 'src/pages/carrito.html'
    };

    // Ajustar rutas si estamos en src/pages
    if (path.includes('/src/pages/productos/')) {
        routes.about = '../../pages/about.html';
        routes.contacto = '../../pages/contacto.html';
        routes.carrito = '../../pages/carrito.html';
    } else if (path.includes('/src/pages/')) {
        routes.about = './about.html';
        routes.contacto = './contacto.html';
        routes.carrito = './carrito.html';
    }

    // Determinar página activa
    const getActivePage = () => {
        if (path.includes('about')) return 'about';
        if (path.includes('contacto')) return 'contacto';
        if (path.includes('carrito')) return 'carrito';
        if (path.includes('producto')) return 'productos';
        if (path.endsWith('index.html') || path.endsWith('/')) return 'home';
        return '';
    };

    const activePage = getActivePage();

    // Template del Header
    const headerHTML = `
    <header>
      <div class="header-inner">
        <div class="logo">
          <div class="logo-icon">📱</div>
          <h1>TechStore</h1>
        </div>
        <a href="${routes.carrito}" class="cart-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Carrito</span>
          <span class="cart-count" id="contador-carrito">0</span>
        </a>
      </div>
    </header>

    <nav>
      <ul>
        <li><a href="${routes.home}" class="${activePage === 'home' ? 'active' : ''}">Inicio</a></li>
        <li><a href="${routes.productos}" class="${activePage === 'productos' ? 'active' : ''}">Productos</a></li>
        <li><a href="${routes.about}" class="${activePage === 'about' ? 'active' : ''}">Nosotros</a></li>
        <li><a href="${routes.contacto}" class="${activePage === 'contacto' ? 'active' : ''}">Contacto</a></li>
      </ul>
    </nav>
    `;

    // Template del Footer
    const footerHTML = `
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>TechStore</h3>
            <p>Tu destino número uno para los mejores smartphones del mercado. Calidad garantizada y precios inmejorables.</p>
          </div>
          <div class="footer-links">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="${routes.home}">Inicio</a></li>
              <li><a href="${routes.productos}">Productos</a></li>
              <li><a href="${routes.about}">Nosotros</a></li>
              <li><a href="${routes.contacto}">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Términos de Servicio</a></li>
              <li><a href="#">Política de Devoluciones</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Contacto</h4>
            <p>📧 info@techstore.com</p>
            <p>📞 +1 234 567 890</p>
            <p>📍 Calle Principal 123, Ciudad</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 TechStore. Todos los derechos reservados.</p>
          <div class="links">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="${routes.contacto}">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
    `;

    // Inyectar el layout cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Buscar o crear contenedores para header y footer
        const existingHeader = document.querySelector('header');
        const existingFooter = document.querySelector('footer');
        
        // Reemplazar header existente
        if (existingHeader) {
            existingHeader.outerHTML = headerHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
        
        // Reemplazar footer existente
        if (existingFooter) {
            existingFooter.outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }

        // Actualizar contador del carrito si existe app.js cargado
        if (typeof actualizarContador === 'function') {
            actualizarContador();
        } else {
            // Si app.js no está cargado, actualizar manualmente desde localStorage
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const contador = document.getElementById('contador-carrito');
            if (contador) {
                contador.textContent = carrito.length;
            }
        }
    });
})();
