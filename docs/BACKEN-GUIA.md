# Guía de Backend - TechStore API

## Arquitectura General

Backend para TechStore e-commerce usando **Express.js + Firebase** (Cloud Functions, Firestore, Authentication).

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Cloud Functions │────▶│   Firestore     │
│   (Vercel)      │     │   (Express API)  │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        │ Firebase Auth│
                        └─────────────┘
```

---

## 1. Estructura de Carpetas

Crear carpeta `functions/` en la raíz del proyecto:

```
functions/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración Firebase Admin SDK
│   ├── routes/
│   │   ├── auth.routes.js       # Rutas de autenticación
│   │   ├── productos.routes.js  # Rutas de productos
│   │   ├── carrito.routes.js    # Rutas del carrito
│   │   └── pedidos.routes.js    # Rutas de pedidos
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── productos.controller.js
│   │   ├── carrito.controller.js
│   │   └── pedidos.controller.js
│   ├── middleware/
│   │   └── verifyToken.js       # Middleware de autenticación
│   └── index.js                 # Entry point Express
├── package.json
├── .env                         # Variables de entorno (NO subir a git)
└── .env.example                 # Plantilla de variables
```

---

## 2. Configuración Inicial

### 2.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 2.2 package.json (functions/)

```json
{
  "name": "techstore-api",
  "version": "1.0.0",
  "main": "src/index.js",
  "engines": {
    "node": "18"
  },
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "dependencies": {
    "express": "^4.18.2",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### 2.3 firebase.json (raíz del proyecto)

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 3. Código del Backend

### 3.1 Configuración Firebase Admin SDK

**`functions/src/config/firebase.js`**

```javascript
const admin = require('firebase-admin');

// Inicializar con credenciales del proyecto
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
```

### 3.2 Entry Point - Express App

**`functions/src/index.js`**

```javascript
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const carritoRoutes = require('./routes/carrito.routes');
const pedidosRoutes = require('./routes/pedidos.routes');

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Exportar como Cloud Function
exports.api = functions.https.onRequest(app);
```

### 3.3 Middleware de Autenticación

**`functions/src/middleware/verifyToken.js`**

```javascript
const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No autorizado',
      mensaje: 'Token no proporcionado' 
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({ 
      error: 'No autorizado',
      mensaje: 'Token inválido o expirado' 
    });
  }
};

module.exports = verifyToken;
```

---

## 4. Controladores

### 4.1 Productos Controller

**`functions/src/controllers/productos.controller.js`**

```javascript
const { db } = require('../config/firebase');

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const snapshot = await db.collection('productos').get();
    const productos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('productos').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// Crear producto (solo admin)
const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, descripcion, imagen, categoria, stock } = req.body;
    
    const nuevoProducto = {
      nombre,
      precio: Number(precio),
      descripcion,
      imagen,
      categoria,
      stock: Number(stock) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('productos').add(nuevoProducto);
    res.status(201).json({ id: docRef.id, ...nuevoProducto });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Actualizar producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    await db.collection('productos').doc(id).update(updates);
    res.json({ mensaje: 'Producto actualizado', id });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('productos').doc(id).delete();
    res.json({ mensaje: 'Producto eliminado', id });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
```

### 4.2 Carrito Controller

**`functions/src/controllers/carrito.controller.js`**

```javascript
const { db } = require('../config/firebase');

// Obtener carrito del usuario
const obtenerCarrito = async (req, res) => {
  try {
    const { uid } = req.user;
    const doc = await db.collection('carritos').doc(uid).get();
    
    if (!doc.exists) {
      return res.json({ items: [], total: 0 });
    }
    
    res.json(doc.data());
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

// Agregar item al carrito
const agregarItem = async (req, res) => {
  try {
    const { uid } = req.user;
    const { productoId, nombre, precio, cantidad = 1 } = req.body;
    
    const carritoRef = db.collection('carritos').doc(uid);
    const doc = await carritoRef.get();
    
    let items = doc.exists ? doc.data().items : [];
    
    // Verificar si el producto ya está en el carrito
    const itemIndex = items.findIndex(item => item.productoId === productoId);
    
    if (itemIndex > -1) {
      items[itemIndex].cantidad += cantidad;
    } else {
      items.push({ productoId, nombre, precio: Number(precio), cantidad });
    }
    
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    await carritoRef.set({ 
      items, 
      total,
      updatedAt: new Date().toISOString() 
    });
    
    res.json({ items, total });
  } catch (error) {
    console.error('Error agregando item:', error);
    res.status(500).json({ error: 'Error al agregar item' });
  }
};

// Actualizar cantidad de item
const actualizarItem = async (req, res) => {
  try {
    const { uid } = req.user;
    const { productoId } = req.params;
    const { cantidad } = req.body;
    
    const carritoRef = db.collection('carritos').doc(uid);
    const doc = await carritoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    
    let items = doc.data().items;
    const itemIndex = items.findIndex(item => item.productoId === productoId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    if (cantidad <= 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].cantidad = cantidad;
    }
    
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    await carritoRef.set({ items, total, updatedAt: new Date().toISOString() });
    res.json({ items, total });
  } catch (error) {
    console.error('Error actualizando item:', error);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
};

// Eliminar item del carrito
const eliminarItem = async (req, res) => {
  try {
    const { uid } = req.user;
    const { productoId } = req.params;
    
    const carritoRef = db.collection('carritos').doc(uid);
    const doc = await carritoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    
    let items = doc.data().items.filter(item => item.productoId !== productoId);
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    await carritoRef.set({ items, total, updatedAt: new Date().toISOString() });
    res.json({ items, total });
  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({ error: 'Error al eliminar item' });
  }
};

// Vaciar carrito
const vaciarCarrito = async (req, res) => {
  try {
    const { uid } = req.user;
    await db.collection('carritos').doc(uid).delete();
    res.json({ mensaje: 'Carrito vaciado', items: [], total: 0 });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
};

module.exports = {
  obtenerCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito
};
```

### 4.3 Pedidos Controller

**`functions/src/controllers/pedidos.controller.js`**

```javascript
const { db } = require('../config/firebase');

// Crear pedido desde el carrito
const crearPedido = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { direccion, metodoPago } = req.body;
    
    // Obtener carrito actual
    const carritoDoc = await db.collection('carritos').doc(uid).get();
    
    if (!carritoDoc.exists || carritoDoc.data().items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    
    const carrito = carritoDoc.data();
    
    // Crear pedido
    const pedido = {
      userId: uid,
      email,
      items: carrito.items,
      total: carrito.total,
      direccion,
      metodoPago,
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    };
    
    const pedidoRef = await db.collection('pedidos').add(pedido);
    
    // Vaciar carrito después de crear pedido
    await db.collection('carritos').doc(uid).delete();
    
    res.status(201).json({ 
      mensaje: 'Pedido creado exitosamente',
      pedidoId: pedidoRef.id,
      ...pedido 
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
};

// Obtener pedidos del usuario
const obtenerPedidosUsuario = async (req, res) => {
  try {
    const { uid } = req.user;
    
    const snapshot = await db.collection('pedidos')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const pedidos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// Obtener pedido por ID
const obtenerPedidoPorId = async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    
    const doc = await db.collection('pedidos').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    const pedido = doc.data();
    
    // Verificar que el pedido pertenece al usuario
    if (pedido.userId !== uid) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    res.json({ id: doc.id, ...pedido });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
};

// Actualizar estado del pedido (admin)
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    await db.collection('pedidos').doc(id).update({ 
      estado,
      updatedAt: new Date().toISOString() 
    });
    
    res.json({ mensaje: 'Estado actualizado', id, estado });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

module.exports = {
  crearPedido,
  obtenerPedidosUsuario,
  obtenerPedidoPorId,
  actualizarEstadoPedido
};
```

---

## 5. Rutas

### 5.1 Rutas de Productos

**`functions/src/routes/productos.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productos.controller');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (admin)
router.post('/', verifyToken, crearProducto);
router.put('/:id', verifyToken, actualizarProducto);
router.delete('/:id', verifyToken, eliminarProducto);

module.exports = router;
```

### 5.2 Rutas del Carrito

**`functions/src/routes/carrito.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  obtenerCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito
} = require('../controllers/carrito.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', obtenerCarrito);
router.post('/items', agregarItem);
router.put('/items/:productoId', actualizarItem);
router.delete('/items/:productoId', eliminarItem);
router.delete('/', vaciarCarrito);

module.exports = router;
```

### 5.3 Rutas de Pedidos

**`functions/src/routes/pedidos.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  crearPedido,
  obtenerPedidosUsuario,
  obtenerPedidoPorId,
  actualizarEstadoPedido
} = require('../controllers/pedidos.controller');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.post('/', crearPedido);
router.get('/', obtenerPedidosUsuario);
router.get('/:id', obtenerPedidoPorId);
router.patch('/:id/estado', actualizarEstadoPedido);

module.exports = router;
```

### 5.4 Rutas de Autenticación

**`functions/src/routes/auth.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { db } = require('../config/firebase');

// Registrar/actualizar usuario en Firestore después de signup
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { nombre, telefono } = req.body;
    
    await db.collection('usuarios').doc(uid).set({
      email,
      nombre: nombre || '',
      telefono: telefono || '',
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    res.json({ mensaje: 'Usuario registrado', uid });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Obtener perfil del usuario
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const doc = await db.collection('usuarios').doc(uid).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ uid, ...doc.data() });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Actualizar perfil
router.put('/perfil', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { nombre, telefono, direccion } = req.body;
    
    await db.collection('usuarios').doc(uid).update({
      nombre,
      telefono,
      direccion,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ mensaje: 'Perfil actualizado' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;
```

---

## 6. Modelos de Datos (Firestore)

### 6.1 Colección: `productos`

```javascript
{
  id: "auto-generated",
  nombre: "iPhone 15 Pro Max",
  precio: 1199.99,
  descripcion: "El smartphone más avanzado de Apple...",
  imagen: "https://..../iphone15.webp",
  categoria: "apple",
  stock: 50,
  especificaciones: {
    pantalla: "6.7 pulgadas",
    procesador: "A17 Pro",
    ram: "8GB",
    almacenamiento: "256GB",
    bateria: "4422 mAh"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 6.2 Colección: `usuarios`

```javascript
{
  // Document ID = Firebase Auth UID
  email: "usuario@ejemplo.com",
  nombre: "Juan Pérez",
  telefono: "+57 300 123 4567",
  direccion: {
    calle: "Calle 123 #45-67",
    ciudad: "Bogotá",
    departamento: "Cundinamarca",
    codigoPostal: "110111"
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 6.3 Colección: `carritos`

```javascript
{
  // Document ID = Firebase Auth UID
  items: [
    {
      productoId: "abc123",
      nombre: "iPhone 15 Pro",
      precio: 1199.99,
      cantidad: 2
    }
  ],
  total: 2399.98,
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 6.4 Colección: `pedidos`

```javascript
{
  id: "auto-generated",
  userId: "firebase-auth-uid",
  email: "usuario@ejemplo.com",
  items: [
    {
      productoId: "abc123",
      nombre: "iPhone 15 Pro",
      precio: 1199.99,
      cantidad: 2
    }
  ],
  total: 2399.98,
  direccion: {
    calle: "Calle 123 #45-67",
    ciudad: "Bogotá",
    departamento: "Cundinamarca"
  },
  metodoPago: "tarjeta",
  estado: "pendiente", // pendiente | procesando | enviado | entregado | cancelado
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

---

## 7. Reglas de Seguridad Firestore

**`firestore.rules`**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper para verificar propiedad
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Productos: lectura pública, escritura solo autenticados
    match /productos/{productoId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }
    
    // Usuarios: solo el propio usuario puede leer/escribir
    match /usuarios/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Carritos: solo el propio usuario
    match /carritos/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Pedidos: usuario puede leer/crear sus pedidos
    match /pedidos/{pedidoId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated(); // Admin para actualizar estado
    }
  }
}
```

---

## 8. Resumen de Endpoints API

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Health check | No |
| **Productos** |
| `GET` | `/api/productos` | Listar todos | No |
| `GET` | `/api/productos/:id` | Obtener por ID | No |
| `POST` | `/api/productos` | Crear producto | Sí |
| `PUT` | `/api/productos/:id` | Actualizar | Sí |
| `DELETE` | `/api/productos/:id` | Eliminar | Sí |
| **Carrito** |
| `GET` | `/api/carrito` | Obtener carrito | Sí |
| `POST` | `/api/carrito/items` | Agregar item | Sí |
| `PUT` | `/api/carrito/items/:id` | Actualizar cantidad | Sí |
| `DELETE` | `/api/carrito/items/:id` | Eliminar item | Sí |
| `DELETE` | `/api/carrito` | Vaciar carrito | Sí |
| **Pedidos** |
| `POST` | `/api/pedidos` | Crear pedido | Sí |
| `GET` | `/api/pedidos` | Listar mis pedidos | Sí |
| `GET` | `/api/pedidos/:id` | Obtener pedido | Sí |
| `PATCH` | `/api/pedidos/:id/estado` | Actualizar estado | Sí |
| **Auth** |
| `POST` | `/api/auth/register` | Registrar perfil | Sí |
| `GET` | `/api/auth/perfil` | Obtener perfil | Sí |
| `PUT` | `/api/auth/perfil` | Actualizar perfil | Sí |

---

## 9. Integración con el Frontend

### 9.1 Configuración Firebase en Frontend

Crear **`src/scripts/firebase-config.js`**:

```javascript
// Configuración de Firebase para el frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 9.2 Cliente API para el Frontend

Crear **`src/scripts/api.js`**:

```javascript
// Cliente API para conectar con el backend
import { auth } from './firebase-config.js';

const API_URL = 'https://us-central1-TU-PROYECTO.cloudfunctions.net/api';

// Helper para obtener headers con token
const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ==================== PRODUCTOS ====================

export const obtenerProductos = async () => {
  const res = await fetch(`${API_URL}/productos`);
  return res.json();
};

export const obtenerProducto = async (id) => {
  const res = await fetch(`${API_URL}/productos/${id}`);
  return res.json();
};

// ==================== CARRITO ====================

export const obtenerCarrito = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/carrito`, { headers });
  return res.json();
};

export const agregarAlCarrito = async (producto) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/carrito/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(producto)
  });
  return res.json();
};

