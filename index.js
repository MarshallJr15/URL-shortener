require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')
const {  MongoClient  } = require('mongodb');
const { error } = require('console');


// mongoose methods
 const client = new MongoClient(process.env.MONGO_URI)
 const db = client.db('urlshortener')
 const urls = db.collection('urls')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post(`/api/shorturl/`, function(req, res) {
  const url =  req.body.url // gets url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (error, address) => {
  const documentCount = await urls.countDocuments()

  const document = {
    original_url: url,
    short_url: documentCount
  }
  urls.insertOne(document)
    
    if (!address) {
      res.json({ error: 'invalid url'})
    } else {
      res.json({ original_url: url, short_url: documentCount});
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shorturl = req.params.short_url 
  const documentMatch = await urls.findOne({short_url: +shorturl})

  
  if (!documentMatch) {
    res.json({ error: 'invalid url'})
  } else {
    res.redirect(documentMatch.original_url)
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// Things to do:
// Connect project to MongoDb
// import mongodb Client class for database connection => const { MongClient } = require('mongodb') *!
// create new Client Class => const client = new MongoClient('uri') *!
// connect to client/cluster database => const db = client.db('databaseName') *!
// connect to database collection => const collectonName = db.collection('collectionName') *!


// Setup dns module to search url using dns.lookup():
// import dns module for ip adresss and hostname lookup; contains methods nedded for searching url => const dns = require('dns') *!
// dns.lookup(url, callback(err, address))

// create get function to that redirects to correct url when short_url is deciphered
