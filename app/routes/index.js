const noteRoutes = require('./product_routes');

module.exports = function(app, db) {
  productRoutes(app, db);
  // Other route groups could go here, in the future

  //NOTE:With more time I'd like to create individual route files and clean up the server.js file
  // Those routes would be accessed here and in the /product_routes folder
};
