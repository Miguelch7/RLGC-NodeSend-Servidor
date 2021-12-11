const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Enlace = require('../models/Enlace');

exports.nuevoEnlace = async (req, res, next) => {
    
    // Revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() })
    }

    // Crear enlace
    const { nombre, nombre_original } = req.body;

    const enlace = new Enlace();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;

    // Si el usuario está autenticado
    if (req.usuario) {
        const { password, descargas } = req.body;

        // Asignar descargas a enlace
        if (descargas) {
            enlace.descargas = descargas;
        }

        // Asignar password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        // Asignar autor
        enlace.autor = req.usuario.id;
    }

    // Almacenar en la DB
    try {
        await enlace.save();
        res.json({ msg: `${enlace.url}` });

        next();
    } catch (error) {
        console.log(error);
    }

}

// Obtener todos los enlaces
exports.obtenerEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlace.find({}).select('url -_id');

        res.json({ enlaces });
    } catch (error) {
        console.log(error);
    }
}

// Retorna si el enlace tiene password
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params;

    // Verificar si existe el enlace
    const enlace = await Enlace.findOne({ url });

    if (!enlace) {
        res.status(404).json({ msg: 'Ese enlace no existe' });
        return next();
    }

    if (enlace.password) {
        return res.json({ password: true, url: enlace.url });
    }

    next();
}

// Verifica si el password es correcto
exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    const { password } = req.body;

    // Obtener enlace
    const enlace = await Enlace.findOne({ url });

    // Verificar el password
    if (bcrypt.compareSync(password, enlace.password)) {
        // Permitirle al usuario descargar el archivo
        next();
    } else {
        return res.status(401).json({ msg: 'Password Incorrecto' });
    }
}

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
    const { url } = req.params;

    // Verificar si existe el enlace
    const enlace = await Enlace.findOne({ url });

    if (!enlace) {
        res.status(404).json({ msg: 'Ese enlace no existe' });
        return next();
    }

    // Si el enlace existe
    res.json({ archivo: enlace.nombre, password: false });

    next();
}