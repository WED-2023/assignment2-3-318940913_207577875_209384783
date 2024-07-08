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


exports.getRecipeInformation = getRecipeInformation;
exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.searchRecipe = searchRecipe;
exports.getRecipesPreview =getRecipesPreview;



