let socket = io();

const virusEl = document.querySelector('#virus');

let timer;
let newListItem;

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

// Listen for ready button interaction
document.querySelector('#player1 button').addEventListener('click', () => {

  document.querySelector('#player1 button').innerHTML = 'Lets Go!'
  
  socket.emit("ready")
})

// listen for when a user disconnects
socket.on('user:disconnected', (username) => {
  console.log(username + ' disconnected');
});

// listen for when this user disconnects
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    socket.connect();
  }
  console.log(username + ' disconnected');
});
