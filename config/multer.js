const multer = require("multer");
const crypto = require("crypto");
const fs = require('fs');

const uploadpath = require("../config/uploadpath");

const diskStorage = multer.diskStorage({
    destination: uploadpath,
    filename: (req, file, callback) => callback(null, crypto.pseudoRandomBytes(10).toString("hex") + file.originalname)
});


//check if upload folder is writable
fs.access(uploadpath, fs.W_OK, function(err) {

  if(err){
    console.error("upload folder is not writeable!", err);
    process.exit(1);
  }
});

//@link https://github.com/expressjs/multer
module.exports = multer({
    storage: diskStorage,
    limits: {
        fileSize: 1024*1024*2 //2 Mb
        //fieldNameSize	Max field name size	100 bytes
        //fieldSize	Max field value size	1MB
        //fields	Max number of non-file fields	Infinity
        //fileSize	For multipart forms, the max file size (in bytes)	Infinity
        //files	For multipart forms, the max number of file fields	Infinity
        //parts	For multipart forms, the max number of parts (fields + files)	Infinity
        //headerPairs	For multipart forms, the max number of header key=>value pairs to parse	2000
    },
    fileFilter: (req, file, cb) => {
        
        cb(null, true); //accept image
        //TODO: fix issue with determine image type
        
        //switch (file.mimetype) {
        //    
        //    case 'image/jpeg':
        //    case 'image/pjpeg':
        //    case 'image/x-portable-bitmap':
        //    case 'image/x-pict':
        //    case 'image/pict':
        //    case 'image/x-pcx':
        //    case 'image/tiff':
        //    case 'image/x-tiff':
        //    case 'image/x-icon':
        //    case 'image/xpm':
        //    case 'image/png':
        //    case 'image/bmp':
        //    case 'image/gif':
        //    case 'image/x-windows-bmp':
        //
        //        cb(null, true); //accept image
        //        break;
        //    
        //    default:
        //        cb(new Error('Restricted file type'));
        //
        //}

    }

});