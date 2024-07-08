const axios = require("axios");
const DButils = require("../utils/DButils");
const api_domain = "https://api.spoonacular.com/recipes";

/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

async function getRandomRecipes(number = 3) {
    const params = {
        apiKey: process.env.spooncular_apiKey,
        number: number
    };
    const url = `${api_domain}/random`;  
    const randomRecipes = await axios.get(url, { params }); 
    // return response.data.recipes;
    if (randomRecipes.data.recipes.length > 0) {
        return randomRecipes.data.recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            image: recipe.image,
            aggregateLikes: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
          }));
        }
    else{
        throw { status: 500, message: "No random recipes found or issue with Spoonacular API." };
      }
}


async function getRecipeInformation(recipe_id, FromDB = false) {
    if(FromDB)
    {
        const recipeInformataion = (
            await DButils.execQuery(
              `SELECT * FROM myrecipes WHERE recipe_id = '${recipe_id}'`
            )
          )[0];
          return recipeInformataion;
    }
    else
    {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    }

}

async function getRecipeDetails(recipe_id, fromDB = false) {
    let recipe_info = await getRecipeInformation(recipe_id, fromDB);
    if(fromDB)
    {        
        let { recipe_id, title, ready_in_minutes, image, vegan, vegetarian, is_gluten_free } = recipe_info;
        return {
            id: recipe_id,
            title: title,
            readyInMinutes: ready_in_minutes,
            image: image,
            popularity: 0,
            vegan: Boolean(vegan),
            vegetarian: Boolean(vegetarian),
            glutenFree: Boolean(is_gluten_free),
        }
    }    
    else
    {
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

}

async function getRecipeFullInformation(recipe_id, fromDB) {
    if (fromDB)
    {
        const recipe_informataion = (
            await DButils.execQuery(
              `SELECT * FROM myrecipes WHERE recipe_id = '${recipe_id}'`
            )
          )[0];
        const recipe_ingredients = (
            await DButils.execQuery(
                `SELECT * FROM ingredients WHERE recipe_id = '${recipe_id}'`
            )
        );
            const recipe_instructions = (
            await DButils.execQuery(
                `SELECT * FROM instructions WHERE recipe_id = '${recipe_id}' ORDER BY instruction_order`
            )
        );

        const recipe = { recipe_informataion: recipe_informataion, 
        recipe_ingredients: recipe_ingredients, 
        recipe_instructions: recipe_instructions }

        return recipe;
    }
    else
    {
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });
    }
   
}

async function getRecipeFullDetails(recipe_id) {
    const checkIfFromDB = await DButils.execQuery(`SELECT 1 FROM MyRecipes WHERE recipe_id = '${recipe_id}'`);
    if (checkIfFromDB.length == 0)
    {
        let recipe = await getRecipeFullInformation(recipe_id);  
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, instructions, extendedIngredients } = recipe.data;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            instructions: instructions,
            extendedIngredients: extendedIngredients
        };
    }    
    else
    {
        let recipe = await getRecipeFullInformation(recipe_id, true);        
        let { recipe_id: db_recipe_id, title, ready_in_minutes, image, vegan, vegetarian, is_gluten_free } = recipe.recipe_informataion;
        let ingredients = [];
        for(const ingredient of recipe.recipe_ingredients)
        {
            let { name,  quantity, unit } = ingredient;
            ingredients.push({ originalName: name,  amount: quantity, unit: unit });
        }
        let instructions = [];
        for(const instruction of recipe.recipe_instructions)
        {
            let { instruction_text } = instruction;
            instructions.push(instruction_text);
        }
        return {
            id: db_recipe_id,
            title: title,
            readyInMinutes: ready_in_minutes,
            image: image,
            popularity: 0,
            vegan: Boolean(vegan),
            vegetarian: Boolean(vegetarian),
            glutenFree: Boolean(is_gluten_free),
            instructions: instructions,
            extendedIngredients: ingredients
        };
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

    return getRecipesPreview(response.data.results.map((element) => element.id));
}


async function getRecipesPreview(recipes_id_array) {
  const recipesDetailsArray = [];
  const recipeDetailsPromises = recipes_id_array.map(async (recipe_id) => {
      const recipeDetails = await getRecipeDetails(recipe_id);
      return recipeDetails;
  });

  const resolvedRecipesDetails = await Promise.all(recipeDetailsPromises);
  recipesDetailsArray.push(...resolvedRecipesDetails);

  return recipesDetailsArray;
}
    // results from search --> getRecipeDetails by id 
    // we have the array --> recipes_id_array 
    // for each id we call to getRecipeDetails function(above)
    // for each information we get for id we make the recipe preview ! 
    // we will use this function to display preview of recipes in : random , search , last viewed, faviorites , my meal ...  


exports.searchRecipe = searchRecipe;
exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.searchRecipe = searchRecipe;
exports.getRecipesPreview =getRecipesPreview;



