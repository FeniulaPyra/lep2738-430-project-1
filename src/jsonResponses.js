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
      { text: 'Put a pan on the stove and cover it with butter.' },
      { text: 'turn the stovetop on' },
      { text: 'crack the 1 egg into the pan' },
      { text: 'wait about a minute, then flip the egg over' },
      { text: 'wait another minute, then turn the stove off' },
      { text: 'your egg is done!' },
      { text: 'put it on a plate and eat it, or eat it straight out of the pan!' },
    ],
  },
  'kraft mac and cheese bowl': {
    name: 'Kraft Mac and Cheese bowl',
    ingredients: [
      {
        name: 'Kraft mac and cheese bowl',
        amount: '1',
        unit: '',
        link: 'https://www.kraftmacandcheese.com/products/100166000003/microwavable',
      },
    ],
    steps: [
      { text: 'remove the plastic cover on the bowl' },
      { text: 'pour tap water into the bowl up to the indicated "fill line"' },
      { text: 'stir the macaroni in the water' },
      { text: 'microwave the macaroni for 3:30 minutes' },
      { text: 'take the bowl of mac out of the microwave, and stir in the provided cheese dust' },
      { text: 'enjoy!' },
    ],
  },
  'campbell\'s soup can': {
    name: "Campbell's Soup Can",
    ingredients: [
      {
        name: "Campbell's Soup",
        amount: '1',
        unit: 'can',
        link: '',
      },
      {
        name: 'bowl',
        amount: '1',
        unit: '',
        link: '',
      },
    ],
    steps: [
      { text: 'Open the can of soup and pour it into the bowl' },
      { text: 'Heat the bowl of soup in the microwave for about 2:30 minutes (for 1100 watt microwave)' },
      { text: "take the bowl out once it's done, and enjoy!" },
    ],
  },
  'boil pasta': {
    name: 'Boil Pasta',
    ingredients: [
      {
        name: 'pasta',
        amount: '1',
        unit: 'box',
        link: '',
      },
      {
        name: 'sauce',
        amount: '1',
        unit: 'jar',
        link: '',
      },
    ],
    steps: [
      { text: 'Boil 3 quarts of water on the stove' },
      { text: 'once the water is boiling, pour the pasta in' },
      { text: 'boil the pasta for 6-8 minutes, stirring occasionally' },
      { text: 'drain the pasta' },
      { text: 'serve the pasta with your favorite sauce.' },
    ],
  },
};
/*
let recipe = {
  "name": "Tea 2 Electric Boogaloo",
  "ingredients": [
    {
      "name": "teabag",
      "amount": 1,
      "link": "",
      "units": ""
    }
  ],
  "steps": [
    "put water in a mug",
    "microwave the mug of water",
    "put the teabag in the mug of water",
    "wait a few minutes",
    "tea is ready!"
  ]
}; */
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

const getIngredients = (request, response) => {
  
}

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

    results = results.filter((r) => searchRegEx.test(r.name.toLowerCase()));
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
  // if params are empty
  if (recipe.ingredients.length < 1 || recipe.steps.length < 1 || recipe.name.length < 1) {
    return respondJSON(request, response, 400, missingParameters);
  }
  
  // if trying to post a recipe with a name that already exists.
  if (method.toLowerCase() === 'post' && recipes[recipe.name.toLowerCase()]) {
    return respondJSON(request, response, 409, recipeAlreadyExists);
  }
  // if trying to update a nonexstant recipe.
  else if(method.toLowerCase() === 'put' && !recipes[recipe.name.toLowerCase()]) {
    return respondJSON(request, response, 404, recipe)
  }
  
  recipes[recipe.name.toLowerCase()] = recipe;
  const responseCode = method.toLowerCase() == 'post' ? 201 : 204;
  const jsonResponse = {
    id: recipe.name,
    message: `Recipe ${method.toLowerCase() === 'post' ? 'Created' : 'Updated' } Successfully`,
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
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = JSON.parse(bodyString);
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
      handlePutAndPost(request, response, httpMethod, addRecipe);
      break;
    case 'DELETE':
      handlePutAndPost(request, response, httpMethod, deleteRecipe);
      break;
    default:
      // error -
      break;
  }
};

const handleIngredients = (request, response) => {
  
  let recipesVals = Object.values(recipes);
  
  console.log(recipesVals);
  
  let allIngredients = [];
  recipesVals.forEach( (recipe) => {
    let ingredientNames = recipe.ingredients.map(a=>a.name);

    allIngredients = allIngredients.filter((a) => !ingredientNames.includes(a));
    allIngredients = allIngredients.concat(ingredientNames);
  });
  respondJSON(request, response, 200, allIngredients);
}

module.exports = {
  handleRecipes,
  handleIngredients,
};
