let socket = io();

const virusEl = document.querySelector('#virus');

/**
 * Event listeners
 */

// Listen for when the player form is submited
document.querySelector('#player-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // remove the class hide from Waiting for new victim text
  document.querySelector('#loading').classList.remove('hide');

  // Get the value from the name typed in player name
  const username = document.querySelector('#username').value;

  // emits that username value
  socket.emit('newPlayer', username);
});
