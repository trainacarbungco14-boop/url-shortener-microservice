require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Store shortened URLs
const urls = [];
let shortUrl = 1;

// Create a shortened URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  let url;

  try {
    url = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(url.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const newUrl = {
      original_url: originalUrl,
      short_url: shortUrl
    };

    urls.push(newUrl);

    res.json(newUrl);

    shortUrl++;
  });
});

// Redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const short = Number(req.params.short_url);

  const foundUrl = urls.find(function(url) {
    return url.short_url === short;
  });

  if (!foundUrl) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(foundUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});