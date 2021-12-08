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
    res.json({ archivo: enlace.nombre });

    // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const { nombre, descargas } = enlace;

    if (descargas === 1) {
        // Eliminar el archivo
        req.archivo = nombre;

        // Eliminar entrada de la DB
        await Enlace.findOneAndRemove(req.params.url);

        next();
    } else {
        // Si las descargas son mayores a 1 - Restar 1
        enlace.descargas--;
        await enlace.save();
    }

}