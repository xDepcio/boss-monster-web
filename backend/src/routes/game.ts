import { DungeonCard, HeroCard, SpellCard } from "../logic/game/cards";
import { SelectionRequestUniversal } from "../logic/game/playerRequestSelections";
import { CardAction } from "../logic/game/unique_mechanics/customCardActions";
import { Lobby } from "../logic/lobby/lobby";
import { Player } from "../logic/player/player";
import { saveInput } from "../utils/saveInput";

const express = require('express');
const router = express.Router();
// const uuid = require('uuid');
// const Lobby = require('../logic/lobby/lobby');
// const Player = require('../logic/player/player')
// const Game = require('../logic/game/game')
const { flattenCircular, getCurrentGameData } = require('../utils/responseFormat')
// const { assignPlayer } = require('../utils/verifyPlayer')
import { assignPlayer } from '../utils/verifyPlayer'
const { parse, stringify, toJSON, fromJSON } = require('flatted');
const { updateLobbyPlayers } = require('../utils/socketsHelper');
const { SelectionRequest, SelectionRequestOneFromGivenList } = require('../logic/game/playerRequestSelections');
// const { HeroCard, DungeonCard, SpellCard } = require('../logic/game/cards');
// const Player = require('../logic/player/player');
// const { CardAction } = require('../logic/game/unique_mechanics/customCardActions');


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
router.post('/:lobbyId/choose-boss', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/build-dungeon', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/play-spell', assignPlayer, saveInput, (req, res, next) => {

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
router.post('/:lobbyId/select-item', assignPlayer, saveInput, (req, res, next) => {

    try {
        const player: Player = req.player
        let selectedItem
        switch (player.requestedSelection.getRequestItemType()) {
            case "hero": {
                selectedItem = HeroCard.getHero(req.body.itemId)
                break
            }
            case "player": {
                selectedItem = Player.getPlayer(req.body.itemId)
                break
            }
            case "builtDungeon": {
                selectedItem = DungeonCard.getDungeon(req.body.itemId)
                break
            }
            case "dungeonCard": {
                selectedItem = DungeonCard.getDungeon(req.body.itemId)
                break
            }
            case "spell": {
                selectedItem = SpellCard.getSpell(req.body.itemId)
                break
            }
            case "treasure": {
                selectedItem = req.body.treasureSymbol
                break
            }
            case "CHOOSE_FROM_GIVEN_LIST": {
                selectedItem = req.body.selectedItem
                break
            }
            case "UNIVERSAL_SELECTION": {
                req.body.selectedItem = parse(req.body.selectedItem)
                const displayType = (player.requestedSelection as SelectionRequestUniversal<any>).metadata.displayType
                switch (displayType) {
                    case 'dungeonCard': {
                        selectedItem = DungeonCard.getDungeon(req.body.selectedItem.id)
                        break
                    }
                    case 'text': {
                        selectedItem = req.body.selectedItem
                        break
                    }
                    case "spellCard": {
                        selectedItem = SpellCard.getSpell(req.body.selectedItem.id)
                        break
                    }
                    case "mixed": {
                        const item = req.body.selectedItem
                        if (item?.CARDTYPE === 'DUNGEON') {
                            selectedItem = DungeonCard.getDungeon(item.id)
                        } else if (item?.CARDTYPE === 'SPELL') {
                            selectedItem = SpellCard.getSpell(item.id)
                        } else if (typeof item === 'string') {
                            selectedItem = item
                        } else if (item?.objectType === 'PLAYER_OBJECT') {
                            selectedItem = Player.getPlayer(item.id)
                        } else if (item?.CARDTYPE === 'HERO') {
                            selectedItem = HeroCard.getHero(item.id)
                        }
                    }
                }
            }
        }
        player.requestedSelection.selectItem(selectedItem)
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
router.post('/:lobbyId/become-ready', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/accept-hero-move', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/accept-spell-play', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/destroy-dungeon', assignPlayer, saveInput, (req, res, next) => {
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
router.post('/:lobbyId/use-dungeon', assignPlayer, saveInput, (req, res, next) => {
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

// Use custom card action
router.post('/:lobbyId/use-custom-action', assignPlayer, saveInput, (req, res, next) => {
    const player = req.player

    try {
        const cardAction = CardAction.getCardActionById(req.body.actionId)
        cardAction.handleUsedByPlayer(Player.getPlayer(req.player.id))
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

export { }
