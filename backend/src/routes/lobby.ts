import express from "express";
import { Player } from "../logic/player/player";
// const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Lobby = require('../logic/lobby/lobby');
// const Player = require('../logic/player/player')
const { Game } = require('../logic/game/game')
const prefabs = require('../utils/prefabs/prefabs.json')
const { flattenCircular } = require('../utils/responseFormat')

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
    if (!userId) {
        return res.json({ success: false })
    }

    let player = Player.getPlayer(userId)
    if (!player) {
        player = new Player(userId, 'olo')
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
router.post('/:lobbyId/start', (req, res, next) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    if (lobby.gameStarted) {
        return next(new Error("Cannot start game 2nd time"))
    }
    const newPlayers = lobby.players.map((player) => new Player(player.id, 'olo'))
    // const game = new Game(uuid.v4(), lobby.players)
    const game = new Game(uuid.v4(), newPlayers)
    lobby.trackGame(game)
    console.log(lobby)
    res.json(flattenCircular(lobby))
})

// Start game with preset data
router.post('/:lobbyId/start-prefab', (req, res, next) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    if (lobby.gameStarted) {
        return next(new Error("Cannot start game 2nd time"))
    }
    const newPlayers = lobby.players.map((player) => new Player(player.id, 'olo'))
    // const game = new Game(uuid.v4(), lobby.players)
    const game = new Game(uuid.v4(), newPlayers, prefabs.first)
    lobby.trackGame(game)
    console.log(lobby)
    res.json(flattenCircular(lobby))
})

// Get lobby info (players...)
router.get('/:lobbyId', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    res.json(flattenCircular({
        players: lobby.players,
        gameStarted: !!lobby.trackedGame
    }))
})



module.exports = router;

export { }
