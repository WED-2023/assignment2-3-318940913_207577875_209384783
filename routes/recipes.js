var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.send(results);
  } catch (error) {
    next(error);
  }
});




router.get("/random", async (req, res, next) => {
  try {
    const number = req.query.number || 3;
    const randomRecipes = await recipes_utils.getRandomRecipes(number);
    res.status(200).send(randomRecipes);
  } catch (error) {
    next(error);
  }
});

router.get("/recipe/:recipe_id", async (req, res, next) => {
  try {
    const recipe_id = req.params.recipe_id;
    console.log("recipe_id = ",recipe_id);
    //When I try to get full information i will pass in the body if i should get it from the db or from spooncular
    const recipe = await recipes_utils.getRecipeFullDetails(recipe_id);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
