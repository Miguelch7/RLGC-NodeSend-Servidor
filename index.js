const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

// Crear el servidor
const app = express();

// Conectar a la Base de datos
conectarDB();

// Habilitar CORS
const corsConfig = {
    origin: process.env.FRONTEND_URL
}

app.use(cors(corsConfig));

// Puerto de la app
const port = process.env.PORT || 4000;

// Habilitar leer json del body
app.use(express.json());

// Habilitar carpeta pública
app.use(express.static('uploads'));

// Rutas de la app
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

// Arrancar la app
app.listen(port, '0.0.0.0', () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
});