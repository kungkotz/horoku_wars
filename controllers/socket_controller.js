const debug = require('debug')('horoku:socket_controller');

let io = null;
let players = {};
let availableRoom = 1;
let games = [];

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

module.exports = function (socket) {
  io = this;
  debug(`Client ${socket.id} connected!`);

  socket.on('newPlayer', handleNewPlayer);
};
