const debug = require('debug')('horoku:socket_controller');

let io = null;
let players = {};
let availableRoom = 1;
let games = [];

// function to get random position on grid
const getRandomPosition = () => {
  return Math.floor(Math.random() * 10) + 1;
};

// function to get random delay on the pop up of virus
const getRandomDelay = () => {
  return Math.floor(Math.random() * (5000 - 1000)) + 1000;
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

const handleReady = function () {
  const game = games.find((id) => id.players[this.id]);
  game.ready++;

  // if there is two players, sent to playarea
  if (game.ready === 2) {
    // start the game
    
    io.to(game.room).emit(
      'startGame',
      getRandomDelay,
      getRandomPosition(),
      getRandomPosition()
      )
      
      io.to(game.room).emit('musicPlay')
  }
};

const handleClicked = function () {
  const game = games.find((id) => id.players[this.id]);

  // sends the click function to stop the timer
  io.to(game.room).emit('stopTimer', this.id);

  //register who clicked
  game.clicks.push(this.id);

  if (game.clicks.length === 2) {
    io.to(game.room).emit('getPoint', this.id);

    // sends the clicks to array
    game.clicks = [];

    // increments the rounds
    game.rounds++;

    //
    if (game.rounds < 4) {
      delay = getRandomDelay();
      io.to(game.room).emit(
        'startGame',
        delay,
        getRandomPosition(),
        getRandomPosition()
      );
    }  else if (game.rounds === 4) {
      io.to(game.room).emit('winner')
    }
  }
};

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

  socket.on('newPlayer', handleNewPlayer);

  socket.on('ready', handleReady);

  socket.on('clicked', handleClicked);

  socket.on('disconnect', handleDisconnect);

};
