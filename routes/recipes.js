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



router.post("/addNewRecipe", async (req, res, next) => {
  try
  {
    let recipe_details = {
      user_id: req.session.user_id,
      title: req.body.title,
      image: req.body.image,
      ready_in_minutes: req.body.ready_in_minutes,
      summary: req.body.summary,
      servings: req.body.servings,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      is_gluten_free: req.body.is_gluten_free,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions
    }
    recipe_id = await recipes_utils.addNewRecipe(recipe_details);
    res.status(201).send({ message: "Recipe has been successfully created.", success: true });
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


module.exports = router;
