// JavaScript
const boton = document.querySelector("button");
const color = document.getElementById("color");

function generarColorHexAleatorio() {
  let digitos = "0123456789abcdef";
  let colorHex = "#";

  for (let x = 0; x < 6; x++) {
    let indiceAleatorio = Math.floor(Math.random() * 16);
    colorHex += digitos[indiceAleatorio];
  }

  return colorHex;
}

boton.addEventListener("click", () => {
  let colorAleatorio = generarColorHexAleatorio();
  // Actualizar el texto
  color.textContent = colorAleatorio;
  // Actualizar el color de fondo
  document.body.style.backgroundColor = colorAleatorio;
});
