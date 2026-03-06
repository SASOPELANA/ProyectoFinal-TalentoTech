
// variable global para almacenar los productos seleccionados
// Cargamos el carrito del localStorage si existe, sino iniciamos vacío
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const agregarAlcarrito = (nombre,precio) =>{
    //agregar el producto como un objeto al carrito
    carrito.push({nombre,precio})

    // actualizar el contador visual del carrito
    actualizarContador()
    // muestra un alerta de confirmacion
    alert(`Agregaste : ${nombre} al carrito`)
}


// funcion para actualizar el contador del carrito
const actualizarContador = ()=>{
    //cambiamos el contenido del HTML con el ID contador-carrito
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        contador.textContent = carrito.length;
    }
}

// Guarda el contenido del carrito en el almacenamiento local antes de cerrar la pagina

window.addEventListener("beforeunload",()=>{
localStorage.setItem("carrito",JSON.stringify(carrito))
});

// Al cargar la página, actualizar el contador con los items existentes
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
});
