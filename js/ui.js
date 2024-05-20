const recipes = document.querySelector(".recipes");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const accountDetails = document.querySelector(".account-details");

const setupUI = (user) => {
  if (user) {
    //acc info
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const html = `
      <div>Logged in as ${user.email}</div>
      <div>${doc.data().bio}</div>
      `;
        accountDetails.innerHTML = html;
      });
    //toggle UI elements
    loggedInLinks.forEach((item) => (item.style.display = "block"));
    loggedOutLinks.forEach((item) => (item.style.display = "none"));
  } else {
    //hide acc info
    accountDetails.innerHTML = "";
    //toggle UI elements
    loggedInLinks.forEach((item) => (item.style.display = "none"));
    loggedOutLinks.forEach((item) => (item.style.display = "block"));
  }
};
document.addEventListener("DOMContentLoaded", function () {
  // nav menu
  const menus = document.querySelector(".side-menu");
  M.Sidenav.init(menus, { edge: "right" });
  // modals
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);
});
//render recipe data
const renderRecipe = (data, id) => {
  const html = `<div class="card sticky-action recipe" data-id="${id}">
  <div class="card-image waves-effect waves-block waves-light">
    <img class="activator" src="https://source.unsplash.com/400x200/weekly?${data.title
      .split(" ")
      .join(",")}" onerror="this.src='./img/recipe.webp'" />
  </div>
  <div class="card-content">
  <i class="material-icons activator right">more_vert</i>
    <span class="card-title recipe-title grey-text text-darken-4"
      >${data.title}</span>
    <span class="activator light-blue-text darken-3">See Ingredients</span>
  </div>
  <div class="card-action">
    <a
      class="waves-effect waves-light edit-recipe modal-trigger"
      data-id="${id}"
      data-target="update-form1"
      >Update</a>
    <a class="waves-effect waves-light delete-recipe" data-id="${id}">Delete</a>
  </div>
  <div class="card-reveal">
  <i class="material-icons card-title right">close</i>
    <span class="card-title recipe-title grey-text text-darken-4"
      >${data.title}</span>
    <p class="recipe-ingredients">${data.ingredients}</p>
  </div>
</div>`;
  recipes.innerHTML += html;
};
//remove recipe from doc
const removeRecipe = (id) => {
  const recipe = document.querySelector(`div[data-id="${id}"]`);
  recipe.remove();
};
//update document
const updateRecipe = (data, id) => {
  const recipe = document.querySelector(`div[data-id="${id}"]`);
  const recipeTitle = recipe.querySelectorAll(".recipe-title");
  const recipeIngredients = recipe.querySelector(".recipe-ingredients");
  recipeIngredients.textContent = data.ingredients;
  recipeTitle.forEach((title) => (title.textContent = data.title));
};
const enterRecipe = document.querySelector(".enter-recipe");
const signupPage = document.querySelector(".signup-page");
//enter recipes
const enterRecipes = () => {
  enterRecipe.innerHTML = `<span class="new badge" data-badge-caption="Recipes"></span>`;
  signupPage.innerHTML = "";
};
const changeSize = (size) => {
  enterRecipe.querySelector("span").textContent = size;
};
//clear recipes
const clearRecipes = () => {
  signupPage.innerHTML = `
  <div class="entry-page center">
  <h5 class="center grey-text"> Login to View Recipes</h5>
  <div>
  <a
  href="#"
  class="waves-effect modal-trigger btn"
  data-target="modal-signup"
  ><i class="material-icons right">person_add</i> Sign up</a
>
<a href="#" class="waves-effect modal-trigger btn" data-target="modal-login"
><i class="material-icons right">person_pin</i> Login</a
>
</div>
</div>
  `;
  recipes.innerHTML = "";
  enterRecipe.innerHTML = "";
};
