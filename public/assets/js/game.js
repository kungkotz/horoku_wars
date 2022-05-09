let socket = io();

const audio = document.querySelector('#musicPlayer');
const virus = document.querySelector('#virus');
const playerForm = document.querySelector('#player-form');
const playArea = document.querySelector('#playArea');

const player1Score = document.querySelector('#player1Score');
const player2Score = document.querySelector('#player2Score');
const ul1 = document.querySelector('#timer1');
const ul2 = document.querySelector('#timer2');
const winner = document.querySelector('#winner');

const confirmBtn = document.querySelector('.confirmBtn');
const playAgainBtn = document.querySelector('.playAgain');

let reactionTime;
let playerId;

/**
 * Functions
 */

const init = () => {
  ul1.innerHTML = '';
  ul2.innerHTML = '';

  player1Score.innerHTML = 0;
  player2Score.innerHTML = 0;
  winner.innerHTML = '';

  playAgainBtn.classList.add('hide');
}


// function musicPlay() {
//   audio.volume = 0.2;
//   audio.play();
//   audio.classList.remove('hide');
//   document.removeEventListener('click', musicPlay);
// }

const clickedFunction = (startTime) => {
  const clickedTime = new Date().getTime();
  let reactionTime = clickedTime - startTime;

  document.querySelector('#virus').remove();

  socket.emit('clicked', {
    reactionTime,
    playerId
  });

};

/**
 * Event listeners
 */

// Listen for when the player form is submited
playerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // remove the class hide from Waiting for new victim text
  document.querySelector('#loading').classList.remove('hide');

  // Get the value from the name typed in player name
  const username = document.querySelector('#username').value;

  // emits that username value
  socket.emit('newPlayer', username, (id) => {
    playerId = id;
  });
});

confirmBtn.addEventListener('click', () => {

  confirmBtn.classList.add('hide');
  document.querySelector('#playArea').classList.remove('hide');

  socket.emit('ready', playerId);
  // socket.on('musicPlay', musicPlay);

});

socket.on('restart', init);

playAgainBtn.addEventListener('click', () => {

    playAgainBtn.classList.toggle('hide', true);
    socket.emit('ready', playerId);
    console.log(playerId)
    socket.on('startGame');

});

/**
 * Sockets
 */

socket.on('newGame', (players) => {

  const playerOne = players[0];
  const playerTwo = players[1];

  // Info in the sidebar
  document.querySelector('#player1 h1').innerHTML = playerOne.username;
  document.querySelector('#player2 h1').innerHTML = playerTwo.username;

  // Hide the start screen, show the game display
  document.querySelector('#register-player').classList.add('hide');
  document.querySelector('#game').classList.remove('hide');
  
});

socket.on('startGame', (delay, position1, position2) => {


  setTimeout(() => {
    // remove the class hide from the virus
    // virus.classList.remove('hide');

    const virus = document.createElement("div");
    
    virus.id = "virus"
    virus.innerHTML = `
      <img class="virus-img"
      src="./assets/images/virus.png"
      alt="">
    `
    // add the position to the virus
    virus.style.gridColumn = position1;
    virus.style.gridRow = position2;
  
    playArea.append(virus);

    const startTime = new Date().getTime();

    // creates a list item and adds it to the players ul
    const li1 = document.createElement('LI');
    const newListItem1 = ul1.appendChild(li1);

    // creates a list item and adds it to the players ul
    const li2 = document.createElement('LI');
    const newListItem2 = ul2.appendChild(li2);

    // Sets a timer for player1
    timer1 = setInterval(() => {
      let diff = moment(new Date().getTime()).diff(moment(startTime));

      // puts the codesnippet on the new list item created before
      newListItem1.innerHTML = moment(diff).format('mm:ss:SSS');
    }, 1);

    // Sets a timer for player2
    timer2 = setInterval(() => {
      let diff = moment(new Date().getTime()).diff(moment(startTime));

      newListItem2.innerHTML = moment(diff).format('mm:ss:SSS');
    }, 1);

    virus.addEventListener('click', () => clickedFunction(startTime));
  }, delay);
});

// listen for when a user disconnects
socket.on('user:disconnected', (username) => {
  console.log(username + ' disconnected');
});

// listen for when this user disconnects
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

// listen for who gets point
socket.on('getPoint', (data) => {

  if (data.winner === data.players[0].id) {
    player1Score.innerText = data.winnerScore
  } 
  
  if (data.winner === data.players[1].id) {
    player2Score.innerText = data.winnerScore
  }

});

// setInterval is passed here and then cancels the interval
socket.on('stopTimer', ({ id, playerOne }) => {
  id === playerOne.id ? clearInterval(timer1) : clearInterval(timer2);
});

// emiting winner at end of game
socket.on('winner', winnerId => {

  if (playerId === winnerId) {
    winner.innerHTML = 'YESSSSS! <br> <img src="./assets/images/winner.gif" class="winner" alt="">';

  } else if (winnerId === null) {
    winner.innerHTML = 'WHAT!! A TIE!? <br><img src="./assets/images/tie.gif" class="tie" alt="">';
    
  } else {
    winner.innerHTML = 'DAMN IT, I suck! <br><img src="./assets/images/loser.gif" class="loser" alt="">';
  }
  playAgainBtn.classList.remove('hide');
});

socket.on('clientClicked', (id) => {
  console.log(id)
});