export const actualizarCantidad = async (productoId, cantidad) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/carrito/items/${productoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ cantidad })
  });
  return res.json();
};

export const eliminarDelCarrito = async (productoId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/carrito/items/${productoId}`, {
    method: 'DELETE',
    headers
  });
  return res.json();
};

// ==================== PEDIDOS ====================

export const crearPedido = async (datosEnvio) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers,
    body: JSON.stringify(datosEnvio)
  });
  return res.json();
};

export const obtenerMisPedidos = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/pedidos`, { headers });
  return res.json();
};

// ==================== AUTH ====================

export const registrarPerfil = async (datos) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(datos)
  });
  return res.json();
};

export const obtenerPerfil = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/perfil`, { headers });
  return res.json();
};
```

---

## 10. Comandos de Despliegue

```bash
# Instalar dependencias
cd functions
npm install

# Ejecutar emulador local
npm run serve
# API disponible en: http://localhost:5001/TU-PROYECTO/us-central1/api

# Desplegar a producción
npm run deploy

# Ver logs
npm run logs
```

---

## 11. Script de Migración de Productos

Script para cargar los 12 productos existentes a Firestore:

**`functions/scripts/migrar-productos.js`**

```javascript
const admin = require('firebase-admin');

// Inicializar con credenciales
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const productos = [
  {
    nombre: "TCL 50 5G",
    precio: 849900,
    descripcion: "Smartphone TCL con conectividad 5G",
    imagen: "/src/assets/images/tcl-50-5g.webp",
    categoria: "tcl",
    stock: 20
  },
  {
    nombre: "Samsung Galaxy A15",
    precio: 699900,
    descripcion: "Samsung Galaxy A15 con pantalla Super AMOLED",
    imagen: "/src/assets/images/samsung-a15.webp",
    categoria: "samsung",
    stock: 25
  },
  {
    nombre: "Xiaomi Redmi Note 13",
    precio: 799900,
    descripcion: "Redmi Note 13 con cámara de 108MP",
    imagen: "/src/assets/images/redmi-note-13.webp",
    categoria: "xiaomi",
    stock: 30
  },
  // ... Agregar los 12 productos con sus datos reales
];

async function migrarProductos() {
  console.log('Iniciando migración de productos...');
  
  for (const producto of productos) {
    const docRef = await db.collection('productos').add({
      ...producto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`Producto creado: ${producto.nombre} (ID: ${docRef.id})`);
  }
  
  console.log('Migración completada!');
  process.exit(0);
}

migrarProductos().catch(console.error);
```

