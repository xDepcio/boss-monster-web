import { getIo } from "../app.js"
import { getCurrentGameData } from "./responseFormat.js"


function updateLobbyPlayers(lobbyId) {
    getIo().sockets.emit('gameSync', getCurrentGameData(lobbyId))
}


export {
    updateLobbyPlayers
}
