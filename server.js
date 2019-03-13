'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var dns = require('dns');

var app = express();

// Basic Configuration 
var port = 3000;

/** this project needs a db !! **/ 

mongoose.connect(process.env.URL, {useMongoClient: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

var urlModel = mongoose.model("urlModel", urlSchema);


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

  var count;

app.post("/api/shorturl/new", function(req, res) {
  urlModel.count({}, function( err, c) {
    if (err) {
      console.log("ouch");
    } else {
      count = c + 1;
      var origUrl = req.body.url;

      if (!/^(https*:\/\/)/.test(origUrl)) {
        return res.send({"error":"invalid URL"});
      } else {

        dns.lookup(origUrl.replace(/^(https*:\/\/)/, ""), function(err) {
          if (err) {
            console.log(err);
            return res.send({"error": "invalid URL"});
          } else {
            var url = new urlModel({
              original_url: origUrl,
               short_url: count
            });
       
             url.save();
       
            res.send({
              original_url: origUrl,
              short_url: count
            });
          }
        });
      }
    }
  });
  
});

app.get("/api/shorturl/:number", function(req, res) {
  var num = req.params.number;
  urlModel.findOne({"short_url": num}, "original_url", function(err, data) {
    if (err) {
      console.log("whoopsie");
    } else {
      res.redirect(data.original_url);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

