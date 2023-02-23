const { getIo } = require("../app");
const { getCurrentGameData } = require("./responseFormat");


function updateLobbyPlayers(lobbyId) {
    getIo().sockets.emit('gameSync', getCurrentGameData(lobbyId))
}

module.exports = {
    updateLobbyPlayers
}
