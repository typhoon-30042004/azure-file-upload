const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const { BlobServiceClient } = require('@azure/storage-blob');
const cors = require('cors');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Set up Azure Blob Storage connection
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_ACCOUNT_KEY;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

// Set up Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Enable CORS
app.use(cors());

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file when visiting root '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Ensure the correct path to index.html
});

// File upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
  );
  const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
  
  const blobName = Date.now() + '-' + req.file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  try {
    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadData(req.file.buffer);
    res.status(200).send('File uploaded successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
