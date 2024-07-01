const multer = require('multer');
const uuid = Math.random();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/JPG': 'JPG',
  'image/JPEG': 'JPEG',
};



const fileUpload = multer({
  limits: 5000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      console.log("file", file.filename, file.originalname)
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, file.originalname);
    }
  }),
  limits: { files: 10 },
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
