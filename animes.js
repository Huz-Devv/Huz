const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
const animeListContainer = document.getElementById('anime-list');

function renderAnimeList() {
  animeListContainer.innerHTML = '';
  animeList.forEach((anime, index) => {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');

    const animeImage = document.createElement('img');
    animeImage.src = anime.image || 'path/to/placeholder/image.png';
    animeCard.appendChild(animeImage);

    const animeName = document.createElement('h2');
    animeName.textContent = anime.name;
    animeCard.appendChild(animeName);

    const animeGenre = document.createElement('p');
    animeGenre.textContent = anime.genre;
    animeCard.appendChild(animeGenre);

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.classList.add('edit-btn');
    editBtn.addEventListener('click', () => editAnime(index));
    animeCard.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteAnime(index));
    animeCard.appendChild(deleteBtn);

    animeListContainer.appendChild(animeCard);
  });
}

function editAnime(index) {
  const anime = animeList[index];
  const newName = prompt('Edit anime name:', anime.name);
  const newGenre = prompt('Edit anime genre:', anime.genre);
  const newImage = prompt('Edit anime image URL:', anime.image);

  if (newName && newGenre && newImage) {
    animeList[index] = { name: newName, genre: newGenre, image: newImage };
    localStorage.setItem('animeList', JSON.stringify(animeList));
    renderAnimeList();
  }
}

function deleteAnime(index) {
  animeList.splice(index, 1);
  localStorage.setItem('animeList', JSON.stringify(animeList));
  renderAnimeList();
}

renderAnimeList();
