let socket = io();

const virusEl = document.querySelector('#virus');
const audio = document.getElementById('musicPlayer');
const confirmBtn = document.querySelector('.confirmBtn')

let confirm = 0;
let timer;
let newListItem;

/**
 * Functions
 */

 function musicPlay() {
  audio.play()
  document.removeEventListener('click', musicPlay);
}

const clickedFunction = () => {
  socket.emit('clicked');

  virusEl.removeEventListener('click', clickedFunction);
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

  if (confirm === 1) {
    socket.emit('ready');
    document.addEventListener('click', musicPlay);
  }
})

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
  //remove the confirm button
  document.querySelector('#player1 button').classList.add('hide');


  // add the position to the virus
  virusEl.style.gridColumn = position1;
  virusEl.style.gridRow = position2;


  setTimeout(() => {
    // remove the class hide from the virus
    virusEl.classList.remove('hide');

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

    virusEl.addEventListener('click', clickedFunction);
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
  virusEl.classList.add('hide');
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
      'YESSSSS! <br> <img src="" class="winnerGif" alt="">';
  } else if (
    document.querySelector('#player1Score').innerHTML <
    document.querySelector('#player2Score').innerHTML
  ) {
    document.querySelector('#winner').innerHTML =
      'DAMN IT, I suck! <br><img src="" class="looser" alt="">';
  } else {
    document.querySelector('#winner').innerHTML =
      'Wow, you are both winners! <br><img src="" class="tie" alt="">';
  }
});
