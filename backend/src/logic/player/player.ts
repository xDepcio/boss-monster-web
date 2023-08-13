import { feedback } from "../game/actionFeedbacks"
import { BossCard, Card, DungeonCard, HeroCard, SpellCard } from "../game/cards"
import { Game } from "../game/game"
import { SelectionRequest, SelectionRequestNEW, SelectionRequestOneFromGivenList, SelectionRequestUniversal } from "../game/playerRequestSelections"
import { Id } from "../types"

const {
    PlayerAlreadyDeclaredBuild,
    DungeonCardsStackEmpty,
    SpellCardsStackEmpty,
    CardCannotBeBuilt,
    DungeonFullError,
    BossCardStackEmpty,
    NoSuchBossInPlayerCards,
    PlayerAlreadySelectedBoss,
    InvalidFancyDungeonBuild,
    NoSuchDungeonInPlayerCards,
    WrongPhaseToBuild,
    PhaseNotFinished,
    PlayerAlreadyReady,
    PlayerAlreadyAcceptedHeroMove,
    CardCannotBeDestroyed,
    NoSuchDungeonCardInPlayerDungeon,
    WrongRoundPhase,
    NoSuchSpellInPlayerHand,
    OtherSpellCurrentlyAtPlay,
    PlayerAlreadyAcceptedSpellPlay,
    NoSpellCurrentylAtPlay,
    DungeonEffectCannotBeUsed,
    PlayerHasNotEnoughMoney,
    NoSuchHeroAtDungeonEntrance
} = require('../errors')
// const { feedback } = require('../game/actionFeedbacks')
// const { mechanicsTypes } = require('../game/unique_mechanics/dungeonMechanics')
export type BuildOptions = {
    ignoreRoundPhase?: boolean
}

class Player {
    static players: { [id: Id]: Player } = {}

    objectType: 'PLAYER_OBJECT' = 'PLAYER_OBJECT'
    id: Id
    name: string
    dungeonCards: DungeonCard[]
    spellCards: SpellCard[]
    trackedGame: Game | null
    finishedPhase: boolean
    dungeon: DungeonCard[]
    dungeonEntranceHeroes: HeroCard[]
    acceptedHeroMove: boolean
    acceptedSpellPlay: boolean
    health: number
    money: number
    defeatedHeroes: HeroCard[]
    drawnBosses: BossCard[]
    selectedBoss: BossCard | null
    totalScore: number
    declaredBuild: DungeonCard | null
    heroesThatDefeatedPlayer: HeroCard[]
    collectedTreasure: {
        faith: number,
        strength: number,
        magic: number,
        fortune: number
    }
    requestedSelection: SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>
    requestedSelectionsQueue: (SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>)[]
    automaticallyDrawNewRoundCards: boolean

    constructor(id: Id, name: string) {
        this.objectType = "PLAYER_OBJECT"
        this.id = id
        this.name = name
        this.dungeonCards = []
        this.spellCards = []
        this.trackedGame = null
        this.finishedPhase = false
        this.dungeon = []
        this.dungeonEntranceHeroes = []
        this.acceptedHeroMove = false
        this.acceptedSpellPlay = false
        this.health = 5
        this.money = 3
        this.defeatedHeroes = []
        this.drawnBosses = []
        this.selectedBoss = null
        this.totalScore = 0
        this.declaredBuild = null
        this.heroesThatDefeatedPlayer = []
        this.requestedSelectionsQueue = []
        this.automaticallyDrawNewRoundCards = true
        this.collectedTreasure = {
            faith: 0,
            strength: 0,
            magic: 0,
            fortune: 0
        }
        this.requestedSelection = null
        Player.players[id] = this
    }

    hasAcceptedSpellPlay() {
        return this.acceptedSpellPlay
    }

    setAutomaticallyDrawNewRoundCards(bool: boolean) {
        this.automaticallyDrawNewRoundCards = bool
    }

    shouldAutomaticallyDrawNewRoundCards() {
        return this.automaticallyDrawNewRoundCards
    }

    acceptSpellPlay() {
        const spell = this.trackedGame.getCurrentlyPlayedSpell()
        if (!spell) {
            throw new NoSpellCurrentylAtPlay('You cannot accept spell play when there is none at play')
        }
        if (this.hasAcceptedSpellPlay()) {
            throw new PlayerAlreadyAcceptedSpellPlay('Player has already accepted spell play')
        }
        this.acceptedSpellPlay = true
        this.trackedGame.saveGameAction(feedback.PLAYER_ACCEPTED_SPELL_PLAY(this, spell))
        spell.play()
    }

