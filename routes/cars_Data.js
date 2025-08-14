const express = require('express');
const path = require('path');
const multer = require('multer');
const carController = require('../controller/carData');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/carImages`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  }
});

// Routes
router.post('/addcar', upload.single('image'), carController.addCarDetails);
router.get('/list', carController.getCarList);

module.exports = router;
