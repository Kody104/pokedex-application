let pokemonList = [{
  name: 'Bulbasaur',
  natDexRank: 1,
  height: 0.7,
  weight: 6.9,
  type: ['Grass', 'Poison']
}, {
  name: 'Ivysaur',
  natDexRank: 2,
  height: 1.0,
  weight: 13.0,
  type: ['Grass', 'Poison']
}, {
  name: 'Venusaur',
  natDexRank: 3,
  height: 2.0,
  weight: 100.0,
  type: ['Grass', 'Poison']
}, {
  name: 'Charmander',
  natDexRank: 4,
  height: 0.6,
  weight: 8.5,
  type: ['Fire']
}, {
  name: 'Charmeleon',
  natDexRank: 5,
  height: 1.1,
  weight: 19.0,
  type: ['Fire']
}, {
  name: 'Charizard',
  natDexRank: 6,
  height: 1.7,
  weight: 90.5,
  type: ['Fire', 'Flying']
}, {
  name: 'Squirtle',
  natDexRank: 7,
  height: 0.5,
  weight: 9.0,
  type: ['Water']
}, {
  name: 'Wartortle',
  natDexRank: 8,
  height: 1.0,
  weight: 22.5,
  type: ['Water']
}, {
  name: 'Blastoise',
  natDexRank: 9,
  height: 1.6,
  weight: 85.5,
  type: ['Water']
}];

function calculateBMI(pokemon) {
  let cmHeight = pokemon.height * 100;
  return ((pokemon.weight / cmHeight / cmHeight) * 10000).toFixed(1);
}

document.write('Currently added pokemon to the pokedex: ')
for(let i = 0; i < pokemonList.length; i++) {
  let bmi = calculateBMI(pokemonList[i]);
  document.write('<br>' + pokemonList[i].name + ' - BMI ' + bmi);
  if(bmi >= 25.0) {
    document.write(' (<b>If this pokemon were human, they would be considered overweight!</b>) ');
  }
  else if(bmi <= 18.5) {
    document.write(' (<b>If this pokemon were human, they would be considered underweight!</b>) ')
  }
  if(i !== pokemonList.length - 1) {
    document.write(', ');
  }
}
