const form = document.querySelector('#anime-form');
const watchlist = document.querySelector('#watchlist');

// Check if there are any anime in local storage
let animeList = JSON.parse(localStorage.getItem('animeList')) || [];

// Render anime from local storage on page load
renderAnime();

// Add event listener to the form
form.addEventListener('submit', function(e) {
  e.preventDefault();

  // Get form data
  const name = form.name.value;
  const genre = form.genre.value;
  const image = form.image.value;

  // Create anime object
  const anime = {
    name,
    genre,
    image
  };

  // Add anime to animeList array
  animeList.push(anime);

  // Save animeList to local storage
  localStorage.setItem('animeList', JSON.stringify(animeList));

  // Clear form fields
  form.reset();

  // Render anime
  renderAnime();
});

// Render anime from animeList array
function renderAnime() {
  // Clear watchlist
  watchlist.innerHTML = '';

  // Loop through animeList array and create anime cards
  animeList.forEach(function(anime) {
    // Create anime card
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime');

    // Add anime image
    const img = document.createElement('img');
    img.src = anime.image;
    animeCard.appendChild(img);

    // Add anime name
    const h2 = document.createElement('h2');
    h2.textContent = anime.name;
    animeCard.appendChild(h2);

    // Add anime genre
    const p = document.createElement('p');
    p.textContent = anime.genre;
    animeCard.appendChild(p);

    // Add anime card to watchlist
    watchlist.appendChild(animeCard);
  });
}
