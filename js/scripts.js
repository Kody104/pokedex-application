let pokemonRepository = (function() {
  let pokemonList = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';

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

  function calculateBMI(pokemon) {
    let cmHeight = pokemon.height * 100;
    return ((pokemon.weight / cmHeight / cmHeight) * 10000).toFixed(1);
  }

  function showDetails(pokemon) {
    // Wait for the details to load, then print them to console.
    loadDetails(pokemon).then(function () {
      console.log(pokemon);
    });
  }

  function addListItem(pokemon) {
    if(!(add(pokemon))) {
      console.warn('Couldn\'t add ' + pokemon.name + ' to the list.');
      return;
    }
    let list = document.querySelector('ul');
    let li = document.createElement('li');
    let btn = document.createElement('button');

    btn.innerText = pokemon.name;
    //btn.classList.add('pokedex__list');
    btn.addEventListener('click', () => { // Call your function through the event function, NOT directly!
      showDetails(pokemon);
    });
    li.appendChild(btn);
    list.appendChild(li);
  }

  function loadList() {
    showLoadingMessage(null);
    // Wait for the list to return
    return fetch(apiUrl).then(function(response) {
      return response.json();
    }).then(function(json) {
      hideLoadingMessage();
      // The objects that were returned are used to create the pokemon
      json.results.forEach(function (item) {
        let pokemon = {
          name: item.name,
          detailsUrl: item.url
        };
        add(pokemon);
      });
    }).catch(function(e) {
      hideLoadingMessage();
      console.error(e);
    })
  }

  function loadDetails(item) {
    showLoadingMessage(item);
    let url = item.detailsUrl;
    // Wait for the details to load
    return fetch(url).then(function(response) {
      return response.json();
    }).then(function(details) {
      hideLoadingMessage();
      // Set our pokemon data to the item's data
      item.imageUrl = details.sprites.front_default;
      item.height = details.height;
      item.weight = details.weight
      item.types = details.types;
    }).catch(function(e) {
      hideLoadingMessage();
      console.log(e);
    });
  }

  function showLoadingMessage(resource) {
    let fillText = document.querySelector('.pokedex__text');
    if(resource === null) {
      fillText.innerText = "Loading pokemon api...";
    }
    else {
      fillText.innerText = 'Loading ' + resource.name + "...";
    }
  }

  function hideLoadingMessage() {
    let fillText = document.querySelector('.pokedex__text');
    fillText.innerText = 'Currently added pokemon: ';
  }

  return {
    add: add,
    addListItem: addListItem,
    getAll: getAll,
    loadList: loadList,
    loadDetails: loadDetails
  };
})(); // This calls the function immediately, instead of having to call it later.

pokemonRepository.loadList().then(function() {
  pokemonRepository.getAll().forEach(function(pokemon) {
    pokemonRepository.addListItem(pokemon);
  });
});
