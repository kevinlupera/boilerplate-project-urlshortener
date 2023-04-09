require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const urls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(middlewareLog);
app.use(bodyParser.urlencoded({ extended: false }));

function middlewareLog(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
}

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  let url = new URL(req.body.url);
  dns.lookup(url.host, (err, address, family) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
    printResult(address, res);
    if (!urls.includes(url)) {
      urls.push(url);
    }
    res.json({
      original_url: url,
      short_url: urls.indexOf(url) + 1,
    });
  });
});

function printResult(address, res) {
  console.log(`address: ${address}`);
}

app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrlId = req.params.short_url;
  if (!urls || !urls[shortUrlId-1]) {
    return res.json({ error: "invalid url" });
  }
  res.redirect(urls[shortUrlId-1]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
