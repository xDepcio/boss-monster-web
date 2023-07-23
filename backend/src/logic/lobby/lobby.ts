class Lobby {
    static lobbies = {}

    id
    players
    trackedGame

    constructor(id) {
        this.id = id
        this.players = []
        this.trackedGame = null
        Lobby.lobbies[id] = this
    }

    addPlayer(player) {
        this.players.push(player)
    }

    isPlayerIn(player) {
        let isIn = false
        this.players.forEach(ele => {
            if (ele.id === player.id) {
                isIn = true
            }
        });
        return isIn
    }

    trackGame(game) {
        this.trackedGame = game
    }

    isGameStarted() {
        return this.trackedGame !== null
    }

    static getLobby(lobbyId) {
        return Lobby.lobbies[lobbyId]
    }
}

module.exports = Lobby

export { }
