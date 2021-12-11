const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const enlacesController = require('../controllers/enlacesController');
const archivosController = require('../controllers/archivosController');
const auth = require('../middleware/auth');

router.post('/',
    [
        check('nombre', 'Sube un archivo').notEmpty(),
        check('nombre_original', 'Sube un archivo').notEmpty()
    ],
    auth,
    enlacesController.nuevoEnlace
);

router.get('/',
    enlacesController.obtenerEnlaces
);

router.get('/:url',
    enlacesController.obtenerEnlace
);

module.exports = router;