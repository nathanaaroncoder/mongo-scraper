var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools

var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoScraper");

// Routes

// A GET route for scraping Amazon
app.get("/scrape", function(req, res) {

  var newOnes = 0;

  request("http://www.amazon.com", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);
  
  
    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    $("img.product-image").each(function(i, element) {
      var result = {};

      var source = $(element).attr("src");
      var title = $(element).attr("title");
      var link = $(element).parent().attr("href");
      var where = i;

      

      if (link && source && title){
        // db.Product.insert({"where": where, "link": link, "source": source, "title": title});
        // console.log(title);
        result.source = source,
        result.title = title,
        result.link = link,
        result.where = where
      }



          // Create a new Product using the `result` object built from scraping
      db.Product.create(result)
        .then(function(dbProduct) {
          newOnes++;
          // View the added result in the console
          console.log(dbProduct);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    
    });
      
  

    
    res.send("Scrape complete! Check your database. You sent " + newOnes + " new products to the db." );
    
  });
  
});

// Route for getting all Products from the db
app.get("/products", function(req, res) {
  // Grab every document in the Products collection
  db.Product.find({})
    .then(function(dbProduct) {
      // If we were able to successfully find Products, send them back to the client
      res.json(dbProduct);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/saved", function(req, res) {
  // Grab every document in the Products collection
  db.Product.find({ isSaved: true })
    .then(function(dbProduct) {
      // If we were able to successfully find Products, send them back to the client
      res.json(dbProduct);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Product by id, populate it with it's note
app.get("/products/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Product.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbProduct) {
      // If we were able to successfully find an Product with the given id, send it back to the client
      res.json(dbProduct);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Product's associated Note
app.post("/products/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Product with an `_id` equal to `req.params.id`. Update the Product to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Product.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbProduct) {
      // If we were able to successfully update an Product, send it back to the client
      res.json(dbProduct);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.put("/products/:id/:isSaved", function(req, res) {
   db.Product.findOneAndUpdate({ _id: req.params.id }, { isSaved: req.params.isSaved })
    .then(function(dbProduct) {
      // If we were able to successfully update a Product, send it back to the client
      console.log("Updated to true!");
      res.json(dbProduct);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
