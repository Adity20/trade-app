const Trade = require('../models/Trade');
const csv = require('csv-parser');
const fs = require('fs');

exports.uploadCSV = (req, res) => {
    const results = [];

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

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
        const date = new Date(timestamp);

        const trades = await Trade.find({ utc_time: { $lte: date } });

        const balance = trades.reduce((acc, trade) => {
            if (!acc[trade.base_coin]) {
                acc[trade.base_coin] = 0;
            }
            const amount = trade.operation.toLowerCase() === 'buy' ? trade.amount : -trade.amount;
            acc[trade.base_coin] += amount;
            return acc;
        }, {});

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
