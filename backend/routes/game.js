const express = require('express');
const router = express.Router();
// const uuid = require('uuid');
const Lobby = require('../logic/lobby/lobby');
// const Player = require('../logic/player/player')
// const Game = require('../logic/game/game')
const { flattenCircular, getCurrentGameData } = require('../utils/responseFormat')
const { assignPlayer } = require('../utils/verifyPlayer')
const { parse, stringify, toJSON, fromJSON } = require('flatted');
const { updateLobbyPlayers } = require('../utils/socketsHelper');


// Get game info (players...)
router.get('/:lobbyId', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    const game = lobby.trackedGame
    console.log(lobby)
    return res.send(stringify({
        players: game.players,
        gameStarted: !!game,
        game: game
    }))
})

// Select boss
router.post('/:lobbyId/choose-boss', assignPlayer, (req, res, next) => {
    const player = req.player

    const bossId = req.body.bossId
    try {
        player.selectBoss(bossId)
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Build dungeon
router.post('/:lobbyId/build-dungeon', assignPlayer, (req, res, next) => {
    const player = req.player
    const dungeon = player.getDungeonCard(req.body.dungeonId)

    try {
        player.declareBuild(dungeon, req.body.buildIndex)
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Get ready
router.post('/:lobbyId/become-ready', assignPlayer, (req, res, next) => {
    const player = req.player

    try {
        player.becomeReady()
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Accept hero move
router.post('/:lobbyId/accept-hero-move', assignPlayer, (req, res, next) => {
    const player = req.player

    try {
        player.acceptHeroMove()
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

module.exports = router;
