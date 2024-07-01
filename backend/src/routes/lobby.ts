import bodyParser from 'body-parser';
import express from "express";
import { stringify } from "flatted";
import * as uuid from 'uuid';
import { Game } from "../logic/game/game.js";
import { Lobby } from "../logic/lobby/lobby.js";
import { Player } from "../logic/player/player.js";
import prefabs from '../utils/prefabs/prefabs.json';
import { flattenCircular } from '../utils/responseFormat.js';


const router = express.Router();

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
    const name = req.body.name
    if (!userId) {
        return res.json({ success: false })
    }

    let player = Player.getPlayer(userId)
    if (!player) {
        player = new Player(userId, name || 'not provided')
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
    if (lobby.isGameStarted()) {
        return next(new Error("Cannot start game 2nd time"))
    }
    console.log(lobby.players)
    const newPlayers = lobby.players.map((player) => new Player(player.id, player.name))
    // const game = new Game(uuid.v4(), lobby.players)
    const game = new Game(uuid.v4(), newPlayers)
    lobby.trackGame(game)
    console.log(lobby)
    res.json(flattenCircular(lobby))
})

// Start game with preset data
router.post('/:lobbyId/start-prefab', (req, res, next) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    if (lobby.isGameStarted()) {
        return next(new Error("Cannot start game 2nd time"))
    }
    const newPlayers = lobby.players.map((player) => new Player(player.id, player.name))
    // const game = new Game(uuid.v4(), lobby.players)
    const game = new Game(uuid.v4(), newPlayers, prefabs.first)
    lobby.trackGame(game)
    console.log(lobby)
    res.json(flattenCircular(lobby))
})

// Get lobby info (players...)
router.get('/:lobbyId', (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    // res.json(flattenCircular({
    //     players: lobby.players,
    //     gameStarted: !!lobby.trackedGame
    // }))
    res.send(stringify({
        players: lobby.players,
        gameStarted: !!lobby.trackedGame
    }))
})


// Start prefab game with injected moves
router.post('/:lobbyId/start-prefab-with-injected-moves', bodyParser.text(), async (req, res) => {
    const lobby = Lobby.getLobby(req.params.lobbyId)
    const newPlayers = lobby.players.map((player) => new Player(player.id, player.name))
    const game = new Game(uuid.v4(), newPlayers, prefabs.first)
    lobby.trackGame(game)
    await game.inputsTracker.injectMoves(lobby.id, req.body)
    return res.json(flattenCircular(lobby))
})

module.exports = router;

export default router;
