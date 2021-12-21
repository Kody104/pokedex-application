let pokemonRepository = (function() {
  let pokemonList = [];
  let pokeTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
                   'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark',
                   'fairy'];
  let targetUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
  let nextUrl = null;
  let pokeCount = 0;

  let pokeContainer = document.querySelector('#pokemon-container');
  let lastId = null;

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /* Creates the inital document elements */
  function createDocument() {
    let pokedexBox = document.querySelector('.pokedex__box');

    let searchBtn = document.querySelector('.search_button');

    if(!searchBtn) {
      searchBtn = document.createElement('button');
      searchBtn.classList.add('search_button');
      searchBtn.innerText = 'Search';

      searchBtn.addEventListener('click', () => {
          showSearchBox();
      });

      pokedexBox.appendChild(searchBtn);
    }

    populateList();
  }

  /* The default way of updating the pokedex. Creates pokemon buttons each time it's called, until it runs
      out of pokemon to add.*/
  function populateList() {
    let pokedexBox = document.querySelector('.pokedex__box');

    // Load the list of pokemon from the api
    loadList(targetUrl).then(function(multi) {
      multi.forEach( pokemon => {
        addListItem(pokemon);
        pokeCount++;
      });

      createSearchBox();

      // Remove old button if it exists
      let oldBtn = document.querySelector('.formatted');
      if(oldBtn) {
        oldBtn.parentNode.removeChild(oldBtn);
      }

      // Create next button if there is something to create it for
      if(nextUrl !== null) {
        let nextBtn = document.createElement('button');
        nextBtn.classList.add('formatted');
        nextBtn.innerText = 'Next';

        nextBtn.addEventListener('click', () => {
          targetUrl = nextUrl;
          populateList();
        });

        pokedexBox.appendChild(nextBtn);
      }
    });
  }

  /* Adds a pokemon to the list of pokemon tracked by the application. */
  function add(pokemon) {
    if(typeof pokemon !== 'object') { // Safety check so that only objects can pass
      console.warn('You can only add objects to the respository.');
      return false;
    }
    pokemonList.push(pokemon);
    return true;
  }

  function getAll() {
    return pokemonList;
  }

  /* Calculates the bmi of a pokemon based on it's given weight and height properties. */
  function calculateBMI(pokemon) {
    let cmHeight = pokemon.height * 10;
    let kmWeight = pokemon.weight / 10;
    return ((kmWeight / cmHeight / cmHeight) * 10000).toFixed(1);
  }

  /* Loads the details of a pokemon, then loads it's description, then creates the pokebox modal. */
  function showDetails(pokemon) {
    // Wait for the details to load, then print them to console.
    loadDetails(pokemon).then(function () {
      loadDescription(pokemon).then(function() {
        showPokebox(pokemon);
      });
    });
  }

  /* Creates the search box if it doesn't exist and removes the
     visible property if it does already exists. */
  function createSearchBox() {
    let target = document.querySelector('.pokedex__list');

    if(!target) {
      console.error('Couldn\t find the pokedex list.');
      return;
    }

    let box = document.querySelector('.menubox');
    if(box) {
      box.classList.remove('menubox__visible');

      let searchBtn = document.querySelector('.search_button');

      if(!searchBtn) {
        searchBtn = document.createElement('button');
        searchBtn.classList.add('search_button');
        searchBtn.innerText = 'Search';

        searchBtn.addEventListener('click', () => {
            showSearchBox();
        });

        target.parentNode.insertBefore(searchBtn, target);
      }
      return;
    }

    box = document.createElement('div');
    box.classList.add('menubox');

    let titleText = document.createElement('h3');
    titleText.style = 'display: inline;';
    titleText.innerText = 'Type';

    let list = document.createElement('ul');
    list.classList.add('menu__list');

    let items = [];

    for(let i = 0; i < pokeTypes.length; i++) {
      let checkbox = document.createElement('input');
      checkbox.type = 'radio';
      checkbox.name = 'type';
      checkbox.value = pokeTypes[i];
      checkbox.addEventListener('change', () => {
        handleTypeCheckbox(checkbox);
      });
      let label = document.createElement('label');
      label.for = 'menu item';
      label.innerText = ' ' + capitalizeWord(pokeTypes[i]);
      label.addEventListener('click', () => {
        checkbox.checked = true;
        handleTypeCheckbox(checkbox);
      });
      let li = document.createElement('li');
      li.appendChild(checkbox);
      li.appendChild(label);
      items.push(li);
    }

    items.forEach( item => {
      list.appendChild(item);
    });

    box.appendChild(titleText);
    box.appendChild(list);
    target.parentNode.insertBefore(box, target);
  }

  /* Handles the list when a type has been checked by the user. */
  function handleTypeCheckbox(checkbox) {
    clearListItems();
    let count = 0;
    pokemonList.forEach( pokemon => {
      loadDetails(pokemon).then(function() {
        if(pokemon.types) {
          pokemon.types.forEach( type => {
            if(type.type.name === checkbox.value) {
              addListItem(pokemon);
              count++;
            }
          });
        }
      })
    });
  }

  /* Sets the searchbox to visible. */
  function showSearchBox() {
    let searchbox = document.querySelector('.menubox');

    if(searchbox) {
      searchbox.classList.add('menubox__visible');

      let searchBtn = document.querySelector('.search_button');
      searchBtn.parentNode.removeChild(searchBtn);
    }
  }

  /* Removes the pokedex list of pokemon and replaces the next button with a reset button */
  function clearListItems() {
    let pokedexBox = document.querySelector('.pokedex__box');

    let list = document.querySelector('.pokedex__list');
    if(list) {
      list.parentNode.removeChild(list);
    }
    let oldBtn = document.querySelector('.formatted');
    if(oldBtn) {
      oldBtn.parentNode.removeChild(oldBtn);
    }
    let resetBtn = document.createElement('button');
    resetBtn.classList.add('formatted');
    resetBtn.innerText = 'Reset';

    resetBtn.addEventListener('click', () => {
      pokeCount = 0;
      pokemonList = [];
      targetUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
      nextUrl = null;
      lastId = null;
      clearListItems();
      createDocument();
    });

    pokedexBox.appendChild(resetBtn);
  }

  /* Adds a pokemon's information to pokedex__box and creates a list for them
    if it doesn't already exist.*/
  function addListItem(pokemon) {
    if(!add(pokemon)) {
      return;
    }

    let pokedexBox = document.querySelector('.pokedex__box');

    let list = document.querySelector('.pokedex__list');

    if(!list) {
      list = document.createElement('ul');
      list.classList.add('pokedex__list');
      pokedexBox.appendChild(list);
    }

    let li = document.createElement('li');
    let btn = document.createElement('button');

    btn.innerText = capitalizeWord(pokemon.name);

    btn.addEventListener('click', () => { // Call your function through the event function, NOT directly!
      showDetails(pokemon);
    });

    li.appendChild(btn);
    list.appendChild(li);
  }

  /* Loads the api's json and creates the pokemon objects from it. */
  function loadList(url) {
    showLoadingMessage(null);
    // Wait for the list to return
    return fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      hideLoadingMessage();
      // The objects that were returned are used to create the pokemon
      nextUrl = json.next;
      multi = [];
      json.results.forEach(function (item) {
        let pokemon = {
          name: item.name,
          detailsUrl: item.url
        };
      // add(pokemon);
      multi.push(pokemon);
      });
      return multi; // Return a new list to add to our scrolling list of pokemon
    }).catch(function(e) {
      hideLoadingMessage();
      console.error(e);
    })
  }

  /* Gets the proporties of the pokemon by it's detailsUrl. */
  function loadDetails(item) {
    showLoadingMessage(item);
    let url = item.detailsUrl;

    return fetch(url).then(function(response) {
      return response.json();
    }).then(function(details) {
      hideLoadingMessage();
      // Set our pokemon data to the item's data
      item.id = details.id;
      if(item.id > 898) {
        item.id -= 9102; // They jump up the id by a lot here
      }
      item.imageUrl = details.sprites.front_default;
      item.speciesUrl = details.species.url;
      item.height = details.height;
      item.weight = details.weight
      item.types = details.types;
    }).catch(function(e) {
      hideLoadingMessage();
      console.log(e);
    });
  }

  /* Gets the description object of a pokemon and returns the first one
    that's in english.*/
  function loadDescription(item) {
    showLoadingMessage(item);
    let url = item.speciesUrl;
    // Wait for the species object
    return fetch(url).then(function(response) {
      return response.json();
    }).then(function(text) {
      hideLoadingMessage();
      for(let i = 0; i < text.flavor_text_entries.length; i++) {
        let entry = text.flavor_text_entries[i];
        if(entry.language.name === 'en') {
          item.description = entry.flavor_text;
          break;
        }
      }
    }).catch(function(e) {
      hideLoadingMessage();
      console.log(e);
    });
  }

  /* Lets the user know what's loading after they do an action. */
  function showLoadingMessage(resource) {
    let fillText = document.querySelector('.pokedex__text');
    if(resource === null) {
      fillText.innerText = "Loading pokemon api...";
    }
    else {
      fillText.innerText = 'Loading ' + resource.name + "...";
    }
  }

  /* Resets the loading text to display 'Pokedex'. */
  function hideLoadingMessage() {
    let fillText = document.querySelector('.pokedex__text');
    fillText.innerText = 'Pokedex';
  }

  /* Hides the pokebox from display */
  function hidePokebox() {
    pokeContainer.classList.remove('is-visible');
    lastId = null;
  }

  /* Creates the pokebox and displays the selected pokemon inside of it. */
  function showPokebox(pokemon) {
    lastId = pokemon.id - 1;

    pokeContainer.innerHTML = '';

    let pokebox = document.createElement('div');
    pokebox.classList.add('pokebox');

    let leftbox = document.createElement('div');
    leftbox.classList.add('pokebox');
    leftbox.classList.add('pokebox__left');

    let pokeTitle = document.createElement('h1');
    pokeTitle.innerText = capitalizeWord(pokemon.name) + ' #' + pokemon.id;

    let types = [];

    pokemon.types.forEach( type => {
      let pokeType = document.createElement('span');
      pokeType.classList.add('type-style');
      pokeType.classList.add('type-style__' + type.type.name);
      pokeType.innerText = capitalizeWord(type.type.name);
      types.push(pokeType);
    });

    let pokeImage = document.createElement('img');
    pokeImage.src = pokemon.imageUrl;
    pokeImage.classList.add('pokeimg');

    let rightbox = document.createElement('div');
    rightbox.classList.add('pokebox');
    rightbox.classList.add('pokebox__right');

    let contentTitle = document.createElement('h1');
    contentTitle.innerText = 'Info';

    let pokeContent = document.createElement('p');
    pokeContent.innerText = 'Height: ' + (pokemon.height / 10).toFixed(1) + 'm\nWeight: ' + (pokemon.weight / 10).toFixed(1)
    + 'kg\nBMI: ' + calculateBMI(pokemon) + '\n\nDescription: ' + pokemon.description;

    leftbox.appendChild(pokeTitle);
    leftbox.appendChild(pokeImage);
    leftbox.appendChild(document.createElement('br'));
    types.forEach(typeElement => {
      leftbox.appendChild(typeElement);
    });
    rightbox.appendChild(contentTitle);
    rightbox.appendChild(pokeContent);
    pokebox.appendChild(leftbox);
    pokebox.appendChild(rightbox);
    pokeContainer.appendChild(pokebox);

    pokeContainer.classList.add('is-visible');
  }

  window.addEventListener('keydown', (e) => {
    e.preventDefault();
    // Close if the modal box is open, otherwise we ignore
    if(pokeContainer.classList.contains('is-visible')) {
      if(e.key === 'Escape') {
        hidePokebox();
      }
      else if(lastId !== null) {
        if(e.key === 'ArrowRight' && lastId < pokeCount - 1) {
          lastId += 1;
          showDetails(pokemonList[lastId]);
        }
        else if(e.key === 'ArrowLeft' && lastId > 0) {
          lastId -= 1;
          showDetails(pokemonList[lastId]);
        }
      }
    }
  });

  pokeContainer.addEventListener('click', (e) => {
    let target = e.target;
    // If the user clicks outside of the modal box, we close
    if(target === pokeContainer) {
      hidePokebox();
    }
  });

  return {
    add: add,
    addListItem: addListItem,
    getAll: getAll,
    loadList: loadList,
    loadDetails: loadDetails,
    targetUrl: targetUrl,
    createDocument: createDocument
  };
})(); // This calls the function immediately, instead of having to call it later.

pokemonRepository.createDocument();
