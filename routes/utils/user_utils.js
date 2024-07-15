const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id) {
  const checkIfFromDB = await DButils.execQuery(
    `SELECT 1 FROM MyRecipes WHERE recipe_id = ${recipe_id}`
  );
  if (checkIfFromDB.length == 0) {
    const RecipeType = "Spoonacular";
    await DButils.execQuery(
      `insert into UserFavorites (userId, externalRecipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`
    );
  } else {
    const RecipeType = "MyRecipes";
    await DButils.execQuery(
      `insert into UserFavorites (userId, recipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`
    );
  }
}

async function removeFavorite(user_id, recipe_id) {
  await DButils.execQuery(
    `DELETE FROM UserFavorites WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`
  );
}

async function getFavoriteRecipes(user_id) {
  const recipes = await DButils.execQuery(
    `SELECT recipeId, externalRecipeId, recipeSource FROM UserFavorites WHERE userId='${user_id}'`
  );

  // Process the results to return the correct ID based on the source
  const recipes_id = recipes.map((recipe) => {
    if (recipe.recipeSource === "MyRecipes") {
      return recipe.recipeId;
    } else if (recipe.recipeSource === "Spoonacular") {
      return recipe.externalRecipeId;
    }
  });

  return recipes_id;
}

async function getMyMealRecipes(user_id, recipe_id = null) {
  const recipes = recipe_id
    ? await DButils.execQuery(
        `SELECT recipeId, externalRecipeId, recipeSource, recipeProgress FROM UserMeal WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`
      )
    : await DButils.execQuery(
        `SELECT recipeId, externalRecipeId, recipeSource, recipeProgress FROM UserMeal WHERE userId='${user_id}'`
      );
  // Process the results to return the correct ID based on the source
  if (recipes.length == 0)
    throw { status: 401, message: "Recipe ID is not in user meal." };
  const recipes_info = recipes.map((recipe) => {
    if (recipe.recipeSource === "MyRecipes") {
      return {
        recipe_id: recipe.recipeId,
        recipe_progress: JSON.parse(recipe.recipeProgress),
      };
    } else if (recipe.recipeSource === "Spoonacular") {
      return {
        recipe_id: recipe.externalRecipeId,
        recipe_progress: JSON.parse(recipe.recipeProgress),
      };
    }
  });
  return recipes_info;
}

async function fetchRecipeProgress(recipes_info, recipePreviews) {
  return recipePreviews.map((recipePreview) => {
    const recipe_info = recipes_info.find(
      (recipe) => recipe.recipe_id == recipePreview.id
    );
    return {
      ...recipePreview,
      recipe_progress: recipe_info ? recipe_info.recipe_progress : null,
    };
  });
}

async function addToMyMeal(user_id, recipe_id) {
  const checkIfFromDB = await DButils.execQuery(
    `SELECT 1 FROM MyRecipes WHERE recipe_id = ${recipe_id}`
  );
  if (checkIfFromDB.length == 0) {
    const RecipeType = "Spoonacular";
    await DButils.execQuery(
      `insert into UserMeal (userId, externalRecipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`
    );
  } else {
    const RecipeType = "MyRecipes";
    await DButils.execQuery(
      `insert into UserMeal (userId, recipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`
    );
  }
}

async function updateRecipeProgressInMyMeal(
  user_id,
  recipe_id,
  recipe_progress
) {
  // Check if the recipe exists in UserMeal
  const checkIfInUserMeal = await DButils.execQuery(`SELECT * FROM UserMeal WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`);

  if (checkIfInUserMeal.length == 0)
    throw { status: 401, message: "Recipe ID is not in user meal." };

  await DButils.execQuery(
    `UPDATE UserMeal SET recipeProgress='${recipe_progress}' WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`
  );
}

async function removeFromMyMeal(user_id, recipe_id) {
  await DButils.execQuery(
    `DELETE FROM UserMeal WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`
  );
}

// ====================== Last View ==============================================================================
/**
 *
 * @param {number} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe.
 */
async function updateLastViewed(user_id, recipe_id) {
  const existingRecipeResult = await DButils.execQuery(`SELECT recipe_id FROM LastViewedRecipes WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`);
  if (existingRecipeResult.length > 0) {
    await DButils.execQuery(`UPDATE LastViewedRecipes SET viewed_at = NOW() WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`);
  }
  else{
    await DButils.execQuery(`INSERT INTO LastViewedRecipes (user_id, recipe_id, viewed_at) VALUES ('${user_id}', '${recipe_id}', NOW())`);
  }
}

