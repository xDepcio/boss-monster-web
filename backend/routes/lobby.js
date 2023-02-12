const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Lobby = require('../logic/lobby/lobby');
const Player = require('../logic/player/player')
const Game = require('../logic/game/game')

// const lobbies = {}
// const players = {}

// Create lobby
router.post('/', (req, res, next) => {
    const lobbyId = uuid.v4()
    const lobby = new Lobby(lobbyId)
    // lobbies[lobbyId] = lobby
    console.log(Lobby.lobbies)
    res.json({
        lobbyId
    });
});

// Join player to lobby
router.post('/:lobbyId/join', (req, res, next) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    if (lobby.isGameStarted()) {
        return next(new Error("Game already started, can't join"))
    }

    const userId = req.body.userId

    let player = Player.getPlayer(userId)
    if (!player) {
        player = new Player(userId)
    }

    if (!lobby.isPlayerIn(player)) {
        lobby.addPlayer(player)
    }
    console.log(lobby)

    res.json({
        success: 'true'
    })
})

// Start game in a lobby
router.post('/:lobbyId/start', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    if (lobby.gameStarted) {
        return next(new Error("Cannot start game 2nd time"))
    }
    const game = new Game(uuid.v4(), lobby.players)
    lobby.trackGame(game)
    console.log(lobby)
    res.json(lobby)
})

// Get lobby info (players...)
router.get('/:lobbyId', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    res.json({
        players: lobby.players,
        gameStarted: !!lobby.trackedGame
    })
})



module.exports = router;
