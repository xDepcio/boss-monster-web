import { Player } from "../player/player"
import { CardPlayPhase, CardType, DungeonMechanicTypes, Id, RoundPhase, Treasure, TreasureSign } from "../types"
import { GameEvent, feedback } from "./actionFeedbacks"
import { Game } from "./game"
import { BossMechanic } from "./unique_mechanics/bossMecahnics"
import { CardAction } from "./unique_mechanics/customCardActions"
import { DungeonMechanic } from "./unique_mechanics/dungeonMechanics"
import { SpellMechanic } from "./unique_mechanics/spellsMechanics"

const { NotAllPlayersAcceptedHeroMove, HeroAlreadyInCity } = require('../errors')
// const { feedback, eventTypes } = require('./actionFeedbacks')
// const { mechanicsTypes } = require('./unique_mechanics/dungeonMechanics')

class Card {

    id: Id
    name: string
    CARDTYPE: CardType
    trackedGame: Game
    customCardActions: CardAction[]

    constructor(id: Id, name: string, CARDTYPE: CardType, trackedGame: Game) {
        this.id = id
        this.name = name
        this.CARDTYPE = CARDTYPE
        this.trackedGame = trackedGame
        this.customCardActions = []
    }

    addCustomCardAction(action: CardAction) {
        this.customCardActions.push(action)
    }

    getName() {
        return this.name
    }
}


class HeroCard extends Card {
    static heroes = {}

    health: number
    baseHealth: number
    treasureSign: TreasureSign
    damageDealt: number
    description: string | null
    specialName: string | null
    typeName: string | null
    dungeonRoom: DungeonCard | null
    dungeonOwner: Player | null
    finishedMoving: boolean
    isLegendary: boolean

    constructor(id: Id, name: string, CARDTYPE: CardType, trackedGame: Game, health: number,
        treasureSign: TreasureSign, damageDealt: number, description: string | null = null,
        specialName: string | null = null, typeName: string | null = null, isLegendary: boolean = false
    ) {
        super(id, name, CARDTYPE, trackedGame)
        this.health = health
        this.baseHealth = health
        this.treasureSign = treasureSign
        this.damageDealt = damageDealt
        this.description = description
        this.specialName = specialName
        this.typeName = typeName
        this.dungeonRoom = null
        this.dungeonOwner = null
        this.finishedMoving = false
        this.isLegendary = isLegendary
        HeroCard.heroes[id] = this
    }

    setDungeonOwner(player: Player) {
        this.dungeonOwner = player
    }

    setDungeonRoom(dungeonCard: DungeonCard) {
        this.dungeonRoom = dungeonCard
    }

    goToLuredPlayer() {
        const mostValuablePlayer = this.getMostValuablePlayer(this.trackedGame.players)
        if (mostValuablePlayer) {
            this.goToPlayer(mostValuablePlayer)
            // this.trackedGame.saveGameAction(feedback.HERO_GOTO_PLAYER(this, mostValuablePlayer))
            // this.removeSelfFromCity()
            // mostValuablePlayer.addHeroToDungeonEntrance(this)
            // this.setDungeonOwner(mostValuablePlayer)
        }
    }

    goToPlayer(player: Player) {
        this.trackedGame.saveGameAction(feedback.HERO_GOTO_PLAYER(this, player))
        this.removeSelfFromCity()
        player.addHeroToDungeonEntrance(this)
        this.setDungeonOwner(player)
    }

    getMostValuablePlayer(players: Player[]): Player | null {
        let choosen = null
        let lastMaxPlayer: Player
        for (let player of players) {
            if (!lastMaxPlayer) {
                lastMaxPlayer = player
                choosen = lastMaxPlayer
            }
            else {
                if (player.collectedTreasure[this.treasureSign] === lastMaxPlayer.collectedTreasure[this.treasureSign]) {
                    choosen = null
                }
                else if (player.collectedTreasure[this.treasureSign] > lastMaxPlayer.collectedTreasure[this.treasureSign]) {
                    choosen = player
                    lastMaxPlayer = player
                }
            }
        }
        return choosen
    }

    goBackToCity() {
        if (this.isInCity()) {
            throw new HeroAlreadyInCity("Hero ordered to go back to city, was already in city")
        }
        this.trackedGame.addHeroToCity(this)
        this.removeSelfFromDungeonEntrance()
        this.setDungeonOwner(null)
        this.dungeonRoom = null
        this.health = this.baseHealth
        this.trackedGame.saveGameAction(feedback.HERO_WENT_BACK_TO_CITY(this))
        this.finishMoving()
    }