    payGold(amount: number, toPlayer: Player | null = null) {
        if (amount > this.money) {
            throw new PlayerHasNotEnoughMoney("You don't have enough money.")
        }
        this.money -= amount

        if (toPlayer) {
            toPlayer.addGold(amount)
        }
    }

    becomeNotReadyForSpellPlay() {
        this.acceptedSpellPlay = false
    }

    getName() {
        return this.name
    }

    addRequestedSelection(selection: SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>, prioritize: boolean = false) {
        if (prioritize) {
            this.requestedSelectionsQueue.unshift(selection)
        }
        else {
            this.requestedSelectionsQueue.push(selection)
        }
    }

    removeRequestedSelection(selection: SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>) {
        this.requestedSelectionsQueue.splice(this.requestedSelectionsQueue.findIndex(s => s === selection), 1)
    }

    getNextRequestedSelection(): SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any> {
        return this.requestedSelectionsQueue[0] ?? null
    }

    setRequestedSelection(selection: SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>) {
        this.requestedSelection = selection
        if (this.trackedGame.roundPhase === 'postBuild' && selection === null) {
            this.trackedGame.checkForPhaseEnd()
        }
    }

    drawStartCards() {
        this.drawNotUsedDungeonCard()
        this.drawNotUsedDungeonCard()
        this.drawNotUsedDungeonCard()
        this.drawNotUsedSpellCard()
        this.drawNotUsedSpellCard()
    }

