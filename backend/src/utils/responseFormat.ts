import { Lobby } from "../logic/lobby/lobby";

const CircularJSON = require('circular-json')
// const Lobby = require('../logic/lobby/lobby')
const { parse, stringify, toJSON, fromJSON } = require('flatted');

function flattenCircular(obj) {
    return JSON.parse(CircularJSON.stringify(obj))
}

function getCurrentGameData(lobbyId) {
    const lobby = Lobby.getLobby(lobbyId)
    const game = lobby.trackedGame
    const data = stringify({
        players: game.players,
        gameStarted: !!game,
        game: game
    })
    return data
}

module.exports = {
    flattenCircular,
    getCurrentGameData
}

export { }