    isInCity(): boolean {
        for (let hero of this.trackedGame.city) {
            if (hero.id === this.id) {
                return true
            }
        }
        return false
    }

    removeSelfFromCity() {
        const heroIndexInCity = this.trackedGame.city.findIndex((hero) => hero.id === this.id)
        this.trackedGame.city.splice(heroIndexInCity, 1)
    }

    removeSelfFromDungeonEntrance() {
        const heroIndexInEntrance = this.dungeonOwner.dungeonEntranceHeroes.findIndex((hero) => hero.id === this.id)
        this.dungeonOwner.dungeonEntranceHeroes.splice(heroIndexInEntrance, 1)
    }

    moveToNextRoom() {
        if (this.checkAllPlayersAcceptedHeroEntrance()) {
            if (this.dungeonRoom === null) {
                if (this.dungeonOwner.dungeon.length === 0) {
                    this.finishPlayerDungeon()
                }
                else {
                    this.dungeonRoom = this.dungeonOwner.dungeon[this.dungeonOwner.dungeon.length - 1]
                    this.triggerCurrentDungeonCard()
                }
            }
            else {
                const newDungeonIndex = this.dungeonOwner.dungeon.findIndex(dung => dung.id === this.dungeonRoom.id) - 1
                if (newDungeonIndex === -1) {
                    this.finishPlayerDungeon()
                }
                else {
                    this.dungeonRoom = this.dungeonOwner.dungeon[newDungeonIndex]
                    this.triggerCurrentDungeonCard()
                }
            }
        }
        else {
            throw new NotAllPlayersAcceptedHeroMove("All players must accept hero move")
        }
    }

    hasFinishedMoving(): boolean {
        return this.finishedMoving
    }

    finishMoving() {
        this.finishedMoving = true
        this.trackedGame.players.forEach(player => player.becomeNotReadyForHeroMove())
        this.trackedGame.selectNextHeroToMove()
    }

    triggerCurrentDungeonCard() {
        this.dungeonRoom.heroEnteredRoom(this)
    }

    checkDeath(): boolean {
        return this.health <= 0
    }

    getDamaged(amount: number) {
        this.health -= amount
        this.trackedGame.saveGameAction(feedback.HERO_DAMAGED(this, amount, this.dungeonOwner))
        if (this.checkDeath()) {
            if (this.dungeonRoom) {
                this.trackedGame.saveGameAction(feedback.HERO_DIED_IN_ROOM(this, this.dungeonRoom))
            }
            this.die()
        }
    }

    die() {
        this.trackedGame.saveGameAction(feedback.PLAYER_KILLED_HERO(this.dungeonOwner, this))
        this.dungeonOwner.defeatedHeroes.push(this)
        this.removeSelfFromDungeonEntrance()
        this.dungeonOwner.updateScore()
        this.finishMoving()
    }

    finishPlayerDungeon() {
        this.dungeonOwner.heroesThatDefeatedPlayer.push(this)
        this.damageCurrentPlayer()
        this.removeSelfFromDungeonEntrance()
        this.finishMoving()
    }

    damageCurrentPlayer() {
        this.trackedGame.saveGameAction(feedback.HERO_ATTACKED_PLAYER(this, this.dungeonOwner))
        this.dungeonOwner.getDamage(this.damageDealt)
    }

    checkAllPlayersAcceptedHeroEntrance(): boolean {
        for (let player of this.trackedGame.players) {
            if (!player.hasAcceptedHeroEntrance()) {
                return false
            }
        }
        return true
    }

    static getHero(heroId: Id): HeroCard | undefined {
        return HeroCard.heroes[heroId]
    }
}


class DungeonCard extends Card {
    static dungeons = {}

    baseDamage: number
    damage: number
    // treasure: TreasureSign
    treasure: Treasure
    baseTreasure: Treasure
    type: 'monsters' | 'traps'
    isFancy: boolean
    description: string | null
    belowDungeon: DungeonCard | null
    isActive: boolean
    owner: Player | null
    allowDestroy: boolean
    allowUse: boolean
    mechanic: DungeonMechanic | null
    disableFancyBuildOnTop: boolean
    onRactivateActions: () => void | null

