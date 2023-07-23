"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { getIo } = require("../app");
const { getCurrentGameData } = require("./responseFormat");
function updateLobbyPlayers(lobbyId) {
    getIo().sockets.emit('gameSync', getCurrentGameData(lobbyId));
}
module.exports = {
    updateLobbyPlayers
};
