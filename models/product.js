/*
This file sets up the schema to add data to the database and connects to our database.
Example Data:
{"id":13860428,"name":"The Big Lebowski (Blu-ray) (Widescreen)","current_price":{"value": 13.49,"currency_code":"USD"}}*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// field names: type
const productSchema = new Schema({
  id: Number,
  name: String,
  current_price: {
    value: Number,
    currency_code: String}
});

// This tells mongoose to make our collection and
// give it a name and the schema we just created
var Product = mongoose.model('products', productSchema);

module.exports = Product;
