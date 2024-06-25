# Crypto Trade App

This application parses and processes cryptocurrency trade data from a CSV file and provides an API to get asset-wise balance at any given timestamp.

## Features

- Upload CSV file containing trade data
- Store trade data in MongoDB
- Retrieve asset-wise balance at a given timestamp

## Endpoints

- `POST /upload-csv` - Uploads a CSV file with trade data
- `POST /balance` - Retrieves asset-wise balance at a given timestamp

## Deployment

- MongoDB Atlas for database
- Heroku for backend

## Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/Adity20/internship_assignment.git
    cd crypto-trade-app
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file and add your MongoDB URI:
    ```
    MONGODB=<your_mongodb_connection_string>
    PORT=3000
    ```

4. Start the server:
    ```bash
    node server.js
    ```

## Usage

Use Postman, thunderclient or a similar tool to test the endpoints:

- Upload CSV:
    ```bash
    POST /upload-csv
    ```

- Get Balance:
    ```bash
    POST /balance
    ```
