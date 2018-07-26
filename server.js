//Requiring dependencies
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//using mongoose to access MongoDB
const mongoose = require('mongoose');
//connecting to my product schema/DB:
const Product = require('./models/product');
//used for the external API request
const https = require('https');

//port for the server:
const port = 6000;
app.use(bodyParser.urlencoded({ extended: true }));

// mongodb local, default port, name of database
mongoose.connect('mongodb://localhost:27017/myretailDB',{
  useMongoClient: true}
);

//used to access products by their ID
const ObjectID = require('mongodb').ObjectID;
var productName = "";

//This call gets an individual product from the localDB (mongoDB) using its id
/*Requirement: Responds to an HTTP GET request at /products/{id} and delivers product data as
JSON (where {id} will be a number.*/
  app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    Product.find(details, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send(item);
      }//ends else
    });//end product.find statement
  }); //ends get call

//Makes the http GET call to an external API for the product name/id
/*Requirement:Performs an HTTP GET to retrieve the product name from an external API. (For
this exercise the data will come from redsky.target.com, but let’s just pretend
this is an internal resource hosted by myRetail) */
/*NOTE: Because we're using a pretend url here, I wasn't able to properly test this GET call,
I set it up as I could best predict its use. I think there will need to be adjustments here- since
I couldn't see how the exact data looked, I assumed there would be an ID variable but interval but
it is probably nested but further into the JSON than I have designed here. Additionally, if we're only returning
one item, the response.on() portion of the code below will probably need to be changed as well. I also
made the assumption that data.name would access the product name here. );*/
//NOTE: Commented out so the server will pull up upon starting the app
// https.get('redsky.target.com/:id', (response) => {
//   let data = '';
//   response.on('data', (pieceofData) => {
//     data += pieceofData;
//   });
//   response.on('end', () => {
//     //console.log(JSON.parse(data).name);
//     productName = JSON.parse(data).name;
//   });
// }).on("error", (err) => {
//   console.log("Error: " + err.message);
// });


//this function utilizes two calls to retrieve the external API name data and the pricing database
/*NOTE: I wasn't sure if this was the best way to achieve both calls asynchronously and was unable to
test the external API call specifically in this case. */
/*Requirement: Reads pricing information from a NoSQL data store and combines it with the
product id and name from the HTTP request into a single response.*/
  var productPrice = "";
  app.get('/pricecombo/:id', function(req, res) {
      const id = req.params.id;
      const details = { '_id': new ObjectID(id) };
      Product.find(details, (err, item) => {
        if (err) {
          res.send({'error':'An error has occurred'});
        } else {
          productPrice = item.current_price.value;
          https.get('redsky.target.com/:id', (response) => {
            //nested https call here to get the external data
            let data = '';
            response.on('data', (pieceofData) => {
              data += pieceofData;
            });
            response.on('end', () => {
              productName = JSON.parse(data).name;
            });
          }).on("error", (err) => {
            console.log("Error: " + err.message);
        });//ends on error
          //creates the object to send combining data from both sources
          var itemToSend = {
            name : productName,
            price: productPrice
          };
          //sends the new object
          res.send(itemToSend);
        }//ends app.get>else
      });//ends original product.find
    }); //ends app.get



//updates pricing data for individual product by ID
/*Requirement: BONUS: Accepts an HTTP PUT request at the same path (/products/{id}),
containing a JSON request body similar to the GET response, and updates the
product’s price in the data store.*/
  app.post('/products/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    const product = { text: req.body.name, current_price: { value: req.body.value,
      currency_code: req.body.currency_code} };
    db.collection('products').update(details, note, (err, result) => {
      if (err) {
          res.send({'error':'An error has occurred'});
      } else {
          res.send(product);
      }//ends else
    });//ends update
  });//ends app.post

//Not required: ---------------------------------------------------------------------------

//adds a new product to the DB(not required, just used for testing)
app.post('/products', function(req, res) {
  console.log('in product post ->', req.body);

  const newProduct = new Product({
    id: req.body.id,
    name: req.body.name,
    current_price: {
      value: req.body.value,
      currency_code: req.body.currency_code,
    }
  });
  newProduct.save(function(err) {
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      console.log('new product created');
      res.sendStatus(201);
    }
  });
});

//retrieves all products from the DB - not required, just used for testing
app.get('/allproducts', function(req, res) {
  // select/read
  Product.find({}, function(err, productResults) {
    if(err){
      console.log(err);
      res.sendStatus(500);
    }else{
      console.log('productResults ->', productResults);
      res.send(productResults);
    }
  });
});

//--------------------------------------------------------------------------

//Sets up sever, listening on port designated above
app.listen(port, () => {
  console.log('Listening on ' + port);
});
