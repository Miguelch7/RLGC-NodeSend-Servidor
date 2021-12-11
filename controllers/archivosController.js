const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlace = require('../models/Enlace');

exports.subirArchivo = async (req, res, next) => {
    
    const multerConfig = {
        limits: { fileSize: req.usuario ? (1024*1024*10) : (1024*1024) },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) => {
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            }
        })
    }
    
    const upload = multer(multerConfig).single('archivo');

    upload(req, res, async (error) => {
        if (!error) {
            res.json({ archivo: req.file.filename });
        } else {
            console.log(error);
            return next();
        }
    });

};

exports.eliminarArchivo = async (req, res) => {
    try {
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
        console.log('Archivo Eliminado');
    } catch (error) {
        console.log(error);
    }
};

exports.descargarArchivo = async (req, res, next) => {
    
    // Obtiene el enlace
    const { archivo } = req.params;
    const enlace = await Enlace.findOne({ nombre: archivo });

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);

    // Eliminar el archivo y la entrada de la DB
    // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const { nombre, descargas } = enlace;

    if (descargas === 1) {
        // Eliminar el archivo
        req.archivo = nombre;

        // Eliminar entrada de la DB
        await Enlace.findOneAndRemove(enlace.id);

        next();
    } else {
        // Si las descargas son mayores a 1 - Restar 1
        enlace.descargas--;
        await enlace.save();
    }
}