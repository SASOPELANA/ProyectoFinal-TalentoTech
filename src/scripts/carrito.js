// Recuperar el carrito del almacenamiento local
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const mostrarCarrito = () => {
    const lista = document.getElementById("lista-carrito");
    const resumenCarrito = document.getElementById("resumen-carrito");
    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Explora nuestros productos y agrega los que te gusten!</p>
                <a href="../../index.html" class="back-btn" style="display: inline-flex; margin: 0 auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Ver Productos
                </a>
            </div>
        `;
        if (resumenCarrito) resumenCarrito.style.display = 'none';
        actualizarContador();
        return;
    }

    if (resumenCarrito) resumenCarrito.style.display = 'block';

    carrito.forEach((item, indice) => {
        const producto = document.createElement("article");
        producto.classList.add("cart-item");
        producto.innerHTML = `
            <div class="cart-item-icon">📱</div>
            <div class="cart-item-info">
                <h3>${item.nombre}</h3>
                <p>Smartphone premium</p>
            </div>
            <div class="cart-item-price">$${item.precio}</div>
            <button class="cart-item-remove" onclick="eliminarDelCarrito(${indice})" title="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        `;
        lista.appendChild(producto);
    });

    actualizarResumen();
    actualizarContador();
};

const actualizarResumen = () => {
    const totalProductos = document.getElementById("total-productos");
    const importeTotal = document.getElementById("importe-total");
    const importeTotalFinal = document.getElementById("importe-total-final");
    const productCount = document.getElementById("product-count");

    const total = carrito.reduce((acc, item) => acc + item.precio, 0);
    totalProductos.textContent = carrito.length;
    importeTotal.textContent = total.toFixed(2);
    importeTotalFinal.textContent = total.toFixed(2);
    productCount.textContent = carrito.length;
};

const actualizarContador = () => {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        contador.textContent = carrito.length;
    }
};

const eliminarDelCarrito = (indice) => {
    carrito.splice(indice, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
};

const realizarCompra = () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }
    const total = carrito.reduce((acc, item) => acc + item.precio, 0);
    alert(`¡Compra realizada con éxito!\n\nTotal: $${total.toFixed(2)}\n\nGracias por tu compra en TechStore`);
    localStorage.removeItem("carrito");
    window.location.href = "../../index.html";
};

mostrarCarrito();
