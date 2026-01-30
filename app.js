require("dotenv").config();
console.log("BUCKET:", process.env.BUCKET_NAME);
console.log("REGION:", process.env.AWS_REGION);


const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const app = express();

/* ensure uploads folder exists */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

// AWS config
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const BUCKET = process.env.BUCKET_NAME;

// serve static files
app.use(express.static(path.join(__dirname, "public")));

/* upload route */
app.post("/upload", upload.single("bill"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file received");
    }

    if (!BUCKET) {
      console.error("BUCKET_NAME not set");
      return res.status(500).send("Server config error");
    }

    const params = {
      Bucket: BUCKET,
      Key: `bills/${Date.now()}-${req.file.originalname}`,
      Body: fs.createReadStream(req.file.path),
    };

    //await s3.upload(params).promise();

    fs.unlinkSync(req.file.path); // remove temp file

    res.send("Bill uploaded successfully!");
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).send("Upload failed");
  }
});

/* homepage */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* start server */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});