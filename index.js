require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const app = express();
const router = express.Router;
// Basic Configuration
const port = process.env.PORT || 3000;


mongoose.connect(process.env.DB_URL);


const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", function() {
  console.log("connected");
})

const urlSchema = new mongoose.Schema({
  short_url: Number,
  original_url: String
});

const UrlModel = mongoose.model("url", urlSchema);

app.use(cors());

app.use(express.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', async (req, res) => {

  const url = req.body.url
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

    if (urlRegex.test(url)) {
      const count = await UrlModel.countDocuments()

      await UrlModel.create({
        short_url: count + 1,
        original_url: req.body.url
      })
      res.json({ 
        original_url : req.body.url, 
        short_url : count + 1
      })
    } else {
      res.status(400).json({ error: 'Invalid URL' });
    }
})

app.get('/api/shorturl/:short_url', async (req, res) => {

  const short_url = Number(req.params.short_url)

  const url = await UrlModel.findOne({ short_url : short_url }).exec()
  
  console.log(url)
  
  if (!url) {
    res.status(400).json({ error: "Not Found" })
  } else {
    res.redirect(url.original_url)
  }

})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
