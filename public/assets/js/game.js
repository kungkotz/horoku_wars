let socket = io();

const virus = document.querySelector('#virus');
const playArea = document.querySelector('#playArea')
const ul1 = document.querySelector('#timer1');
const ul2 = document.querySelector('#timer2');
const player1Score = document.querySelector('#player1Score');
const player2Score = document.querySelector('#player2Score');
const winner = document.querySelector('#winner');
const audio = document.querySelector('#musicPlayer');

const confirmBtn = document.querySelector('.confirmBtn');
const playAgainBtn = document.querySelector('.playAgain');

let confirm = 0;
let timer;
let newListItem;

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


function musicPlay() {
  audio.volume = 0.2;
  audio.play();
  audio.classList.remove('hide');
  document.removeEventListener('click', musicPlay);
}

const clickedFunction = () => {
  socket.emit('clicked');

  virus.removeEventListener('click', clickedFunction);
};

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


confirmBtn.addEventListener('click', () => {
  confirm++;

  confirmBtn.classList.add('hide');
  playArea.classList.remove('hide');

  if (confirm === 1) {
    socket.emit('ready');
    socket.on('musicPlay', musicPlay);
  }

  confirm = 0;
})

playAgainBtn.addEventListener('click', () => {
  confirm++;

  if (confirm === 1) {

    playAgainBtn.classList.add('hide');
    socket.emit('ready');
    socket.on('restart', init)
    socket.on('startGame');
    
    confirm = 0;
  }
});

/**
 * Sockets
 */

socket.on('newGame', (players) => {
  const player1 = players[socket.id];
  // delete player1 from showing up on player2 side
  delete players[socket.id];

  const player2 = Object.values(players);

  // Info in the sidebar
  document.querySelector('#player1 h1').innerHTML = player1;
  document.querySelector('#player2 h1').innerHTML = player2;

  // Hide the start screen, show the game display
  document.querySelector('#register-player').classList.add('hide');
  document.querySelector('#game').classList.remove('hide');

});

socket.on('startGame', (delay, position1, position2) => {

  // add the position to the virus
  virus.style.gridColumn = position1;
  virus.style.gridRow = position2;

  setTimeout(() => {
    // remove the class hide from the virus
    virus.classList.remove('hide');

    const startTime = new Date().getTime();

    // selects the ul of #timer1 and adds a new list item
    const ul1 = document.querySelector('#timer1');
    const li1 = document.createElement('LI');
    newListItem1 = ul1.appendChild(li1);

    // selects the ul of #timer2 and adds a new list item
    const ul2 = document.querySelector('#timer2');
    const li2 = document.createElement('LI');
    newListItem2 = ul2.appendChild(li2);

    // calls a function and executes
    timer1 = setInterval(() => {
      let diff = moment(new Date().getTime()).diff(moment(startTime));

      // puts the codesnippet on the new list item created before
      newListItem1.innerHTML = moment(diff).format('mm:ss:SSS');
    }, 1);

    timer2 = setInterval(() => {
      let diff = moment(new Date().getTime()).diff(moment(startTime));

      newListItem2.innerHTML = moment(diff).format('mm:ss:SSS');
    }, 1);

    virus.addEventListener('click', clickedFunction);
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
  console.log(username + ' disconnected');
});

// listen for who gets point
socket.on('getPoint', (id) => {
  let player = null;

  id === socket.id ? (player = 'player2') : (player = 'player1');

  let oldScore = Number(document.querySelector(`#${player}Score`).innerHTML);

  let newScore = ++oldScore;
  document.querySelector(`#${player}Score`).innerHTML = newScore;

  // hide the virus
  virus.classList.add('hide');
});

// setInterval is passed here and then cancels the interval
socket.on('stopTimer', (id) => {
  id === socket.id ? clearInterval(timer1) : clearInterval(timer2);
});

// emiting winner at end of game
socket.on('winner', () => {
  if (
    document.querySelector('#player1Score').innerHTML >
    document.querySelector('#player2Score').innerHTML
  ) {
    document.querySelector('#winner').innerHTML =
      'YESSSSS! <br> <img src="./assets/images/winner.gif" class="winner" alt="">';
  } else if (
    document.querySelector('#player1Score').innerHTML <
    document.querySelector('#player2Score').innerHTML
  ) {
    document.querySelector('#winner').innerHTML =
      'DAMN IT, I suck! <br><img src="./assets/images/loser.gif" class="loser" alt="">';
  } else {
    document.querySelector('#winner').innerHTML =
      'WHAT!! A TIE!? <br><img src="./assets/images/tie.gif" class="tie" alt="">';
  }
  playAgainBtn.classList.remove('hide');
  
});
