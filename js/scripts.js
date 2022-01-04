let pokemonRepository = (function() {
  let pokemonList = [];
  let pokeTypes = [
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy'
  ];
  let targetUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
  let nextUrl = null;

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /* Creates the inital document elements */
  function createDocument() {
    let pokedexBox = $('.pokedex-box');

    let searchBtn = $('#search-button');

    if (!searchBtn.get(0)) {
      searchBtn = $('<button>');
      searchBtn.attr('id', 'search-button');
      searchBtn.addClass('btn');
      searchBtn.text('Search');

      searchBtn.on('click', () => {
        showSearchBox();
      });

      pokedexBox.append(searchBtn);
    }

    populateList();
  }

  /* The default way of updating the pokedex. Creates pokemon buttons each time it's called, until it runs
      out of pokemon to add.*/
  function populateList() {
    let pokedexBox = $('.pokedex-box');

    // Load the list of pokemon from the api
    loadList(targetUrl).then(function(multi) {
      multi.forEach(pokemon => {
        addListItem(pokemon);
      });

      createSearchBox();

      // Remove old button if it exists
      let oldBtn = $('.formatted');
      if (oldBtn.get(0)) {
        oldBtn.remove();
      }

      // Create next button if there is something to create it for
      if (nextUrl !== null) {
        let nextBtn = $('<button>');
        nextBtn.addClass('formatted formatted__secondary btn');
        nextBtn.text('Next');

        nextBtn.on('click', () => {
          targetUrl = nextUrl;
          populateList();
        });

        pokedexBox.append(nextBtn);
      }
    });
  }

  /* Adds a pokemon to the list of pokemon tracked by the application. */
  function add(pokemon) {
    if (typeof pokemon !== 'object') {
      // Safety check so that only objects can pass
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
    loadDetails(pokemon).then(function() {
      loadDescription(pokemon).then(function() {
        showPokebox(pokemon);
      });
    });
  }

  /* Creates the search box if it doesn't exist and removes the
     visible property if it does already exists. */
  function createSearchBox() {
    let target = $('.pokedex-list');

    if (!target) {
      console.error('Couldn\'t find the pokedex list.');
      return;
    }

    let box = $('.menubox');
    if (box.get(0)) {
      box.removeClass('menubox__visible');

      let searchBtn = $('#search-button');

      if (!searchBtn.get(0)) {
        searchBtn = $('<button>');
        searchBtn.attr('id', 'search-button');
        searchBtn.addClass('btn');
        searchBtn.text('Search');

        searchBtn.on('click', () => {
          showSearchBox();
        });

        searchBtn.insertBefore(target);
      }
      return;
    }

    box = $('<div>');
    box.addClass('menubox');

    let titleText = $('<h3>');
    titleText.css('display', 'inline');
    titleText.text('Type ');

    let list = $('<ul>');
    list.addClass('menu__list container');

    let div = $('<div>');
    div.addClass('row');
    list.append(div);

    let items = [];

    for (let i = 0; i < pokeTypes.length; i++) {
      let checkbox = $('<input>');
      checkbox.prop({
        type: 'radio',
        id: 'pokeType',
        name: 'type',
        value: pokeTypes[i]
      });
      checkbox.on('change', () => {
        handleTypeCheckbox(checkbox);
      });
      let label = $('<label>');
      label.prop({ for: 'menu-item' });
      label.text('' + capitalizeWord(pokeTypes[i]));
      label.on('click', () => {
        checkbox.prop('checked', true);
        handleTypeCheckbox(checkbox);
      });
      let li = $('<li>');
      li.addClass('col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2');
      li.append(checkbox);
      li.append(label);
      items.push(li);
    }

    items.forEach(item => {
      div.append(item);
    });

    box.append(titleText);
    box.append(list);
    box.insertBefore(target);
  }

  /* Handles the list when a type has been checked by the user. */
  function handleTypeCheckbox(checkbox) {
    clearListItems();
    comparePokemonToType(checkbox);
  }

  function comparePokemonToType(checkbox) {
    let promiseArray = [];
    pokemonList.forEach(pokemon => {
      let promise = new Promise(function(resolve) {
        loadDetails(pokemon).then(function() {
          showLoadingMessage(pokemon, 'Indexing');
          resolve(pokemon);
        });
      });
      promiseArray.push(promise);
    });
    Promise.all(promiseArray).then(function(items) {
      pokemonList = [];
      /* Compare the selected type to the pokemon's types */
      items.forEach(item => {
        item.types.forEach(type => {
          if (type.type.name == checkbox.prop('value')) {
            addListItem(item);
          }
        });
      });
      hideLoadingMessage();
    });
  }

  /* Sets the searchbox to visible. */
  function showSearchBox() {
    let searchbox = $('.menubox');

    if (searchbox.get(0)) {
      searchbox.addClass('menubox__visible');

      let searchBtn = $('#search-button');
      searchBtn.remove();
    }
  }

  /* Removes the pokedex list of pokemon and replaces the next button with a reset button */
  function clearListItems() {
    let pokedexBox = $('.pokedex-box');

    let list = $('.pokedex-list');
    if (list.get(0)) {
      list.remove();
    }
    let oldBtn = $('.formatted');
    if (oldBtn.get(0)) {
      oldBtn.remove();
    }
    let resetBtn = $('<button>');
    resetBtn.addClass('formatted btn');
    resetBtn.text('Reset');

    resetBtn.on('click', () => {
      pokemonList = [];
      targetUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
      nextUrl = null;
      clearListItems();
      createDocument();
    });

    pokedexBox.append(resetBtn);
  }

  /* Adds a pokemon's information to pokedex-box and creates a list for them
    if it doesn't already exist.*/
  function addListItem(pokemon) {
    if (!add(pokemon)) {
      return;
    }

    let pokedexBox = $('.pokedex-box');

    let list = $('.pokedex-list');
    let div;

    if (!list.get(0)) {
      list = $('<ul>');
      list.addClass('pokedex-list container');
      div = $('<div>');
      div.addClass('row');
      list.append(div);
      pokedexBox.append(list);
    }

    div = $('.row').last();

    let li = $('<li>');
    li.addClass('col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2');
    let btn = $('<button>');
    btn.addClass('list-btn btn');

    btn.text(capitalizeWord(pokemon.name));

    btn.on('click', () => {
      // Call your function through the event function, NOT directly!
      showDetails(pokemon);
    });

    li.append(btn);
    div.append(li);
  }

  /* Loads the api's json and creates the pokemon objects from it. */
  function loadList(url) {
    showLoadingMessage(null);
    // Wait for the list to return
    return $.ajax(url, { dataType: 'json' })
      .then(function(json) {
        hideLoadingMessage();
        // The objects that were returned are used to create the pokemon
        nextUrl = json.next;
        let multi = [];
        json.results.forEach(function(item) {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url
          };
          multi.push(pokemon);
        });
        return multi; // Return a new list to add to our scrolling list of pokemon
      })
      .catch(function(e) {
        hideLoadingMessage();
        console.error(e);
      });
  }

  /* Gets the proporties of the pokemon by it's detailsUrl. */
  function loadDetails(item) {
    showLoadingMessage(item);
    let url = item.detailsUrl;

    return $.ajax(url, { dataType: 'json' })
      .then(function(details) {
        hideLoadingMessage();
        // Set our pokemon data to the item's data
        item.id = details.id;
        if (item.id > 898) {
          item.id -= 9102; // They jump up the id by a lot here
        }
        item.imageUrl = details.sprites.front_default;
        item.speciesUrl = details.species.url;
        item.height = details.height;
        item.weight = details.weight;
        item.types = details.types;
      })
      .catch(function(e) {
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
    return $.ajax(url, { dataType: 'json' })
      .then(function(text) {
        hideLoadingMessage();
        for (let i = 0; i < text.flavor_text_entries.length; i++) {
          let entry = text.flavor_text_entries[i];
          if (entry.language.name === 'en') {
            item.description = entry.flavor_text;
            break;
          }
        }
      })
      .catch(function(e) {
        hideLoadingMessage();
        console.log(e);
      });
  }

  /* Lets the user know what's loading after they do an action. */
  function showLoadingMessage(resource, optText) {
    let target = $('.pokedex-text');
    let fillText = $('<h2>');
    // If the optional text is passed to this
    if (optText && optText !== null) {
      fillText.text(optText + ' ' + resource.name + '...');
    }
    // Otherwise, default text is displayed
    else {
      if (resource === null) {
        fillText.text('Loading pokemon api...');
      } else {
        fillText.text('Loading ' + resource.name + '...');
      }
    }
    let loadingDiv = $('<div class="spinner-border text-yellow" role="status"><span class="sr-only">Loading...</span>');
    target.empty();
    target.append(fillText);
    target.append(loadingDiv);
  }

  /* Resets the loading text to display 'Pokedex'. */
  function hideLoadingMessage() {
    let target = $('.pokedex-text');
    let fillText = $('<h2>');
    fillText.text('Pokedex');
    target.empty();
    target.append(fillText);
  }

  /* Creates the pokebox and displays the selected pokemon inside of it. */
  function showPokebox(pokemon) {
    let modalTitle = $('.modal-title');
    let modalBody = $('.modal-body');

    modalTitle.empty();
    modalBody.empty();

    let leftbox = $('<div>');
    leftbox.addClass('pokebox pokebox__left');

    let pokeTitle = $('<h1>');
    pokeTitle.text(capitalizeWord(pokemon.name));

    let types = [];

    pokemon.types.forEach(type => {
      let pokeType = $('<span>');
      pokeType.addClass('type-style');
      pokeType.addClass('type-style__' + type.type.name);
      pokeType.text(capitalizeWord(type.type.name));
      types.push(pokeType);
    });

    let pokeImage = $('<img>').prop({
      src: pokemon.imageUrl
    });
    pokeImage.addClass('pokeimg modal-img');

    pokeImage.on('dblclick', () => {
      pokeImage.css('animation-name', 'rotate3D');
      pokeImage.css('animation-duration', '1s');
      pokeImage.css('animation-iteration-count', '1');
    });

    let rightbox = $('<div>');
    rightbox.addClass('pokebox pokebox__right');

    let contentTitle = $('<h1>');
    contentTitle.text('Info');

    let pokeContent = $('<p>');
    pokeContent.html(
      'Height: ' +
        (pokemon.height / 10).toFixed(1) +
        'm<br>Weight: ' +
        (pokemon.weight / 10).toFixed(1) +
        'kg<br>BMI: ' +
        calculateBMI(pokemon) +
        '<br><br>Description: ' +
        pokemon.description
    );

    leftbox.append(pokeTitle);
    leftbox.append(pokeImage);
    leftbox.append('<br>');
    types.forEach(typeElement => {
      leftbox.append(typeElement);
    });
    rightbox.append(contentTitle);
    rightbox.append(pokeContent);
    modalBody.append(leftbox);
    modalBody.append(rightbox);
    $('#pokemon-container').modal();
  }

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
