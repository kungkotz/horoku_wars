const debug = require('debug')('horoku:socket_controller');

let io = null;
let players = [];
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


const handleNewPlayer = function (username, setUserId) {

  const player =  {
      id: this.id,
      username: username,
      score: 0,
      reactionTime: null,
    }

    setUserId(player.id)

  players.push(player)

  this.join('game-' + availableRoom);

  // if 2, start the game
  if (players.length === 2) {
    const room = 'game-' + availableRoom;

    let game = {
      room,
      players,
      ready: 0,
      rounds: 0,
      clicks: [],
    };

    games.push(game);

    io.to(game.room).emit('clientClicked', game);

    // emits the Game and the Players to the playarea
    io.to(room).emit('newGame', players);
    
    // Empty players
    players = []

    availableRoom++;
  }
};


const handleReady = function (playerId) {
  const game = games.find(game => {
  const playerInRoom = game.players.some(player => player.id == playerId)
    
    if (playerInRoom) return game
  })
  
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
      
      // io.to(game.room).emit('musicPlay')
      io.to(game.room).emit('restart')

      game.ready = 0;
  }
};

const handleClicked = function ({ reactionTime, playerId }) {
  const game = games.find(game => {
  const playerInRoom = game.players.some(player => player.id == playerId)
    
    if (playerInRoom) return game

  })
  //register who clicked
  game.clicks.push(this.id);

  const playerOne = game.players[0];
  const playerTwo = game.players[1];
  const playerClicked = this.id === playerOne.id ? playerOne : playerTwo;

  playerClicked.reactionTime = reactionTime
  
  if (playerClicked) {
    console.log(`${playerClicked.username} clicked`)
    console.log("with " + playerClicked.reactionTime)
    io.to(game.room).emit('stopTimer', {
      id: playerClicked.id, 
      playerOne: playerOne
    })
  }

  reactionTime = 0;
  io.to(game.room).emit('clientClicked', game);
  
  if (game.clicks.includes(playerOne.id) && (game.clicks.includes(playerTwo.id))) {
    if (playerOne.reactionTime < playerTwo.reactionTime) {
      playerOne.score++
      io.to(game.room).emit('getPoint', {
        winner: playerOne.id, 
        players: game.players,
        winnerScore: playerOne.score
      });

    } else {
      playerTwo.score++
      io.to(game.room).emit('getPoint', {
        winner: playerTwo.id, 
        players: game.players,
        winnerScore: playerTwo.score
      });
    }
    
    // sends the clicks to array
    game.clicks = [];
    
    // // increments the rounds
    game.rounds++;

    //
    if (game.rounds < 10) {
      delay = getRandomDelay();
      io.to(game.room).emit(
        'startGame',
        delay,
        getRandomPosition(),
        getRandomPosition()
      );
    }  else if (game.rounds === 10) {

      const isTie = playerOne.score === playerTwo.score

      const playerOneWon = playerOne.score > playerTwo.score
      
      io.to(game.room).emit('winner', isTie ? undefined : (playerOneWon ? playerOne.id : playerTwo.id))
      
      game.rounds = 0;
      game.players.map(player => {
        player.score = 0;
      })
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
  this.broadcast.to(game.room).emit('user:disconnected', game.players[this.id]);
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