Ejecutar:

```bash
node scripts/migrar-productos.js
```

---

## 12. Variables de Entorno

**`functions/.env.example`**

```env
# Firebase (se configura automáticamente en Cloud Functions)
# Solo necesario para desarrollo local

# Opcional: configuración adicional
NODE_ENV=development
```

---

## 13. Pasos para Implementar

1. **Crear proyecto en Firebase Console**
   - Ir a <https://console.firebase.google.com>
   - Crear nuevo proyecto
   - Habilitar Authentication (Email/Password y Google)
   - Habilitar Firestore Database

2. **Configurar Firebase CLI**

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

3. **Crear estructura de archivos**
   - Copiar todos los archivos de esta guía

4. **Instalar dependencias**

   ```bash
   cd functions
   npm install
   ```

5. **Probar localmente**

   ```bash
   npm run serve
   ```

6. **Desplegar**

   ```bash
   npm run deploy
   ```

7. **Actualizar frontend**
   - Agregar firebase-config.js y api.js
   - Modificar app.js para usar la API en lugar de localStorage

---

## 14. Consideraciones de Seguridad

1. **Nunca exponer** `serviceAccountKey.json` en el repositorio
2. **Agregar a `.gitignore`**:

   ```
   functions/.env
   functions/serviceAccountKey.json
   ```

3. **Validar datos** en el backend antes de guardar
4. **Usar HTTPS** siempre (Cloud Functions lo hace automáticamente)
5. **Implementar rate limiting** si es necesario
6. **Revisar reglas de Firestore** antes de producción

---

**Autor:** Generado para TechStore  
**Fecha:** Marzo 2026  
**Versión:** 1.0
