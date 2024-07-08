const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    console.log("recipe_id = ",recipe_id);
    const checkIfFromDB = await DButils.execQuery(`SELECT 1 FROM MyRecipes WHERE recipe_id = ${recipe_id}`);
    if (checkIfFromDB.length == 0)
    {  
        const RecipeType = "Spoonacular";
        await DButils.execQuery(`insert into UserFavorites (userId, externalRecipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`);
    }
    else{
        const RecipeType = "MyRecipes";
        await DButils.execQuery(`insert into UserFavorites (userId, recipeId, recipeSource) values ('${user_id}',${recipe_id},'${RecipeType}')`);
    }


}


async function removeFavorite(user_id, recipe_id) {
    await DButils.execQuery(`DELETE FROM UserFavorites WHERE userId='${user_id}' AND (recipeId=${recipe_id} OR externalRecipeId=${recipe_id})`);
}


async function getFavoriteRecipes(user_id) {
    const recipes = await DButils.execQuery(`SELECT recipeId, externalRecipeId, recipeSource FROM UserFavorites WHERE userId='${user_id}'`);
    
    // Process the results to return the correct ID based on the source
    const recipes_id = recipes.map(recipe => {
        if (recipe.recipeSource === 'MyRecipes') {
            return recipe.recipeId;
        } else if (recipe.recipeSource === 'Spoonacular') {
            return recipe.externalRecipeId;
        }
    });

    return recipes_id;
}

/**
 * Checks if the user has more than the maximum allowed records (3) in the LastViewedRecipes table.
 * If the user has 3 or more records, it deletes the oldest record.
 *
 * @param {number} user_id - The ID of the user.
 */
async function checkAndDeleteOldest(user_id) {
    const maxRecords = 3;
    const countQuery = `SELECT COUNT(*) AS count FROM LastViewedRecipes WHERE user_id = ?`;
    const countResult = await DButils.execQuery(countQuery, [user_id]);
    const recordCount = countResult[0].count;

    if (recordCount >= maxRecords) {
        const oldestRecipeQuery = `
            SELECT recipe_id 
            FROM LastViewedRecipes 
            WHERE user_id = ? 
            ORDER BY viewed_at ASC 
            LIMIT 1
        `;
        const oldestRecipeResult = await execQuery(oldestRecipeQuery, [user_id]);
        const oldestRecipeId = oldestRecipeResult[0].recipe_id;
        const deleteQuery = `DELETE FROM LastViewedRecipes WHERE user_id = ? AND recipe_id = ?`;
        await DButils.execQuery(deleteQuery, [user_id, oldestRecipeId]);
    }
}

/**
 * Inserts a new record into the LastViewedRecipes table.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe.
 */
async function insertViewedRecipe(user_id, recipe_id) {
    const insertQuery = `INSERT INTO LastViewedRecipes (user_id, recipe_id) VALUES (?, ?)`;
    await DButils.execQuery(insertQuery, [user_id, recipe_id]);
}

/**
 * Marks a recipe as viewed by a user. If the user has more than the maximum allowed records,
 * it deletes the oldest record and then inserts the new record.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe.
 */
async function markAsViewed(user_id, recipe_id) {
    await checkAndDeleteOldest(user_id);
    await insertViewedRecipe(user_id, recipe_id);
}

/**
 * Retrieves the list of last viewed recipes for a user.
 *
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getLastViewedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from LastViewedRecipes where user_id='${user_id}'`);
    return recipes_id;
}

function newRecipeValidations(recipe_details)
{
    if (!recipe_details.user_id)
        throw { status: 409, message: "Only logged in user can add new recipe." };
  
      if(!recipe_details.title || !recipe_details.image || !recipe_details.ready_in_minutes || 
        !recipe_details.summary || !recipe_details.servings || recipe_details.vegan === null ||
        recipe_details.vegetarian === null || recipe_details.is_gluten_free === null
        || !recipe_details.ingredients || !recipe_details.instructions)
        throw { status: 400, message: "All fields are required." };
  
      // Validate image path (not a URL)
      if (/^(?:[a-zA-Z]:\\|\\\\|\/)/.test(recipe_details.image)) {
        throw {
          status: 400,
          message: "Image should be a file path",
        };
      }
  
      // Validate ready_in_minutes as a number
      if (!isNaN(parseFloat(recipe_details.ready_in_minutes)) && isFinite(recipe_details.ready_in_minutes)) {
        recipe_details.ready_in_minutes = parseFloat(recipe_details.ready_in_minutes);
      } else {
        throw {
          status: 400,
          message: "Ready in minutes must be a valid number.",
        };
      }
  
      // Validate servings as a number
      if (!isNaN(parseFloat(recipe_details.servings)) && isFinite(recipe_details.servings)) {
        recipe_details.servings = parseFloat(recipe_details.servings);
      } else {
        throw {
          status: 400,
          message: "Servings must be a valid number.",
        };
      }
}

async function addNewRecipe(recipe_details)
{
    newRecipeValidations(recipe_details);
    await DButils.execQuery(
        `INSERT INTO myrecipes (user_id, title, image, ready_in_minutes, summary, servings, vegan, vegetarian, is_gluten_free) VALUES ('${recipe_details.user_id}', '${recipe_details.title}', '${recipe_details.image}', ${parseFloat(recipe_details.ready_in_minutes)}, '${recipe_details.summary}', ${parseInt(recipe_details.servings)}, ${recipe_details.vegan ? 1 : 0}, ${recipe_details.vegetarian ? 1 : 0}, ${recipe_details.is_gluten_free ? 1 : 0})`
    );
    const [lastInsertResult] = await DButils.execQuery(`SELECT LAST_INSERT_ID() as recipe_id`);
    const newRecipeId = lastInsertResult.recipe_id;  
    for(const ingredient of recipe_details.ingredients)
    {
        console.log(ingredient);
        console.log(ingredient.name);
        await DButils.execQuery(
            `INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ('${newRecipeId}', '${ingredient.name}', '${ingredient.quantity}', '${ingredient.unit}')`
        );
    }
    let order = 0;
    for(const instruction of recipe_details.instructions)
    {
        await DButils.execQuery(
            `INSERT INTO instructions (recipe_id, instruction_order, instruction_text) VALUES ('${newRecipeId}', '${order++}', '${instruction.instruction_text}')`
        );
    }
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.checkAndDeleteOldest = checkAndDeleteOldest;
exports.insertViewedRecipe = insertViewedRecipe;
exports.markAsViewed = markAsViewed;
exports.getLastViewedRecipes =getLastViewedRecipes;
exports.removeFavorite = removeFavorite;
exports.newRecipeValidations = newRecipeValidations;
exports.addNewRecipe = addNewRecipe;