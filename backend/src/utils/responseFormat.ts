import CircularJSON from 'circular-json';
import { stringify } from "flatted";
import { Lobby } from "../logic/lobby/lobby.js";



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

export {
    flattenCircular,
    getCurrentGameData
};
