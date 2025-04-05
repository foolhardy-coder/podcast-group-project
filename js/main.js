// Optimized and commented code for better readability and performance

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all functionality when the DOM is fully loaded
  setupBurgerMenu();
  setupScrollFunctionality();
  initializeAudioPlayer();
  setupEpisodeButtons();

  const scrollContainer = document.querySelector(".scroll-container");

  // Ensure scrollContainer exists before proceeding
  if (!scrollContainer) {
    console.error("Error: .scroll-container element not found in the DOM.");
    return;
  }

  // Fetch the episodes.html content and populate the scroll container
  fetch("episodes.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch episodes.html");
      }
      return response.text();
    })
    .then((html) => {
      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Select the episode items from episodes.html
      const episodeItems = doc.querySelectorAll(".episode-item");

      // Get the three most recent episodes
      const recentEpisodes = Array.from(episodeItems).slice(0, 3);

      // Clear the current scroll container content
      scrollContainer.innerHTML = "";

      // Add the three most recent episodes to the scroll container
      recentEpisodes.forEach((episode) => {
        const episodeClone = episode.cloneNode(true); // Clone the episode element
        scrollContainer.appendChild(episodeClone); // Append the cloned element
      });
    })
    .catch((error) => {
      console.error("Error loading episodes:", error);
    });
});

// Shared audio player instance
let audioPlayer = null;

// Function to handle the burger menu toggle
function setupBurgerMenu() {
  const burger = document.querySelector('.burger-menu');
  const navLinks = document.querySelector('.nav-menu-items');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('active'); // Toggle the visibility of the navigation menu
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto'; // Lock or unlock scrolling
    });
  }
}

// Function to set up scroll functionality for the container
function setupScrollFunctionality() {
  const container = document.querySelector('.scroll-container');

  if (container) {
    const scrollAmount = container.offsetWidth; // Calculate the scroll amount based on container width

    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); // Scroll left smoothly
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' }); // Scroll right smoothly
      });
    }

    // Add event listeners to buttons in the scroll container
    container.addEventListener('click', (event) => {
      if (event.target.classList.contains('button-primary')) {
        event.preventDefault(); // Prevent default link behavior

        // Fetch the audio file from the button's data-src attribute
        const audioSrc = event.target.dataset.src;

        if (audioPlayer && audioSrc) {
          // Update the audio source and play the selected file
          audioPlayer.src = audioSrc;
          audioPlayer.play();

          // Save the selected audio file and playback state to localStorage
          localStorage.setItem('audioSrc', audioSrc);
          localStorage.setItem('audioPlaying', true);
          localStorage.setItem('audioTime', 0); // Reset playback position for the new file
        }
      }
    });
  }
}

// Function to initialize the audio player
function initializeAudioPlayer() {
  audioPlayer = document.getElementById('audio-player');

  if (!audioPlayer) {
    // Create the audio player if it doesn't exist
    audioPlayer = document.createElement('audio');
    audioPlayer.id = 'audio-player';
    audioPlayer.controls = true; // Enable audio controls
    audioPlayer.style.width = '100%'; // Make the player span the full width of the window

    // Create a container for the audio player and file name display
    const audioContainer = document.createElement('div');
    audioContainer.style.position = 'fixed';
    audioContainer.style.bottom = '0';
    audioContainer.style.left = '0';
    audioContainer.style.width = '100%';
    audioContainer.style.zIndex = '1000';
    audioContainer.style.textAlign = 'center';
    audioContainer.style.padding = '10px 0'; // Add padding for better spacing
    audioContainer.style.backgroundColor = 'var(--dark-blue)';

    // Create the file name display element
    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.id = 'audio-file-name';
    fileNameDisplay.style.fontSize = '16px';
    fileNameDisplay.style.marginBottom = '5px';
    fileNameDisplay.textContent = 'No file playing';

    // Create a wrapper for the slider bar
    const sliderWrapper = document.createElement('div');
    sliderWrapper.style.marginTop = '5px';
    sliderWrapper.style.height = '30px'; // Increase the height of the slider bar

    // Append the audio player to the slider wrapper
    sliderWrapper.appendChild(audioPlayer);

    // Append the file name display and slider wrapper to the container
    audioContainer.appendChild(fileNameDisplay);
    audioContainer.appendChild(sliderWrapper);

    // Append the container to the body
    document.body.appendChild(audioContainer);
  }

  // Restore state from localStorage
  const savedSrc = localStorage.getItem('audioSrc');
  const savedTime = localStorage.getItem('audioTime');
  const isPlaying = localStorage.getItem('audioPlaying') === 'true';

  if (savedSrc) {
    const audioFilePath = savedSrc.startsWith('audio/') ? savedSrc : `audio/${savedSrc}`; // Ensure the correct path to the audio folder
    audioPlayer.src = audioFilePath; // Restore the audio source
    const fileName = audioFilePath.split('/').pop(); // Extract the file name from the path
    document.getElementById('audio-file-name').textContent = fileName; // Update the file name display
  }

  if (savedTime) {
    audioPlayer.currentTime = parseFloat(savedTime); // Restore the playback position
  }

  if (isPlaying) {
    audioPlayer.play(); // Resume playback if it was playing
  }

  // Save state during playback
  audioPlayer.addEventListener('timeupdate', () => {
    localStorage.setItem('audioTime', audioPlayer.currentTime); // Save the current playback position
    localStorage.setItem('audioSrc', audioPlayer.src.replace(/^.*[\\\/]/, '')); // Save the current audio source (file name only)
  });

  // Update the file name display when the source changes
  audioPlayer.addEventListener('play', () => {
    const fileName = audioPlayer.src.split('/').pop(); // Extract the file name from the path
    document.getElementById('audio-file-name').textContent = fileName; // Update the file name display
  });

  // Save state before navigating away
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('audioTime', audioPlayer.currentTime); // Save the current playback position
    localStorage.setItem('audioPlaying', !audioPlayer.paused); // Save whether the audio is playing
    localStorage.setItem('audioSrc', audioPlayer.src.replace(/^.*[\\\/]/, '')); // Save the current audio source (file name only)
  });
}

// Function to set up episode buttons to play audio files
function setupEpisodeButtons() {
  const episodeButtons = document.querySelectorAll('.button-primary');

  episodeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior

      // Fetch the audio file from the button's data-src attribute
      const audioSrc = button.dataset.src;

      if (audioPlayer && audioSrc) {
        // Update the audio source and play the selected file
        audioPlayer.src = audioSrc;
        audioPlayer.play();

        // Save the selected audio file and playback state to localStorage
        localStorage.setItem('audioSrc', audioSrc);
        localStorage.setItem('audioPlaying', true);
        localStorage.setItem('audioTime', 0); // Reset playback position for the new file
      }
    });
  });
}



