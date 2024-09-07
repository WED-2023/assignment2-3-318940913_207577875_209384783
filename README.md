<h1>Recipe Management Backend API</h1>

<h2>Overview</h2>
<p>This is the backend API for a Recipe Management Application. It provides endpoints for managing user accounts, recipes, favorites, and meal planning. The API is built using <strong>Node.js</strong> and <strong>Express.js</strong>, with <strong>MySQL</strong> as the database for storing user and recipe data. It integrates with the <strong>Spoonacular API</strong> for retrieving recipe details and supports user authentication and session management.</p>

<h2>API Endpoints Description</h2>

<h3>User Registration and Authentication</h3>

<h4>Register</h4>
<ul>
  <li><strong>Path:</strong> <code>/auth/Register</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Allows new users to register for the application.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>username</code>: String, 3-8 alphabetic characters.</li>
      <li><code>firstname</code>, <code>lastname</code>: String, alphabetic characters only.</li>
      <li><code>country</code>: String.</li>
      <li><code>password</code>: String, 5-10 characters, includes at least one number and one special character.</li>
      <li><code>email</code>: Valid email format.</li>
    </ul>
  </li>
</ul>

<h4>Login</h4>
<ul>
  <li><strong>Path:</strong> <code>/auth/Login</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Allows existing users to log in to their accounts.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>username</code>: String.</li>
      <li><code>password</code>: String.</li>
    </ul>
  </li>
  <li><strong>Returns:</strong> Session cookie for authenticated requests.</li>
</ul>

<h4>Logout</h4>
<ul>
  <li><strong>Path:</strong> <code>/auth/Logout</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Logs out the current user and destroys their session.</li>
</ul>

<h3>Recipe Management</h3>

<h4>Get Random Recipes</h4>
<ul>
  <li><strong>Path:</strong> <code>/recipes/random</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Retrieves a specified number of random recipes.</li>
  <li><strong>Query Parameters:</strong>
    <ul>
      <li><code>number</code>: Optional, number of recipes to retrieve (default: 3).</li>
    </ul>
  </li>
</ul>

<h4>Search Recipes</h4>
<ul>
  <li><strong>Path:</strong> <code>/recipes/search</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Searches for recipes based on the specified criteria.</li>
  <li><strong>Query Parameters:</strong>
    <ul>
      <li><code>recipeName</code>, <code>cuisine</code>, <code>diet</code>, <code>intolerance</code>: Search filters.</li>
      <li><code>number</code>: Number of results to return.</li>
      <li><code>sort</code>: Sorting criteria.</li>
    </ul>
  </li>
</ul>

<h4>Get Recipe Details</h4>
<ul>
  <li><strong>Path:</strong> <code>/recipes/recipe/:recipe_id</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Retrieves full details for a specific recipe by its ID.</li>
</ul>

<h3>User Favorites</h3>

<h4>Add to Favorites</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/FavoritesRecipes</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Adds a recipe to the logged-in user's favorites list.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipeId</code>: ID of the recipe to add.</li>
    </ul>
  </li>
</ul>

<h4>Get Favorites</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/FavoritesRecipes</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Retrieves all favorite recipes of the logged-in user.</li>
</ul>

<h4>Remove from Favorites</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/FavoritesRecipes</code></li>
  <li><strong>Method:</strong> <code>DELETE</code></li>
  <li><strong>Description:</strong> Removes a recipe from the user's favorites list.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipeId</code>: ID of the recipe to remove.</li>
    </ul>
  </li>
</ul>

<h3>Meal Planning</h3>

<h4>Get User Meal</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/MyMeal</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Retrieves all recipes currently in the logged-in user's meal plan.</li>
</ul>

<h4>Add to Meal Plan</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/MyMeal</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Adds a recipe to the user's meal plan.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipeId</code>: ID of the recipe to add.</li>
    </ul>
  </li>
</ul>

<h4>Update Meal Plan</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/MyMeal</code></li>
  <li><strong>Method:</strong> <code>PUT</code></li>
  <li><strong>Description:</strong> Updates the order of recipes in the user's meal plan.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipes_order_id</code>: Array of recipe IDs in the desired order.</li>
    </ul>
  </li>
</ul>

<h4>Remove from Meal Plan</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/MyMeal</code></li>
  <li><strong>Method:</strong> <code>DELETE</code></li>
  <li><strong>Description:</strong> Removes a recipe from the user's meal plan.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipeId</code>: ID of the recipe to remove.</li>
    </ul>
  </li>
</ul>

<h3>Last Viewed Recipes</h3>

<h4>Update Last Viewed</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/LastViewedRecipes</code></li>
  <li><strong>Method:</strong> <code>POST</code></li>
  <li><strong>Description:</strong> Saves a recipe in the user's last viewed list.</li>
  <li><strong>Body Parameters:</strong>
    <ul>
      <li><code>recipeId</code>: ID of the recipe.</li>
    </ul>
  </li>
</ul>

<h4>Get Last Viewed</h4>
<ul>
  <li><strong>Path:</strong> <code>/users/LastViewedRecipes</code></li>
  <li><strong>Method:</strong> <code>GET</code></li>
  <li><strong>Description:</strong> Retrieves the list of last viewed recipes for the logged-in user.</li>
</ul>

<h2>Installation Instructions</h2>

<p>To run this backend API locally:</p>

<h3>1. Clone the Repository</h3>
<pre><code>git clone https://github.com/your-repo/backend-api.git
cd backend-api
</code></pre>

<h3>2. Install Backend Dependencies</h3>
<p>Run the following commands to install the required packages:</p>
<pre><code>npm install
npm install --legacy-peer-deps
npm install --force
npm install dotenv
npm install dotenv --legacy-peer-deps
npm install dotenv --force
npm cache clean --force
npm install bootstrap-vue axios bootstrap
npm audit fix --force
</code></pre>

<h3>3. Set Up MySQL Database</h3>
<ul>
  <li>Install MySQL and create a new database:
  <pre><code>CREATE DATABASE recipe_management;
  </code></pre>
  </li>
  <li>Import the database schema:
  <pre><code>mysql -u yourusername -p recipe_management &lt; schema.sql
  </code></pre>
  </li>
</ul>

<h3>4. Configure Environment Variables</h3>
<p>Create a <code>.env</code> file in the root directory of the project:</p>
<pre><code>DB_HOST=localhost
DB_USER=yourusername
DB_PASSWORD=yourpassword
DB_NAME=recipe_management
JWT_SECRET=your_jwt_secret
SPOONCULAR_API_KEY=your_spoonacular_api_key
</code></pre>

<h3>5. Run the Backend Server</h3>
<pre><code>npm start
</code></pre>

<h3>6. Access the API</h3>
<p>Open your browser or API client (like Postman) and navigate to <code>http://localhost:80</code> to access the backend endpoints.</p>

<h2>Contributing</h2>
<p>Contributions are welcome! Please fork the repository and create a pull request with your changes.</p>

<h2>License</h2>
<p>This project is licensed under the MIT License.</p>

<h2>Contact</h2>
<p>For questions, please refer to the project forum or contact the development team through the repository's contact information.</p>
