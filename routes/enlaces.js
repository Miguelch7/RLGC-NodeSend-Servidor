const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const enlacesController = require('../controllers/enlacesController');
const auth = require('../middleware/auth');

router.post('/',
    [
        check('nombre', 'Sube un archivo').notEmpty(),
        check('nombre_original', 'Sube un archivo').notEmpty()
    ],
    auth,
    enlacesController.nuevoEnlace
);

module.exports = router;