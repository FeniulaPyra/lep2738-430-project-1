const recipes = {
  'fried egg': {
    name: 'Fried Egg',
    ingredients: [
      {
        name: 'egg',
        amount: 1,
        units: '',
        link: '',
      },
      {
        name: 'butter',
        amount: 1,
        units: 'tbsp',
        link: '',
      },
    ],
    steps: [
      'Put a pan on the stove and cover it with butter.',
      'turn the stovetop on',
      'crack the 1 egg into the pan',
      'wait about a minute, then flip the egg over',
      'wait another minute, then turn the stove off',
      'your egg is done!',
      'put it on a plate and eat it, or eat it straight out of the pan like a degenerate who doesn\'t own any real plates because she\'s too scared of breaking them and too lazy to wash them and also ran out of paper plates and keeps forgetting to go to the store to get more and eating eggs off of a paper towel is more degenerate than eating them out of the pan! enjoy!',
    ],
  },
};

const respondJSON = (request, response, statusCode, object) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const missingParameters = {
  message: `Error: you are missing parameters. Recipes are required to have a name, at least 1 
            ingredient and at least 1 step`,
  id: 'missingParams',
};
const noRecipes = {
  message: 'No recipes were found.',
  id: 'notFound',
};
const invalidID = {
  message: 'A recipe with that name does not exist.',
  id: 'notFound',
};
const recipeAlreadyExists = {
  message: `A recipe with that name already exists. If you are trying to update an existing recipe, 
            use the edit button.`,
  id: 'conflict',
};

const getRecipes = (request, response, params) => {
  // for finding a recipe with this entire name
  let { name } = params;
  // for searching for recipes with this term in their name.
  let { searchterm } = params;
  // for searching by ingredient
  let { ingredients } = params;

  const { limit } = params;

  let results = Object.values(recipes);

  // gets all recipes with given ids
  // let nameResults = Object.values(recipes);
  if (name) {
    name = name.toLowerCase();
    results = results.filter((r) => r.name.toLowerCase() === name);
    // make sure id exists
    if (results.length < 1) return respondJSON(request, response, 404, invalidID);
  }

  // gets recipes with searchterm in their name
  if (searchterm) {
    searchterm = searchterm.toLowerCase();
    const searchRegEx = new RegExp(`.*${searchterm}.*`);

    results = results.filter((r) => searchRegEx.test(r.name));
  }

  // gets all recipes with the given ingredient
  if (ingredients) {
    ingredients = ingredients.toLowerCase().split(',');
    ingredients.forEach((ingredient) => {
      results = results.filter((r) => r.ingredients
        .map((i) => i.name.toLowerCase())
        .includes(ingredient));
    });
  }

  // limits results
  if (limit) {
    results = results.slice(0, limit);
  }

  // if there were no results respond saying so.
  if (results.length < 1) {
    return respondJSON(request, response, 404, noRecipes);
  }
  // otherwise send back the recipes

  return respondJSON(request, response, 200, results);
};

const addRecipe = (request, response, params, method) => {
  const recipe = params;

  // if missing parameters
  if (!recipe.ingredients || !recipe.steps || !recipe.name) {
    return respondJSON(request, response, 400, missingParameters);
  }
  // if params are empty - empty name is allowed (for now)
  if (recipe.ingredients.length < 1 || recipe.steps.length < 1) {
    return respondJSON(request, response, 400, missingParameters);
  }

  // i had seperated post and put for some reason, can't remember why?
  // if there's already a recipe with that name.

  if (method.toLowerCase() === 'post' && recipes[recipe.name.toLowerCase()]) {
    return respondJSON(request, response, 409, recipeAlreadyExists);
  }

  recipes[recipe.name.toLowerCase()] = recipe;
  const responseCode = 201;
  const jsonResponse = {
    id: recipe.name,
    message: `${method.toLowerCase() === 'post' ? 'Created' : 'Updated'} Successfully`,
  };
  return respondJSON(request, response, responseCode, jsonResponse);
};
/*
const updateRecipe = (request, response, params) => {
  const recipe = params;

  // if missing parameters
  if (!recipe.ingredients || recipe.ingredients.length < 1
      || !recipe.steps || recipe.steps.length < 1
      || !recipe.name || recipe.name.length < 1) {
    return respondJSON(request, response, 400, missingParameters);
  }

  // recipe id's will always be lowercase for easier searching
  const recipeID = recipe.name.toLowerCase();

  if (!recipes[recipeID]) {
    return respondJSON(request, response, 404, invalidID);
  }

  recipes[recipeID] = recipe;
  const responseCode = 204;
  const jsonResponse = {
    message: 'Updated Successfully',
    id: recipe.name,
  };
  return respondJSON(request, response, responseCode, jsonResponse);
};
*/
const getHeaders = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end();
};

const deleteRecipe = (request, response, params) => {
  if (!params.name || params.name < 1) {
    return respondJSON(request, response, 400, missingParameters);
  }

  const recipeName = params.name.toLowerCase();

  if (!recipes[recipeName]) {
    return respondJSON(request, response, 404, invalidID);
  }

  delete recipes[recipeName];

  const responseCode = 204;
  const jsonResponse = {
    message: 'Successfully deleted recipe.',
    id: 'deleteSuccess',
  };
  return respondJSON(request, response, responseCode, jsonResponse);
};

const handlePutAndPost = (request, response, method, funct) => {
  const body = [];

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString(); // name=tony&age=35
    const bodyParams = JSON.parse(bodyString); // turn into an object with .name & .age
    funct(request, response, bodyParams, method);
  });
};

const handleRecipes = (request, response, params, httpMethod) => {
  switch (httpMethod) {
    case 'GET':
      getRecipes(request, response, params);
      break;
    case 'HEAD':
      getHeaders(request, response, params);
      break;
    case 'POST':
      handlePutAndPost(request, response, httpMethod, addRecipe);
      break;
    case 'PUT':
      handlePutAndPost(request, response, httpMethod, addRecipe);// updateRecipe);
      break;
    case 'DELETE':
      handlePutAndPost(request, response, httpMethod, deleteRecipe);
      break;
    default:
      // error -
      break;
  }
};

module.exports = {
  handleRecipes,
};