    constructor(
        id: Id,
        name: string,
        CARDTYPE: CardType,
        trackedGame: Game,
        baseDamage: number,
        treasure: Treasure,
        type: 'monsters' | 'traps',
        isFancy: boolean,
        mechanic: typeof DungeonMechanic,
        mechanicType: DungeonMechanicTypes,
        mechanicDescription: string
    ) {
        super(id, name, CARDTYPE, trackedGame)
        this.baseDamage = baseDamage
        this.damage = baseDamage
        this.treasure = treasure
        this.baseTreasure = treasure
        this.type = type
        this.isFancy = isFancy
        this.description = null
        this.belowDungeon = null
        this.isActive = true
        this.owner = null
        this.allowDestroy = false
        this.allowUse = false
        this.disableFancyBuildOnTop = false
        this.onRactivateActions = null
        this.mechanic = mechanic ? new mechanic(this, mechanicDescription, mechanicType) : null
        DungeonCard.dungeons[id] = this
    }

    setOwner(player: Player) {
        this.owner = player
    }

    getDescription() {
        return this.description
    }

    getMechanic() {
        return this.mechanic
    }

    setDescription(description: string) {
        this.description = description
    }

    setDisableFancyBuildOnTop(bool: boolean) {
        this.disableFancyBuildOnTop = bool
    }

    getHeroOnThisDungeon(): HeroCard | null {
        if (this.owner) {
            for (let hero of this.owner.dungeonEntranceHeroes) {
                if (hero.dungeonRoom?.id === this.id) {
                    return hero
                }
            }
        }
        return null
    }

    activate() {
        this.isActive = true
        this.treasure = this.baseTreasure
        this.damage = this.baseDamage
        if (this.onRactivateActions) {
            this.onRactivateActions()
        }
        this.onRactivateActions = null
        this.trackedGame.saveGameAction(feedback.DUNGEON_CARD_GOT_ACTIVATED(this))
    }

    deactivate() {
        this.isActive = false
        this.treasure = {}
        this.damage = 0
        let changedActions: CardAction[] = []
        this.customCardActions.forEach(action => {
            if (!action.isDisabled()) {
                action.setActionDisabled(true)
                changedActions.push(action)
            }
        })
        this.onRactivateActions = () => changedActions.forEach(action => action.setActionDisabled(false))
        this.trackedGame.saveGameAction(feedback.DUNGEON_CARD_GOT_DEACTIVATED(this))
    }

    heroEnteredRoom(hero: HeroCard) {
        this.trackedGame.saveGameAction(feedback.HERO_ENTERED_ROOM(hero, this, this.owner))
        this.damageHero(hero)
    }

    damageHero(hero: HeroCard) {
        hero.getDamaged(this.damage)
        // this.trackedGame.saveGameAction(feedback.HERO_DAMAGED(hero, this, hero.dungeonOwner))
        // if (hero.checkDeath()) {
        //     hero.die()
        //     this.handleHeroDiedInRoom(hero)
        // }
    }

    setAllowDestroy(bool: boolean) {
        this.allowDestroy = bool
    }

    setAllowUse(bool: boolean) {
        this.allowUse = bool
    }

    isDestroyable() {
        return this.allowDestroy
    }

    isUsable() {
        return this.allowUse
    }

    // handleHeroDiedInRoom(killedHero: HeroCard) {
    //     this.trackedGame.saveGameAction(feedback.HERO_DIED_IN_ROOM(killedHero, this))
    // }

    setCardToBuildOn(dungeonCard: DungeonCard) {
        this.belowDungeon = dungeonCard
        this.belowDungeon.isActive = false
    }

    handleCardDestroyedMechanic() {
        if (this.mechanic.getType() === "onDestroy") {
            this.mechanic.use()
        }
    }

    handleDungeonUsed() {
        if (this.mechanic.getType() === "onUseOnePerRound") {
            this.mechanic.use()
        }
    }

    handleGameEvent(event) {
        const dungeonMechanic = this.getMechanic()
        if (dungeonMechanic) {
            dungeonMechanic.handleGameEvent(event)
        }
        if (this.belowDungeon) {
            this.belowDungeon.handleGameEvent(event)
        }
    }

    canBeBuiltOn(cardToBuildOn: DungeonCard): boolean {
        if (this.isFancy) {
            if (cardToBuildOn.disableFancyBuildOnTop) {
                throw Error("You can't build fancy dungeon on top of this card.")
            }
            if (!this.matchesTreasureWith(cardToBuildOn)) {
                throw Error("Fancy dungeon can only be built on top of an another dungeon with matching treasure.")
            }
        }
        else {

        }
        // if (!this.isFancy) return true
        // if (this.matchesTreasureWith(cardToBuildOn)) return true
        return true
    }

