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
const { SelectionRequest } = require('../logic/game/playerRequestSelections');
const { HeroCard, DungeonCard, SpellCard } = require('../logic/game/cards');
const Player = require('../logic/player/player');


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

    try {
        const dungeon = player.getDungeonCardInHand(req.body.dungeonId)
        player.declareBuild(dungeon, req.body.buildIndex)
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        res.status(500)
        res.json({
            title: err.title || 'Server Error',
            message: err.message,
            errors: err.errors,
            stack: err.stack
        })
        return
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Play spell
router.post('/:lobbyId/play-spell', assignPlayer, (req, res, next) => {

    try {
        const player = req.player
        player.playSpell(req.body.spellId)
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Select item for requested selection
router.post('/:lobbyId/select-item', assignPlayer, (req, res, next) => {

    try {
        const player = req.player
        let selectedCard
        switch (player.requestedSelection.getRequestItemType()) {
            case SelectionRequest.requestItemTypes.HERO: {
                selectedCard = HeroCard.getHero(req.body.itemId)
                break
            }
            case SelectionRequest.requestItemTypes.PLAYER: {
                selectedCard = Player.getPlayer(req.body.itemId)
                break
            }
            case SelectionRequest.requestItemTypes.DUNGEON: {
                selectedCard = DungeonCard.getDungeon(req.body.itemId)
                break
            }
            case SelectionRequest.requestItemTypes.SPELL: {
                selectedCard = SpellCard.getSpell(req.body.itemId)
                break
            }
        }
        player.requestedSelection.selectItem(selectedCard)
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

// Accept spell play
router.post('/:lobbyId/accept-spell-play', assignPlayer, (req, res, next) => {
    const player = req.player

    try {
        player.acceptSpellPlay()
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Destroy dungeon
router.post('/:lobbyId/destroy-dungeon', assignPlayer, (req, res, next) => {
    const player = req.player

    try {
        player.destroyDungeonCard(req.body.dungeonId)
        updateLobbyPlayers(req.params.lobbyId)
    } catch (err) {
        next(err)
        return
    }
    return res.json({
        success: true
    })
})

// Use dungeon effect
router.post('/:lobbyId/use-dungeon', assignPlayer, (req, res, next) => {
    const player = req.player

    try {
        player.useDungeonEffect(req.body.dungeonId)
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
