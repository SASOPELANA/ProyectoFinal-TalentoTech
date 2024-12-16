// Obtenemos el carrito del almacenamiento local

const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Muestra los productos del carrito
const mostrarCarrito = () => {
  const lista = document.getElementById("lista-carrito");
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito esta vacio!!</p>";
    return;
  }

  carrito.forEach((producto, indice) => {
    const elementoProducto = document.createElement("article");
    elementoProducto.classList.add("producto");

    elementoProducto.innerHTML = `
        <h2>${producto.nombre}</h2>
        <p class="precio">$${producto.precio}</p>
        <button onclick="eliminarDelCarrito(${indice})">Eliminar </button>
    `;

    lista.appendChild(elementoProducto);
  });
};

// Funcion para eliminar productos del carrito
const eliminarDelCarrito = (indice) => {
  carrito.splice(indice, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarCarrito();
};

// Simula la compra
const realizarCompra = () => {
  alert("Compra realizada con éxito");
  localStorage.removeItem("carrito");
  window.location.href = "index.html";
};

// Inicializa el carrito al cargar la página
mostrarCarrito();
