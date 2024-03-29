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
    PlayerHasNotEnoughMoney
} = require('../errors')
const { feedback } = require('../game/actionFeedbacks')
const { mechanicsTypes } = require('../game/unique_mechanics/dungeonMechanics')


class Player {
    static players = {}

    constructor(id, name) {
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

    acceptSpellPlay() {
        const spell = this.trackedGame.getCurrentlyPlayedSpell()
        if (!spell) {
            throw new NoSpellCurrentylAtPlay('You cannot accept spell play when there is none at play')
        }
        if (this.hasAcceptedSpellPlay()) {
            throw new PlayerAlreadyAcceptedSpellPlay('Player has already accepted current hero move')
        }
        this.acceptedSpellPlay = true
        this.trackedGame.saveGameAction(feedback.PLAYER_ACCEPTED_SPELL_PLAY(this, spell))
        spell.play()
    }

    payGold(amount, toPlayer = null) {
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

    setRequestedSelection(selection) {
        this.requestedSelection = selection
    }

    drawStartCards() {
        this.drawNotUsedDungeonCard()
        this.drawNotUsedDungeonCard()
        this.drawNotUsedDungeonCard()
        this.drawNotUsedSpellCard()
        this.drawNotUsedSpellCard()
    }

    addHeroToDungeonEntrance(hero) {
        this.dungeonEntranceHeroes.push(hero)
    }

    trackGame(game) {
        this.trackedGame = game
    }

    drawStartingBosses() {
        this.drawNotUsedBossCard()
        this.drawNotUsedBossCard()
    }

    selectBoss(bossId) {
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

    drawNotUsedDungeonCard() {
        const card = this.trackedGame.notUsedDungeonCardsStack.pop()
        if (!card) {
            throw new DungeonCardsStackEmpty("Can't draw from empty dungeon stack")
        }
        this.dungeonCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_DUNGEON_CARD(this))
        return card
    }

    drawNotUsedSpellCard() {
        const card = this.trackedGame.notUsedSpellCardsStack.pop()
        if (!card) {
            throw new SpellCardsStackEmpty("Can't draw from empty spell stack")
        }
        this.spellCards.push(card)
        card.setOwner(this)
        this.trackedGame.saveGameAction(feedback.PLAYER_DRAWNED_SPELL_CARD(this))
        return card
    }

    drawNotUsedBossCard() {
        const boss = this.trackedGame.notUsedBossesStack.pop()
        if (!boss) {
            throw new BossCardStackEmpty("Can't draw from empty boss stack")
        }
        this.drawnBosses.push(boss)
    }

    declareBuild(card, index = null) {
        if (this.checkIfDungeonBuildValid(card, index)) {
            if (index !== null) {
                card.setCardToBuildOn(this.dungeon[index])
            }
            this.declaredBuild = card
            this.trackedGame.saveGameAction(feedback.PLAYER_DECLARED_BUILD(this))
            this.useDungeonCard(card)
        }
    }

    checkIfDungeonBuildValid(card, index) {
        if (this.trackedGame.getCurrentlyPlayedSpell()) {
            throw new OtherSpellCurrentlyAtPlay("You have to wait for current spell play to end to build a dungeon.")
        }
        if (this.trackedGame.roundPhase !== 'build') {
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
                    throw new InvalidFancyDungeonBuild("Fancy dungeon can only be built on top of normal dungeon with matching type")
                }
            }
        }
        return true
    }

    useDungeonCard(card) {
        for (let i = 0; i < this.dungeonCards.length; i++) {
            const posessedCard = this.dungeonCards[i]
            if (posessedCard.id === card.id) {
                this.dungeonCards.splice(i, 1)
                return posessedCard
            }
        }
        return false
    }

    playSpell(spellId) {
        const spell = this.getSpellInHandById(spellId)
        if (this.checkIfSpellPlayValid(spell)) {
            this.trackedGame.players.forEach(player => player.becomeNotReadyForSpellPlay())
            spell.play()
        }
    }

