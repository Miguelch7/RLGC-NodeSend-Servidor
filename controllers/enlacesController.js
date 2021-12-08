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
    const { nombre_original } = req.body;

    const enlace = new Enlace();
    enlace.url = shortid.generate();
    enlace.nombre = shortid.generate();
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