/**
 * Retrieves the list of last viewed recipes for a user.
 *
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getLastViewedRecipes(user_id) {
  const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM LastViewedRecipes WHERE user_id='${user_id}' ORDER BY viewed_at DESC LIMIT 3`);
  return recipes_id.map(row => row.recipe_id);
}
async function getAllLastViewedRecipes(user_id) {
  const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM LastViewedRecipes WHERE user_id='${user_id}'`);
  return recipes_id.map(row => row.recipe_id);
}
// ====================================================================================================

function newRecipeValidations(recipe_details) {
  if (!recipe_details.user_id)
    throw { status: 409, message: "Only logged in user can add new recipe." };

  if (
    !recipe_details.title ||
    !recipe_details.image ||
    !recipe_details.ready_in_minutes ||
    !recipe_details.summary ||
    !recipe_details.servings ||
    recipe_details.vegan === null ||
    recipe_details.vegetarian === null ||
    recipe_details.is_gluten_free === null ||
    !recipe_details.ingredients ||
    !recipe_details.instructions
  )
    throw { status: 400, message: "All fields are required." };

  // Validate image path (not a URL)
  if (/^(?:[a-zA-Z]:\\|\\\\|\/)/.test(recipe_details.image)) {
    throw {
      status: 400,
      message: "Image should be a file path",
    };
  }

  // Validate ready_in_minutes as a number
  if (
    !isNaN(parseFloat(recipe_details.ready_in_minutes)) &&
    isFinite(recipe_details.ready_in_minutes)
  ) {
    recipe_details.ready_in_minutes = parseFloat(
      recipe_details.ready_in_minutes
    );
  } else {
    throw {
      status: 400,
      message: "Ready in minutes must be a valid number.",
    };
  }

  // Validate servings as a number
  if (
    !isNaN(parseFloat(recipe_details.servings)) &&
    isFinite(recipe_details.servings)
  ) {
    recipe_details.servings = parseFloat(recipe_details.servings);
  } else {
    throw {
      status: 400,
      message: "Servings must be a valid number.",
    };
  }
}

async function addNewRecipe(recipe_details) {
  newRecipeValidations(recipe_details);
  await DButils.execQuery(
    `INSERT INTO myrecipes (user_id, title, image, ready_in_minutes, summary, servings, vegan, vegetarian, is_gluten_free) VALUES ('${
      recipe_details.user_id
    }', '${recipe_details.title}', '${recipe_details.image}', ${parseFloat(
      recipe_details.ready_in_minutes
    )}, '${recipe_details.summary}', ${parseInt(recipe_details.servings)}, ${
      recipe_details.vegan ? 1 : 0
    }, ${recipe_details.vegetarian ? 1 : 0}, ${
      recipe_details.is_gluten_free ? 1 : 0
    })`
  );
  const [lastInsertResult] = await DButils.execQuery(
    `SELECT LAST_INSERT_ID() as recipe_id`
  );
  const newRecipeId = lastInsertResult.recipe_id;
  for (const ingredient of recipe_details.ingredients) {
    console.log(ingredient);
    console.log(ingredient.name);
    await DButils.execQuery(
      `INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ('${newRecipeId}', '${ingredient.name}', '${ingredient.quantity}', '${ingredient.unit}')`
    );
  }
  let order = 0;
  for (const instruction of recipe_details.instructions) {
    await DButils.execQuery(
      `INSERT INTO instructions (recipe_id, instruction_order, instruction_text) VALUES ('${newRecipeId}', '${order++}', '${
        instruction.instruction_text
      }')`
    );
  }
}
async function getMyRecipes(user_id) {
    const myRecipes = await DButils.execQuery(`SELECT * FROM MyRecipes WHERE user_id = '${user_id}'`);
    const myRecipes_id = myRecipes.map(recipe => {return recipe.recipe_id;});
    return myRecipes_id;
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.updateLastViewed = updateLastViewed;
exports.getLastViewedRecipes = getLastViewedRecipes;
exports.removeFavorite = removeFavorite;
exports.newRecipeValidations = newRecipeValidations;
exports.addNewRecipe = addNewRecipe;
exports.removeFromMyMeal = removeFromMyMeal;
exports.addToMyMeal = addToMyMeal;
exports.getMyMealRecipes = getMyMealRecipes;
exports.fetchRecipeProgress = fetchRecipeProgress;
exports.updateRecipeProgressInMyMeal = updateRecipeProgressInMyMeal;
exports.getAllLastViewedRecipes = getAllLastViewedRecipes;