    drawSpecificDungeonCard(dungeonId: Id) {
        const card = this.trackedGame.notUsedDungeonCardsStack.find(card => card.id === dungeonId)
        if (!card) {
            throw new Error("No such dungeon in not used cards stack.")
        }
        this.trackedGame.notUsedDungeonCardsStack.splice(this.trackedGame.notUsedDungeonCardsStack.findIndex(card => card.id === dungeonId), 1)
        this.dungeonCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_DUNGEON_CARD(this))
    }

    addHeroToDungeonEntrance(hero: HeroCard) {
        this.dungeonEntranceHeroes.push(hero)
        hero.setDungeonOwner(this)
    }

    trackGame(game: Game) {
        this.trackedGame = game
    }

    drawStartingBosses() {
        this.drawNotUsedBossCard()
        this.drawNotUsedBossCard()
    }

    drawDungeonFromDiscardedCardsStack(dungeonId: Id) {
        const cardIndex = this.trackedGame.discardedDungeonCardsStack.findIndex(card => card.id === dungeonId)
        if (cardIndex === -1) {
            throw new Error("No such dungeon in discarded cards stack.")
        }
        const [card] = this.trackedGame.discardedDungeonCardsStack.splice(cardIndex, 1)
        this.dungeonCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_DUNGEON_CARD(this))
    }

    drawSpellFromDiscardedCardsStack(spellId: Id) {
        const cardIndex = this.trackedGame.discardedSpellCardsStack.findIndex(card => card.id === spellId)
        if (cardIndex === -1) {
            throw new Error("No such spell in discarded cards stack.")
        }
        const [card] = this.trackedGame.discardedSpellCardsStack.splice(cardIndex, 1)
        this.spellCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_SPELL_CARD(this))
    }

    drawDungeonFromUsedCardsStack(dungeonId: Id) {
        const card = this.trackedGame.discardedDungeonCardsStack.find(card => card.id === dungeonId && card instanceof DungeonCard) as DungeonCard || undefined
        if (!card) {
            throw new Error("No such dungeon in used cards stack.")
        }
        this.trackedGame.discardedDungeonCardsStack.splice(this.trackedGame.discardedDungeonCardsStack.findIndex(card => card.id === dungeonId && card instanceof DungeonCard), 1)
        this.dungeonCards.push(card)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_DUNGEON_CARD(this))
    }

    selectBoss(bossId: Id): void {
        if (this.selectedBoss) {
            throw new PlayerAlreadySelectedBoss("Cannot select another boss in the same game")
        }
        const foundBoss = this.drawnBosses.find(boss => boss.id === bossId)
        if (!foundBoss) {
            throw new NoSuchBossInPlayerCards("Tried to select boss that wasn't in player cards")
        }
        this.selectedBoss = foundBoss
        this.trackedGame.saveGameAction(feedback.PLAYER_SELECTED_BOSS(this, foundBoss))
        this.selectedBoss.setOwner(this)
        this.updateCollectedTreasure()
        this.becomeReady()
    }

    drawNotUsedDungeonCard(): DungeonCard {
        const card = this.trackedGame.notUsedDungeonCardsStack.pop()
        if (!card) {
            throw new DungeonCardsStackEmpty("Can't draw from empty dungeon stack")
        }
        this.dungeonCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_DUNGEON_CARD(this))
        return card
    }

    drawNotUsedSpellCard(): SpellCard {
        const card = this.trackedGame.notUsedSpellCardsStack.pop()
        if (!card) {
            throw new SpellCardsStackEmpty("Can't draw from empty spell stack")
        }
        this.spellCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_SPELL_CARD(this))
        return card
    }

    drawNotUsedBossCard(): void {
        const boss = this.trackedGame.notUsedBossesStack.pop()
        if (!boss) {
            throw new BossCardStackEmpty("Can't draw from empty boss stack")
        }
        this.drawnBosses.push(boss)
    }

    declareBuild(card: DungeonCard, index: number | null = null, options?: BuildOptions) {
        if (this.checkIfDungeonBuildValid(card, index, options)) {
            if (index !== null) {
                card.setCardToBuildOn(this.dungeon[index])
            }
            this.declaredBuild = card
            this.trackedGame.saveGameAction(feedback.PLAYER_DECLARED_BUILD(this))
            this.useDungeonCard(card)
        }
    }

    checkIfDungeonBuildValid(card: DungeonCard, index: number | null, buildOptions?: BuildOptions): boolean {
        if (this.trackedGame.getCurrentlyPlayedSpell()) {
            throw new OtherSpellCurrentlyAtPlay("You have to wait for current spell play to end to build a dungeon.")
        }
        if (this.trackedGame.roundPhase !== 'build' && !buildOptions?.ignoreRoundPhase) {
            throw new WrongPhaseToBuild("Cards can only be build during bild phase")
        }
        if (this.declaredBuild) {
            throw new PlayerAlreadyDeclaredBuild("Player already declared card to build in this round")
        }
        if (card.CARDTYPE !== 'DUNGEON') {
            throw new CardCannotBeBuilt("Only dungeon cards can be built")
        }
        if (index === null) {
            if (this.dungeon.length >= 5) {
                throw new DungeonFullError("Cannot build card because player's dungeon is full")
            }
            if (card.isFancy) {
                throw new InvalidFancyDungeonBuild("Fancy dungeon can only be built on top of normal dungeon with matching type")
            }
        }
        else {
            const cardToBuildOn = this.dungeon[index]
            if (card.isFancy) {
                if (!card.canBeBuiltOn(cardToBuildOn)) {
                    return false
                    // throw new InvalidFancyDungeonBuild("Fancy dungeon can only be built on top of normal dungeon with matching type")
                }
            }
        }
        return true
    }

    useDungeonCard(card: DungeonCard) {
        for (let i = 0; i < this.dungeonCards.length; i++) {
            const posessedCard = this.dungeonCards[i]
            if (posessedCard.id === card.id) {
                this.dungeonCards.splice(i, 1)
                return posessedCard
            }
        }
        return false
    }

    playSpell(spellId: Id): void {
        const spell = this.getSpellInHandById(spellId)
        if (this.checkIfSpellPlayValid(spell)) {
            this.trackedGame.players.forEach(player => player.becomeNotReadyForSpellPlay())
            spell.play()
        }
    }

    /** Discard spell card
     * @param spell SpellCard to discard
     * @param silent Default false. If true, no game action will be triggered
     */
    discardSpellCard(spell: SpellCard, silent: boolean = false) {
        const spellIndex = this.spellCards.findIndex(spellCard => spellCard.id === spell.id)
        spell.setOwner(null)
        this.spellCards.splice(spellIndex, 1)
        this.trackedGame.discardedSpellCardsStack.push(spell)
        if (!silent) {
            this.trackedGame.saveGameAction(feedback.PLAYER_THROWN_AWAY_SPELL_CARD(this, spell))
        }
    }

    discardDungeonCard(dungeon: DungeonCard) {
        const dungeonIndex = this.dungeonCards.findIndex(dungeonCard => dungeonCard.id === dungeon.id)
        dungeon.setOwner(null)
        this.dungeonCards.splice(dungeonIndex, 1)
        this.trackedGame.discardedDungeonCardsStack.push(dungeon)
        this.trackedGame.saveGameAction(feedback.PLAYER_THROWN_AWAY_DUNGEON_CARD(this, dungeon))
    }

    receiveCard(card: DungeonCard | SpellCard) {
        if (card instanceof SpellCard) {
            this.spellCards.push(card)
        }
        else if (card instanceof DungeonCard) {
            this.dungeonCards.push(card)
        }
        card.setOwner(this)
    }

    takeCardFromPlayer(card: DungeonCard | SpellCard, player: Player) {
        if (card instanceof SpellCard) {
            const spellIndex = player.spellCards.findIndex(spellCard => spellCard.id === card.id)
            player.spellCards.splice(spellIndex, 1)
            card.setOwner(this)
            this.spellCards.push(card)
            this.trackedGame.saveGameAction(feedback.PLAYER_TOOK_SPELL_FROM_PLAYER(this, player, card))
        }
        else if (card instanceof DungeonCard) {
            const dungeonIndex = player.dungeonCards.findIndex(dungeonCard => dungeonCard.id === card.id)
            player.dungeonCards.splice(dungeonIndex, 1)
            card.setOwner(this)
            this.dungeonCards.push(card)
            this.trackedGame.saveGameAction(feedback.PLAYER_TOOK_DUNGEON_FROM_PLAYER(this, player, card))
        }
    }

    checkIfSpellPlayValid(spellCard: SpellCard) {
        if (spellCard.playablePhase !== this.trackedGame.roundPhase) {
            throw new WrongRoundPhase(`${spellCard.name} can only be played during ${spellCard.playablePhase} phase. Current phase: ${this.trackedGame.roundPhase}`)
        }
        if (this.trackedGame.getCurrentlyPlayedSpell()) {
            throw new OtherSpellCurrentlyAtPlay("You have to wait for other spell play to end to use your spell.")
        }
        return true
    }

    buildDeclaredDungeon() {
        if (this.declaredBuild === null) return
        if (this.declaredBuild.belowDungeon === null) {
            this.dungeon.push(this.declaredBuild)
        }
        else {
            const toBuildOnIndex = this.dungeon.findIndex(card => card.id === this.declaredBuild.belowDungeon.id)
            this.dungeon.splice(toBuildOnIndex, 1, this.declaredBuild)
        }
        this.updateCollectedTreasure()
        this.trackedGame.saveGameAction(feedback.PLAYER_BUILD_DUNGEON(this, this.declaredBuild))
        this.declaredBuild = null
    }

    /** destroys dungeon card.
     * @param cardId id of dungeon card to destroy
     * @param silent Default false. if true, no game action will be triggered
     */
    destroyDungeonCard(cardId: Id, silent: boolean = false) {
        const dungeonCard = this.getDungeonCardFromDungeon(cardId)
        if (this.checkIfDungeonDestoryValid(dungeonCard)) {
            this.deleteFromDungeon(dungeonCard)
            if (!silent) {
                dungeonCard.handleCardDestroyedMechanic()
                this.trackedGame.saveGameAction(feedback.PLAYER_DESTROYED_DUNGEON(this, dungeonCard))
            }
        }
    }

    checkIfDungeonDestoryValid(dungeonCard: DungeonCard) {
        if (!dungeonCard.isDestroyable()) {
            throw new CardCannotBeDestroyed("This dungeon cannot be destroyed")
        }
        if (this.trackedGame.getCurrentlyPlayedSpell()) {
            throw new OtherSpellCurrentlyAtPlay("You can't destory a dungeon when there is a spell at play.")
        }
        return true
    }

    deleteFromDungeon(dungeonCard: DungeonCard) {
        const cardIndex = this.dungeon.findIndex(dungeon => dungeon.id === dungeonCard.id)
        if (!dungeonCard.belowDungeon) {
            this.dungeon.splice(cardIndex, 1)
        }
        else {
            this.dungeon.splice(cardIndex, 1, dungeonCard.belowDungeon)
        }
        this.updateCollectedTreasure()
    }

    useDungeonEffect(dungeonId: Id) {
        const dungeonCard = this.getDungeonCardFromDungeon(dungeonId)
        if (this.checkIfDungeonUseValid(dungeonCard)) {
            dungeonCard.handleDungeonUsed()
        }
    }

    checkIfDungeonUseValid(dungeonCard: DungeonCard) {
        if (!dungeonCard.isUsable()) {
            throw new DungeonEffectCannotBeUsed("This dungeons effect is not usable.")
        }
        return true
    }

    getDungeonCardFromDungeon(cardId: Id): DungeonCard {
        const dungeonCard = this.dungeon.find(dung => dung.id === cardId)
        if (!dungeonCard) {
            throw new NoSuchDungeonCardInPlayerDungeon(`Dungeon with id ${cardId} not found in player dungeon`)
        }
        return dungeonCard
    }

    getDungeonCardInHand(cardId: Id): DungeonCard {
        for (let dungeon of this.dungeonCards) {
            if (dungeon.id === cardId) {
                return dungeon
            }
        }
        throw new NoSuchDungeonInPlayerCards(`Dungeon with id ${cardId} not found in player cards`)
    }

    getHeroFromDungeonEntranceById(heroId: Id): HeroCard {
        const hero = this.dungeonEntranceHeroes.find(hero => hero.id === heroId)
        if (!hero) {
            throw new NoSuchHeroAtDungeonEntrance(`Hero with id ${heroId} was not found in player dungeon`)
        }
        return hero
    }

    getSpellInHandById(spellId: Id): SpellCard {
        const spell = this.spellCards.find(spellCard => spellCard.id === spellId)
        if (!spell) {
            throw new NoSuchSpellInPlayerHand(`Player does not have spell with id ${spellId}`)
        }
        return spell
    }

    addGold(amount: number): void {
        this.money += amount
    }

    updateCollectedTreasure(): void {
        this.collectedTreasure = {
            faith: 0,
            strength: 0,
            magic: 0,
            fortune: 0
        }
        for (const dungeonCard of this.dungeon) {
            for (const [treasureSign, treasureAmount] of Object.entries(dungeonCard.treasure)) {
                this.collectedTreasure[treasureSign] += treasureAmount
            }
        }
        for (const [treasureSign, treasureAmount] of Object.entries(this.selectedBoss.treasure)) {
            this.collectedTreasure[treasureSign] += treasureAmount
        }
    }

    becomeReady() {
        if (this.isReady()) {
            throw new PlayerAlreadyReady('Player is already ready')
        }
        if (this.trackedGame.getHeroToMove()) {
            throw new PhaseNotFinished('Cannot become ready when there are heroes at players dungeons')
        }
        this.finishedPhase = true
        this.trackedGame.saveGameAction(feedback.PLAYER_BECOME_READY(this))
        this.trackedGame.checkForPhaseEnd()
    }

    becomeNotReady() {
        this.finishedPhase = false
    }

    isReady() {
        return this.finishedPhase
    }

    hasAcceptedHeroEntrance() {
        return this.acceptedHeroMove
    }

    acceptHeroMove() {
        if (this.hasAcceptedHeroEntrance()) {
            throw new PlayerAlreadyAcceptedHeroMove('Player has already accepted current hero move')
        }
        this.acceptedHeroMove = true
        this.trackedGame.saveGameAction(feedback.PLAYER_ACCEPTED_HERO_MOVE(this))
        this.trackedGame.requestHeroDungeonEntrance()
    }

    becomeNotReadyForHeroMove() {
        this.acceptedHeroMove = false
    }

    getDamage(damageAmount: number) {
        this.health -= damageAmount
        if (this.health <= 0) {
            this.die()
        }
    }

    die() {
        throw new Error('PLAYER DIED. TODO...')
    }

    updateScore() {
        let score = 0
        for (let hero of this.defeatedHeroes) {
            score += hero.damageDealt
        }
        this.totalScore = score
        this.checkWin()
    }

    checkWin() {
        if (this.totalScore >= 10) {
            this.declareWin()
        }
    }

    declareWin() {
        throw new Error("PLAYER HAS WON. TODO...")
    }

    static getPlayer(playerId: Id): Player | null {
        return Player.players[playerId]
    }
}

// module.exports = Player

export { Player }
