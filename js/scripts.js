let pokemonRepository = (function() {
  let pokemonList = [{
    name: 'Bulbasaur',
    height: 0.7,
    weight: 6.9,
    type: ['Grass', 'Poison']
  }, {
    name: 'Ivysaur',
    height: 1.0,
    weight: 13.0,
    type: ['Grass', 'Poison']
  }, {
    name: 'Venusaur',
    height: 2.0,
    weight: 100.0,
    type: ['Grass', 'Poison']
  }, {
    name: 'Charmander',
    height: 0.6,
    weight: 8.5,
    type: ['Fire']
  }, {
    name: 'Charmeleon',
    height: 1.1,
    weight: 19.0,
    type: ['Fire']
  }, {
    name: 'Charizard',
    height: 1.7,
    weight: 90.5,
    type: ['Fire', 'Flying']
  }, {
    name: 'Squirtle',
    height: 0.5,
    weight: 9.0,
    type: ['Water']
  }, {
    name: 'Wartortle',
    height: 1.0,
    weight: 22.5,
    type: ['Water']
  }, {
    name: 'Blastoise',
    height: 1.6,
    weight: 85.5,
    type: ['Water']
  }];

  function add(pokemon) {
    if(typeof pokemon !== 'object') { // Safety check so that only objects can pass
      console.warn('You can only add objects to the respository!');
      return;
    }
    Object.keys(pokemon).forEach( key => { // Safety check for all the key-value pairs we want
      if(key !== 'name' && key !== 'height' && key !== 'weight' && key !== 'type') {
        console.warn('Unexpected key-value pair in this object!');
        return;
      }
      else {
        if(key === 'type' && !(Array.isArray(pokemon[key]))) { // Safety check for type being an array
          console.warn('The type of a pokemon needs to be an array!');
          return;
        }
      }
    });
    pokemonList.push(pokemon);
  }

  function getAll() {
    return pokemonList;
  }

  function getPokemon(name) {
    return pokemonList.filter(pokemon => name.toLowerCase() === pokemon.name.toLowerCase()); // Make sure it's not case-sensitive
  }

  return {
    add: add,
    getAll: getAll,
    getPokemon: getPokemon
  };
})(); // This calls the function immediately, instead of having to call it later.

function calculateBMI(pokemon) {
  let cmHeight = pokemon.height * 100;
  return ((pokemon.weight / cmHeight / cmHeight) * 10000).toFixed(1);
}

document.write('Currently added pokemon to the pokedex: ')

pokemonRepository.getAll().forEach( pokemon => {
  let bmi = calculateBMI(pokemon);
  document.write('<br>' + pokemon.name + ' - BMI ' + bmi);
  if(bmi >= 25.0) {
    document.write(' (<i>If this pokemon were human, they would be considered</i> <b>overweight!</b>) ');
  }
  else if(bmi <= 18.5) {
    document.write(' (<i>If this pokemon were human, they would be considered</i> <b>underweight!</b>) ')
  }
} );
