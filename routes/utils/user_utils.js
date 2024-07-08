const DButils = require("./DButils");
/**
 * Marks a recipe as a favorite for a user by inserting a record into the UserFavorites table.
 *
 * @param {number} user_id - The ID of the user.
 * @param {number} recipe_id - The ID of the recipe to mark as favorite.
 */
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into UserFavorites values ('${user_id}',${recipe_id})`);
}

/**
 * Retrieves the list of favorite recipes for a user from the UserFavorites table.
 *
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recipe IDs.
 */
async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from UserFavorites where userId='${user_id}'`);
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


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.checkAndDeleteOldest = checkAndDeleteOldest;
exports.insertViewedRecipe = insertViewedRecipe;
exports.markAsViewed = markAsViewed;
exports.getLastViewedRecipes =getLastViewedRecipes;