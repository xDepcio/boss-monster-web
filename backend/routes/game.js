const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Lobby = require('../logic/lobby/lobby');
const Player = require('../logic/player/player')
const Game = require('../logic/game/game')

// Get game info (players...)
router.get('/:lobbyId', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    const game = lobby.trackedGame
    res.json({
        players: lobby.players,
        gameStarted: !!lobby.trackedGame
    })
})

module.exports = router;
