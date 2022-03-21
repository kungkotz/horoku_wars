const debug = require('debug')('horoku:socket_controller');

let io = null;
let players = {};
let availableRoom = 1;
let games = [];

// function to get random position on grid
const getRandomPosition = () => {
  return Math.floor(Math.random() * 10) + 1
};

// function to get random delay on the pop up of virus
const getRandomDelay = () => {
  return Math.floor(Math.random() * (5000 - 1000)) + 1000
};

const handleNewPlayer = function (username) {
  players[this.id] = username;

  this.join('game-' + availableRoom);

  // if 2, start the game
  if (Object.keys(players).length === 2) {
    const room = 'game-' + availableRoom;

    let game = {
      room,
      players,
      ready: 0,
      rounds: 0,
      clicks: [],
    };

    games.push(game);

    // emits the Game and the Players to the playarea
    io.to(room).emit('newGame', players);

    // empty players
    players = {};

    availableRoom++;
  }
};

socket.on('getPoint', id => {
  let player = null;

  id === socket.id
      ? player = 'player2'
      : player = 'player1'

  let oldScore = Number(document.querySelector(`#${player}Score`).innerHTML);

  let newScore = ++oldScore;
  document.querySelector(`#${player}Score`).innerHTML = newScore;

  // hide the virus
  virusEl.classList.add('hide')
})

// setInterval is passed here and then cancels the interval
socket.on('stopTimer', (id) => {
  id === socket.id
      ? clearInterval(timer1)
      : clearInterval(timer2)
})

const handleDisconnect = function () {
  debug(`Client ${this.id} disconnected :(`);
  // Find the room that this socket is part of
  const game = games.find((gameroom) =>
    gameroom.players.hasOwnProperty(this.id)
  );

  // If socket was not in any room, dont broadcast disconnect
  if (!game) {
    return;
  }
  // We broadcast to everyone in a room  that a user has disconnected
  this.broadcast.to(game.id).emit('user:disconnected', game.players[this.id]);
  delete game.players[this.id];
};

module.exports = function (socket) {
  io = this;
  debug(`Client ${socket.id} connected!`);
  socket.on('disconnect', handleDisconnect);
  socket.on('newPlayer', handleNewPlayer);
};
