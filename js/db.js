//listen for auth status changes
auth.onAuthStateChanged((user) => {
  if (user) {
    enterRecipes();
    //real-time listener
    db.collection("recipes").onSnapshot(
      (snapshot) => {
        changeSize(snapshot.size);
        //   console.log(snapshot.docChanges());
        snapshot.docChanges().forEach((change) => {
          // console.log(change, change.doc.data(), change.doc.id);
          if (change.type === "added") {
            //add the document data to the page
            renderRecipe(change.doc.data(), change.doc.id);
          }
          if (change.type === "removed") {
            //remove the document data from the web page
            removeRecipe(change.doc.id);
          }
          if (change.type === "modified") {
            //update the document data
            updateRecipe(change.doc.data(), change.doc.id);
          }
        });
      },
      (err) => {
        console.log(err.message);
      }
    );
    setupUI(user);
  } else {
    clearRecipes();
    setupUI();
  }
});

// global variables
const sideNav = document.querySelector("#side-menu");

//signUp
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get user info
  const email = signupForm["signup-email"].value;
  const password = signupForm["signup-password"].value;
  //sign up the user
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).set({
        email: email,
        pass: password,
        bio: signupForm["signup-bio"].value,
      });
    })
    .then(() => {
      //close signup modal and reset the form
      const modal = document.querySelector("#modal-signup");
      M.Sidenav.getInstance(sideNav).close();
      M.Modal.getInstance(modal).close();
      signupForm.reset();
      signupForm.querySelector(".error").innerHTML = "";
      M.toast({
        html: `Nice to See You!!👋🏼 ${email}`,
        displayLength: 4000,
        outDuration: 1000,
      });
    })
    .catch((err) => {
      signupForm.querySelector(".error").innerHTML = err.message;
    });
});

//logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    M.Sidenav.getInstance(sideNav).close();
    M.toast({
      html: "See you again!!🔜",
      displayLength: 4000,
      outDuration: 1000,
    });
  });
});

//login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // get user info
  const email = loginForm["login-email"].value;
  const password = loginForm["login-password"].value;
  //login user
  auth
    .signInWithEmailAndPassword(email, password)
    .then((cred) => {
      //close login modal and reset the form
      const modal = document.querySelector("#modal-login");
      M.Sidenav.getInstance(sideNav).close();
      M.Modal.getInstance(modal).close();
      loginForm.reset();
      loginForm.querySelector(".error").innerHTML = "";
      M.toast({
        html: `Nice to see you again!😃 ${email}`,
        displayLength: 4000,
        outDuration: 1000,
      });
    })
    .catch((err) => {
      loginForm.querySelector(".error").innerHTML = err.message;
    });
});

//offline data with indexedDB
db.enablePersistence().catch((err) => {
  if (err.code == "failed-precondition") {
    //multiple tabs open at once
    console.log("persistence failed!");
  } else if (err.code == "unimplemented") {
    //lack of browser support
    console.log("persistence is not available.");
  }
});

//add new recipe
const form = document.querySelector(".add-recipe");
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value,
  };
  db.collection("recipes")
    .add(recipe)
    .then(() => {
      const modal = document.querySelector(".add-modal");
      M.Modal.getInstance(modal).close();
      form.title.value = "";
      form.ingredients.value = "";
      M.toast({
        html: `${recipe.title} Added`,
        displayLength: 2000,
        outDuration: 1000,
      });
    })
    .catch((err) => console.log(err.message));
  form.title.value = "";
  form.ingredients.value = "";
});

//delete a recipe
const recipeContainer = document.querySelector(".recipes");
const updateForm = document.querySelector(".update-recipe");
recipeContainer.addEventListener("click", (evt) => {
  const id = evt.target.getAttribute("data-id");
  if (evt.target.classList.contains("delete-recipe")) {
    const recipe = document.querySelector(`div[data-id="${id}"]`);
    const recipeTitle = recipe.querySelector(".recipe-title").textContent;
    M.toast({
      html: `${recipeTitle} Deleted`,
      displayLength: 2000,
      outDuration: 1000,
    });
    db.collection("recipes").doc(id).delete();
  } else if (evt.target.classList.contains("edit-recipe")) {
    document.querySelector(".update-form").setAttribute("data-id", id);
    const title = document.querySelector(`div[data-id="${id}"] .recipe-title`)
      .textContent;
    const ingredients = document.querySelector(
      `div[data-id="${id}"] .recipe-ingredients`
    ).textContent;
    updateForm["uptitle"].value = title;
    updateForm["upingredients"].value = ingredients;
  }
});

// update recipe
updateForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const dataId = document.querySelector(".update-form").getAttribute("data-id");
  const recipe = {
    title: updateForm.uptitle.value,
    ingredients: updateForm.upingredients.value,
  };
  db.collection("recipes")
    .doc(dataId)
    .update(recipe)
    .then(() => {
      const modal = document.querySelector(".update-form");
      M.Modal.getInstance(modal).close();
      M.toast({
        html: `${recipe.title} Updated`,
        displayLength: 2000,
        outDuration: 1000,
      });
    })
    .catch((err) => console.log(err.message));
});
