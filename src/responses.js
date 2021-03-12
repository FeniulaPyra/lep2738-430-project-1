const fs = require('fs');

const adminPage = fs.readFileSync(`${__dirname}/../client/admin.html`);
const recipePage = fs.readFileSync(`${__dirname}/../client/recipe-form.html`);
const browsePage = fs.readFileSync(`${__dirname}/../client/browse.html`);
const mainPage = fs.readFileSync(`${__dirname}/../client/index.html`);

const css = fs.readFileSync(`${__dirname}/../css/default-styles.css`);
const logo = fs.readFileSync(`${__dirname}/../client/media/logo.png`);
const parchment = fs.readFileSync(`${__dirname}/../client/media/paper.jpg`);

const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);

const getHTML = (request, response, page) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(page);
  response.end();
};

// html
const getMainPage = (request, response) => getHTML(request, response, mainPage);
const getAdminPage = (request, response) => getHTML(request, response, adminPage);
const getRecipeFormPage = (request, response) => getHTML(request, response, recipePage);
const getBrowsePage = (request, response) => getHTML(request, response, browsePage);
// error page
const get404Response = (request, response) => getHTML(request, response, errorPage);

// non-html
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getLogo = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(logo);
  response.end();
};

const getParchment = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/jpg' });
  response.write(parchment);
  response.end();
};

module.exports = {
  getMainPage, // main page
  getAdminPage, // admin
  getRecipeFormPage, // suggest
  getBrowsePage, // app

  getCSS,
  getLogo,
  getParchment,

  get404Response,
};
