// gets libraries
const http = require('http');
const url = require('url');
const query = require('querystring');

const responseHandler = require('./responses.js');
const jsonHandler = require('./jsonResponses.js');

// gets port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// endpoints
const urlStruct = {
  '/': responseHandler.getMainPage, // main page
  '/admin': responseHandler.getAdminPage, // admin
  '/add-recipe': responseHandler.getRecipeFormPage, // suggest
  '/browse': responseHandler.getBrowsePage, // app

  '/recipes': jsonHandler.handleRecipes,
  '/modify-recipes': jsonHandler.modifyRecipes,
  '/ingredients': jsonHandler.handleIngredients,

  '/default-styles': responseHandler.getCSS,
  '/logo': responseHandler.getLogo,
  '/parchment-texture': responseHandler.getParchment,

  notFound: responseHandler.get404Response,
};

const onRequest = (request, response) => {
  // get url
  const parsedUrl = url.parse(request.url); // get query params
  const { pathname } = parsedUrl;

  // get method
  const httpMethod = request.method;

  // get params
  const params = query.parse(parsedUrl.query);

  // call the function for the endpoint
  if (urlStruct[pathname]) {
    urlStruct[pathname](request, response, params, httpMethod);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