    throwCardAway(card) {
        if (card.CARDTYPE === 'SPELL') {
            this.trackedGame.saveGameAction(feedback.PLAYER_THROWN_AWAY_CARD(this, card))
            this.removeSpellFromHand(card)
        }
        else if (card.CARDTYPE === 'DUNGEON') {
            // TODO...
            throw new Error('TODO when player throw away dung card')
        }
        else {
            throw new Error('cardtype doesnnot exists proly TODO...')
        }
    }

    receiveCard(card) {
        if (card.CARDTYPE === 'SPELL') {
            this.spellCards.push(card)
        }
        else if (card.CARDTYPE === 'DUNGEON') {
            this.dungeonCards.push(card)
        }
        card.setOwner(this)
    }

    removeSpellFromHand(spell) {
        const spellIndex = this.spellCards.findIndex(spellCard => spellCard.id === spell.id)
        spell.setOwner(null)
        this.spellCards.splice(spellIndex, 1)
    }

    checkIfSpellPlayValid(spellCard) {
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

    destroyDungeonCard(cardId) {
        const dungeonCard = this.getDungeonCardFromDungeon(cardId)
        if (this.checkIfDungeonDestoryValid(dungeonCard)) {
            dungeonCard.handleCardDestroyedMechanic()
            this.deleteFromDungeon(dungeonCard)
            this.trackedGame.saveGameAction(feedback.PLAYER_DESTROYED_DUNGEON(this, dungeonCard))
        }
    }

    checkIfDungeonDestoryValid(dungeonCard) {
        if (!dungeonCard.isDestroyable()) {
            throw new CardCannotBeDestroyed("This dungeon cannot be destroyed")
        }
        if (this.trackedGame.getCurrentlyPlayedSpell()) {
            throw new OtherSpellCurrentlyAtPlay("You can't destory a dungeon when there is a spell at play.")
        }
        return true
    }

    deleteFromDungeon(dungeonCard) {
        const cardIndex = this.dungeon.findIndex(dungeon => dungeon.id === dungeonCard.id)
        if (!dungeonCard.belowDungeon) {
            this.dungeon.splice(cardIndex, 1)
        }
        else {
            this.dungeon.splice(cardIndex, 1, dungeonCard.belowDungeon)
        }
        this.updateCollectedTreasure()
    }

    useDungeonEffect(dungeonId) {
        const dungeonCard = this.getDungeonCardFromDungeon(dungeonId)
        if (this.checkIfDungeonUseValid(dungeonCard)) {
            dungeonCard.handleDungeonUsed()
        }
    }

    checkIfDungeonUseValid(dungeonCard) {
        if (!dungeonCard.isUsable()) {
            throw new DungeonEffectCannotBeUsed("This dungeons effect is not usable.")
        }
        return true
    }

    getDungeonCardFromDungeon(cardId) {
        const dungeonCard = this.dungeon.find(dung => dung.id === cardId)
        if (!dungeonCard) {
            throw new NoSuchDungeonCardInPlayerDungeon(`Dungeon with id ${cardId} not found in player dungeon`)
        }
        return dungeonCard
    }

    getDungeonCardInHand(cardId) {
        for (let dungeon of this.dungeonCards) {
            if (dungeon.id === cardId) {
                return dungeon
            }
        }
        throw new NoSuchDungeonInPlayerCards(`Dungeon with id ${cardId} not found in player cards`)
    }

    getHeroFromDungeonEntranceById(heroId) {
        const hero = this.dungeonEntranceHeroes.find(hero => hero.id === heroId)
        if (!hero) {
            throw new NoSuchHeroAtDungeonEntrance(`Hero with id ${heroId} was not found in player dungeon`)
        }
        return hero
    }

    getSpellInHandById(spellId) {
        const spell = this.spellCards.find(spellCard => spellCard.id === spellId)
        if (!spell) {
            throw new NoSuchSpellInPlayerHand(`Player does not have spell with id ${spellId}`)
        }
        return spell
    }

    addGold(amount) {
        this.money += amount
    }

    updateCollectedTreasure() {
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

    getDamage(damageAmount) {
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

    static getPlayer(playerId) {
        return Player.players[playerId]
    }
}

module.exports = Player
