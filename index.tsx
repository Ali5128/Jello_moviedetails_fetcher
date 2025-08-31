/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Using the provided TMDb API key directly as process.env is not available in the browser.
const TMDB_API_KEY = "7c549a0a0db89c04bacbc4b7a60f7888";

const TMDB_IMAGE_BASE_URL = "https://www.themoviedb.org/t/p/";
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";


const movieForm = document.getElementById('movie-form') as HTMLFormElement;
const movieInput = document.getElementById('movie-input') as HTMLInputElement;
const loader = document.getElementById('loader') as HTMLDivElement;
const errorContainer = document.getElementById('error-container') as HTMLDivElement;
const resultContainer = document.getElementById('result-container') as HTMLDivElement;
const movieTitleElement = document.getElementById('movie-title') as HTMLHeadingElement;
const movieDescriptionElement = document.getElementById('movie-description') as HTMLParagraphElement;
const moviePoster = document.getElementById('movie-poster') as HTMLImageElement;
const thumbnailLinkInput = document.getElementById('thumbnail-link') as HTMLInputElement;
const copyButton = document.getElementById('copy-button') as HTMLButtonElement;
const sizeSelector = document.getElementById('size-selector') as HTMLDivElement;

let currentPosterPath = '';

function updateThumbnailLink(size: string) {
    if (!currentPosterPath) return;
    const fullUrl = `${TMDB_IMAGE_BASE_URL}${size}${currentPosterPath}`;
    thumbnailLinkInput.value = fullUrl;
}

movieForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const movieName = movieInput.value.trim();
  if (!movieName) return;

  // Reset UI
  resultContainer.style.display = 'none';
  errorContainer.style.display = 'none';
  loader.style.display = 'block';
  currentPosterPath = '';

  try {
    // Use TMDb's search API to find the movie directly for maximum accuracy
    const searchResponse = await fetch(`${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`);
    if (!searchResponse.ok) {
        throw new Error(`TMDb API error: ${searchResponse.statusText}`);
    }
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
      // Take the first result, which is the most relevant one by default
      const movieData = searchData.results[0];
      
      if (movieData.poster_path) {
        currentPosterPath = movieData.poster_path;

        const posterUrl_w500 = `${TMDB_IMAGE_BASE_URL}w500${currentPosterPath}`;

        // Add release year for clarity to ensure it's the correct movie
        const releaseYear = movieData.release_date ? ` (${movieData.release_date.substring(0, 4)})` : '';
        movieTitleElement.textContent = movieData.title + releaseYear;
        movieDescriptionElement.textContent = movieData.overview;
        moviePoster.src = posterUrl_w500;
        moviePoster.alt = `Poster for ${movieData.title}`;

        // Set default active button and generate initial link
        const defaultActiveButton = sizeSelector.querySelector('.size-button[data-size="original"]') as HTMLButtonElement;
        document.querySelectorAll('.size-button').forEach(btn => btn.classList.remove('active'));
        defaultActiveButton.classList.add('active');
        updateThumbnailLink('original');

        resultContainer.style.display = 'block';
      } else {
        // Found a movie, but it has no poster
        showError(`"${movieData.title}" was found, but it doesn't have a poster on TMDb.`);
      }
    } else {
      showError("Couldn't find any movie with that title on TMDb.");
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    showError("Could not search for the movie. Please try a different title.");
  } finally {
    loader.style.display = 'none';
  }
});

sizeSelector.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('size-button')) {
        const size = target.dataset.size;
        if (size) {
            document.querySelectorAll('.size-button').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            updateThumbnailLink(size);
        }
    }
});

copyButton.addEventListener('click', () => {
  thumbnailLinkInput.select();
  navigator.clipboard.writeText(thumbnailLinkInput.value);
  
  const originalText = copyButton.textContent;
  copyButton.textContent = 'Copied!';
  setTimeout(() => {
    copyButton.textContent = originalText;
  }, 2000);
});

function showError(message: string) {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
}