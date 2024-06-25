const express = require('express');
const multer = require('multer');
const tradeController = require('../controllers/tradeControl');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('csvFile'), tradeController.uploadCSV);
router.post('/balance', tradeController.getBalance);

module.exports = router;
