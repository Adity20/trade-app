const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Trade = require('../models/Trade');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

exports.uploadCSV = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            try {
                const utcTime = `${data.UTC_Time.substring(0, 10)}T${data.UTC_Time.substring(11)}Z`;
                const utcDate = new Date(utcTime);

                const [base_coin, quote_coin] = data.Market.split('/');
                results.push({
                    user_id: data.User_ID,
                    utc_time: utcDate,
                    operation: data.Operation,
                    base_coin,
                    quote_coin,
                    amount: parseFloat(data['Buy/Sell Amount']),
                    price: parseFloat(data.Price)
                });
            } catch (err) {
                console.error('Error processing CSV row:', err);
                res.status(400).send('Error processing CSV row');
            }
        })
        .on('end', async () => {
            try {
                await Trade.insertMany(results);
                fs.unlinkSync(req.file.path);
                res.send('CSV file successfully processed and data stored in database.');
            } catch (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Internal Server Error');
            }
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Error processing CSV file');
        });
};



exports.getBalance = async (req, res) => {
    const { timestamp } = req.body;

    try {
        if (!timestamp) {
            return res.status(400).json({ error: 'Timestamp is required' });
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid timestamp format' });
        }

        const trades = await Trade.find({ utc_time: { $lte: date } });

        const balance = trades.reduce((acc, trade) => {
            const amount = trade.operation.toLowerCase() === 'buy' ? trade.amount : -trade.amount;
            acc[trade.base_coin] = (acc[trade.base_coin] || 0) + amount;
            return acc;
        }, {});

        // Remove zero balances
        Object.keys(balance).forEach(key => {
            if (balance[key] === 0) {
                delete balance[key];
            }
        });

        res.json(balance);
    } catch (err) {
        console.error('Error fetching balance:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