    matchesTreasureWith(anotherCard: DungeonCard) {
        if (Object.keys(anotherCard.treasure).length > 1) return false
        if (Object.keys(this.treasure)[0] === Object.keys(anotherCard.treasure)[0]) return true
        return false
    }

    static getDungeon(dungeonId: Id): DungeonCard | undefined {
        return DungeonCard.dungeons[dungeonId]
    }
}


class SpellCard extends Card {
    static spells: { [id: Id]: SpellCard } = {}

    playablePhase: CardPlayPhase
    description: string | null
    owner: Player | null
    mechanic: SpellMechanic | null
    private allowForcePlay: boolean

    constructor(id: Id, name: string, CARDTYPE: CardType, trackedGame: Game, playablePhase: CardPlayPhase,
        mechanic: typeof SpellMechanic | null, mechanicDescription: string
    ) {
        super(id, name, CARDTYPE, trackedGame)
        this.playablePhase = playablePhase
        this.description = null
        this.owner = null
        this.allowForcePlay = false
        this.mechanic = mechanic ? new mechanic(this, mechanicDescription) : null
        SpellCard.spells[id] = this
    }

    public setAllowForcePlay(bool: boolean) {
        this.allowForcePlay = bool
    }

    public canForcePlay() {
        return this.allowForcePlay
    }

    setOwner(player: Player | null) {
        this.owner = player
    }

    getDescription() {
        return this.description
    }

    setDescription(description: string) {
        this.description = description
    }

    forcePlay() {
        const owner = this.owner
        this.owner.discardSpellCard(this, true)
        this.mechanic.use(owner)
        this.trackedGame.saveGameAction(feedback.PLAYER_PLAYED_SPELL(owner, this))
    }

    cancelPlay() {
        this.trackedGame.setCurrentlyPlayedSpell(null)
        this.trackedGame.players.forEach(player => player.becomeNotReadyForSpellPlay())
        this.owner.discardSpellCard(this, true)
        this.trackedGame.saveGameAction(feedback.SPELL_GOT_CANCELLED(this))
    }

    play() {
        this.trackedGame.setCurrentlyPlayedSpell(this)
        if (this.trackedGame.hasAllPlayersAcceptedSpellPlay()) {
            const owner = this.owner
            this.owner.discardSpellCard(this, true)
            this.mechanic.use(owner)
            this.trackedGame.setCurrentlyPlayedSpell(null)
            this.trackedGame.players.forEach(player => player.becomeNotReadyForSpellPlay())
            this.trackedGame.saveGameAction(feedback.PLAYER_PLAYED_SPELL(owner, this))
        }
    }

    // completeUsage() {
    //     this.trackedGame.saveGameAction(feedback.PLAYER_PLAYED_SPELL(this.owner, this))
    //     this.owner.discardSpellCard(this, true)
    // }

    static getSpell(spellId: Id): SpellCard | undefined {
        return SpellCard.spells[spellId]
    }
}


class BossCard extends Card {
    static bosses = {}

    pd: number
    treasure: TreasureSign
    rankedUp: boolean
    owner: Player | null
    mechanic: BossMechanic

    constructor(id: Id, name: string, CARDTYPE: CardType, trackedGame: Game, pd: number,
        treasure: TreasureSign, mechanic: typeof BossMechanic, mechanicDescription: string
    ) {
        super(id, name, CARDTYPE, trackedGame)
        this.pd = pd
        this.treasure = treasure
        this.rankedUp = false
        this.owner = null
        this.mechanic = mechanic ? new mechanic(this, mechanicDescription) : null
        BossCard.bosses[id] = this
    }

    getMechanic() {
        return this.mechanic
    }

    setOwner(player: Player) {
        this.owner = player
    }

    setRankedUp(bool: boolean) {
        this.rankedUp = bool
        this.trackedGame.saveGameAction(feedback.PLAYER_RANKED_UP_BOSS(this.owner, this))
    }

    hasRankedUp() {
        return this.rankedUp
    }

    handleGameEvent(event: GameEvent) {
        const mechanic = this.getMechanic()
        if (mechanic) {
            mechanic.handleGameEvent(event)
        }
    }

    static getBoss(bossId: Id): BossCard | undefined {
        return BossCard.bosses[bossId]
    }
}


module.exports = {
    Card,
    HeroCard,
    DungeonCard,
    SpellCard,
    BossCard
}

export { DungeonCard, SpellCard, BossCard, HeroCard, Card }
