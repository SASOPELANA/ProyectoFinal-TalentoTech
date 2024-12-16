// variable global
let carrito = [];

const agregarAlCarrito = (nombre, precio) => {
  //agregar el producto como un objecto al carrito
  carrito.push({ nombre, precio });

  // Actualizar contador del carrito de compras
  actualizarContador();

  // muestra un alerta de confirmacion
  alert(`Agregaste:  ${nombre} al carrito. `);
};

// funcion para el contdor del carrito
const actualizarContador = () => {
  // Actualizar el contenido html del id contador-carrito
  document.getElementById("contador-carrito").textContent = carrito.length;
};

// Guardar el contenido del carrito en el almacenamiento local antes de cerrar la pagina
window.addEventListener("beforeunload", () => {
  localStorage.setItem("carrito", JSON.stringify(carrito));
});
