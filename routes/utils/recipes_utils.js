const axios = require("axios");
const DButils = require("../utils/DButils");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });

    return getRecipesPreview(response.data.results.map((element) => element.id), username);
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

async function getRandomRecipes(number)
{
    const response = await axios.get(`${api_domain}/random`, {
        params: 
        {
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });

    return response;
}

exports.getRecipeInformation = getRecipeInformation;
exports.getRecipeDetails = getRecipeDetails;
exports.addNewRecipe = addNewRecipe;
exports.getRandomRecipes = getRandomRecipes;



