let pokemonRepository = (function() {
  let pokemonList = [];
  let targetUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
  let nextUrl = null;
  let pokeCount = 0;

  let pokeContainer = document.querySelector('#pokemon-container');
  let lastId = null;

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function populateList() {
    let pokedexBox = document.querySelector('.pokedex__box');

    // Load the list of pokemon from the api
    loadList(targetUrl).then(function(multi) {
      multi.forEach( pokemon => {
        addListItem(pokemon);
        pokeCount++;

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
    });
  }

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
    let cmHeight = pokemon.height * 10;
    let kmWeight = pokemon.weight / 10;
    return ((kmWeight / cmHeight / cmHeight) * 10000).toFixed(1);
  }

  function showDetails(pokemon) {
    // Wait for the details to load, then print them to console.
    loadDetails(pokemon).then(function () {
      loadDescription(pokemon).then(function() {
        showPokebox(pokemon);
      });
    });
  }

  function addListItem(pokemon) {
    if(!add(pokemon)) {
      return;
    }

    let list = document.querySelector('ul');
    let li = document.createElement('li');
    let btn = document.createElement('button');

    btn.innerText = capitalizeWord(pokemon.name);

    btn.addEventListener('click', () => { // Call your function through the event function, NOT directly!
      showDetails(pokemon);
    });

    li.appendChild(btn);
    list.appendChild(li);
  }

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
    fillText.innerText = 'Pokedex';
  }

  function hidePokebox() {
    pokeContainer.classList.remove('is-visible');
    lastId = null;
  }

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

    let pokeContent = document.createElement('p');
    pokeContent.innerText = 'Height: ' + (pokemon.height / 10).toFixed(1) + 'm\nWeight: ' + (pokemon.weight / 10).toFixed(1)
    + 'kg\nBMI: ' + calculateBMI(pokemon) + '\nDescription: ' + pokemon.description;

    leftbox.appendChild(pokeTitle);
    leftbox.appendChild(pokeImage);
    leftbox.appendChild(document.createElement('br'));
    types.forEach(typeElement => {
      leftbox.appendChild(typeElement);
    });
    pokebox.appendChild(leftbox);
    pokebox.appendChild(pokeContent);
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
      if(lastId !== null) {
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
    populateList: populateList
  };
})(); // This calls the function immediately, instead of having to call it later.

pokemonRepository.populateList();
