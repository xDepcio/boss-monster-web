import { GameEvent, feedback } from "../actionFeedbacks"
import { BossCard, Card, DungeonCard, HeroCard, SpellCard } from "../cards"
import { SelectionRequest, SelectionRequestNEW, SelectionRequestUniversal } from "../playerRequestSelections"
import { CardAction } from "./customCardActions"
import { RoundModifer } from "./roundModifiers"

// const { eventTypes, feedback } = require("../actionFeedbacks")
const GAME_CONSTANTS = require('../gameConstants.json')
// const { CardAction } = require("./customCardActions")
// const { RoundModifer } = require("./roundModifiers")

class BossMechanic {

    bossCard: BossCard
    mechanicDescription: string

    constructor(bossCard: BossCard, mechanicDescription: string) {
        this.bossCard = bossCard
        this.mechanicDescription = mechanicDescription
    }

    getDescription() {
        return this.mechanicDescription
    }

    validate(): boolean {
        if (!this.bossCard.owner) return false

        if (!this.bossCard.hasRankedUp()) {
            if (this.bossCard.owner.dungeon.length >= GAME_CONSTANTS.dungeonsCountToRankUp) {
                this.bossCard.setRankedUp(true)
                return false
            }
            return false
        }
        return true
    }

    handleGameEvent(event: GameEvent): any {
    }
}

class GainOneGoldEveryTimeMonsterDungeonIsBuild extends BossMechanic {
    constructor(bossCard, mechanicDescription) {
        super(bossCard, mechanicDescription)
    }

    use() {
        this.bossCard.owner.addGold(1)
        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return
        // if (!super.handleGameEvent(event)) return

        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (this.bossCard.owner.id === event.player.id && event.dungeon.type === "monsters") {
                this.use()
            }
        }
    }
}

class BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate extends BossMechanic {

    appliedModifer: RoundModifer
    disabled: boolean
    addedCardAction: CardAction

    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
        this.appliedModifer = null
        this.addedCardAction = null
        this.disabled = false
    }

    handleRankUp() {
        const cardAction = new CardAction({
            allowUseFor: [...this.bossCard.trackedGame.players].filter(player => player.id !== this.bossCard.owner.id),
            title: "Zapłać 1 gold",
            onUse: (playerThatUsed) => {
                this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_CUSTOM_CARD_ACTION(this.bossCard.owner, this.bossCard, "Zapłać 1 gold"))
                playerThatUsed.payGold(1, this.bossCard.owner)
                this.disableForRound()
            }
        })
        this.addedCardAction = cardAction
        this.bossCard.addCustomCardAction(cardAction)
    }

    disableForRound() {
        this.addedCardAction.setActionDisabled(true)
        this.appliedModifer.endManually()
        this.disabled = true
    }

    applyModifier() {
        const existingCards = [...this.bossCard.owner.dungeon]
        const modifer = new RoundModifer(
            () => {
                this.addedCardAction.setActionDisabled(false)
                existingCards.forEach((dungeonCard) => {
                    if (dungeonCard.type === "traps") {
                        dungeonCard.damage += 1
                    }
                })
            },
            () => {
                existingCards.forEach((dungeonCard) => {
                    if (dungeonCard.type === "traps") {
                        dungeonCard.damage -= 1
                    }
                })
                this.appliedModifer = null
            },
        )

        this.appliedModifer = modifer
        this.bossCard.trackedGame.addRoundModifier(modifer)
    }

    reApplayModifier() {
        if (this.appliedModifer) {
            this.appliedModifer.endManually()
        }
        this.applyModifier()
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }

        if (event.type === "NEW_ROUND_BEGUN") {
            this.disabled = false
        }

        if (!this.disabled) {
            this.reApplayModifier()
        }
    }
}

class MakeEveryOpponentDestroyOneDungeon extends BossMechanic {

    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        const targetPlayers = [...this.bossCard.trackedGame.players].filter(player => player.id !== this.bossCard.owner.id)
        targetPlayers.forEach((player) => {
            if (player.dungeon.length === 0) return

            const selection = new SelectionRequestNEW({
                amount: 1,
                choiceScope: player,
                requestedPlayer: player,
                requestItemType: "builtDungeon",
                onFinish: (items) => {
                    items.forEach((dungeonCard: DungeonCard) => {
                        dungeonCard.setAllowDestroy(true)
                        player.destroyDungeonCard(dungeonCard.id)
                    })
                },
                message: "Wybierz swój loch do znieszczenia."
            })
            player.setRequestedSelection(selection);
        })
        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

class DrawFancyMonsterDungeonFromDiscardedOrDeck extends BossMechanic {

    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        const avalibleItems = [
            ...this.bossCard.trackedGame.notUsedDungeonCardsStack.filter(card => card.isFancy && card.type === 'monsters'),
            ...this.bossCard.trackedGame.usedCardsStack.filter(card => card instanceof DungeonCard && card.isFancy && card.type === 'monsters') as DungeonCard[]
        ]
        if (avalibleItems.length > 0) {
            new SelectionRequestUniversal<DungeonCard>({
                amount: 1,
                requestedPlayer: this.bossCard.owner,
                avalibleItemsForSelectArr: avalibleItems,
                metadata: {
                    displayType: 'dungeonCard',
                },
                selectionMessage: "Wybierz loch do dodania do ręki.",
                onFinish: (items) => {
                    if (this.bossCard.trackedGame.notUsedDungeonCardsStack.includes(items[0])) {
                        this.bossCard.owner.drawSpecificDungeonCard(items[0].id)
                    } else {
                        this.bossCard.owner.drawDungeonFromUsedCardsStack(items[0].id)
                    }

                    const avalibleToBuildOn = this.bossCard.owner.dungeon.filter((dungeonCard, index) => {
                        try {
                            return this.bossCard.owner.checkIfDungeonBuildValid(items[0], index, { ignoreRoundPhase: true })
                        } catch (err) {
                            return false
                        }
                    })
                    if (avalibleToBuildOn.length > 0) {
                        new SelectionRequestUniversal<'tak' | 'nie'>({
                            amount: 1,
                            avalibleItemsForSelectArr: ['tak', 'nie'],
                            metadata: {
                                displayType: "text"
                            },
                            requestedPlayer: this.bossCard.owner,
                            selectionMessage: "Czy chcesz wybudować ten loch?",
                            onFinish: ([answer]) => {
                                if (answer === 'tak') {
                                    new SelectionRequestUniversal({
                                        amount: 1,
                                        avalibleItemsForSelectArr: avalibleToBuildOn,
                                        metadata: {
                                            displayType: 'dungeonCard',
                                        },
                                        requestedPlayer: this.bossCard.owner,
                                        selectionMessage: "Wybierz gdzie wybudować loch.",
                                        onFinish: ([toBuildOn]) => {
                                            this.bossCard.owner.declareBuild(items[0], this.bossCard.owner.dungeon.indexOf(toBuildOn), { ignoreRoundPhase: true })
                                            this.bossCard.owner.buildDeclaredDungeon()
                                        }
                                    })
                                }
                            }
                        })
                    }
                },
            })
        }

        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

class DrawFancyTrapsDungeonFromDiscardedOrDeck extends BossMechanic {

    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        const avalibleItems = [
            ...this.bossCard.trackedGame.notUsedDungeonCardsStack.filter(card => card.isFancy && card.type === 'traps'),
            ...this.bossCard.trackedGame.usedCardsStack.filter(card => card instanceof DungeonCard && card.isFancy && card.type === 'traps') as DungeonCard[]
        ]
        if (avalibleItems.length > 0) {
            new SelectionRequestUniversal<DungeonCard>({
                amount: 1,
                requestedPlayer: this.bossCard.owner,
                avalibleItemsForSelectArr: avalibleItems,
                metadata: {
                    displayType: 'dungeonCard',
                },
                selectionMessage: "Wybierz loch do dodania do ręki.",
                onFinish: (items) => {
                    if (this.bossCard.trackedGame.notUsedDungeonCardsStack.includes(items[0])) {
                        this.bossCard.owner.drawSpecificDungeonCard(items[0].id)
                    } else {
                        this.bossCard.owner.drawDungeonFromUsedCardsStack(items[0].id)
                    }

                    const avalibleToBuildOn = this.bossCard.owner.dungeon.filter((dungeonCard, index) => {
                        try {
                            return this.bossCard.owner.checkIfDungeonBuildValid(items[0], index, { ignoreRoundPhase: true })
                        } catch (err) {
                            return false
                        }
                    })
                    if (avalibleToBuildOn.length > 0) {
                        new SelectionRequestUniversal<'tak' | 'nie'>({
                            amount: 1,
                            avalibleItemsForSelectArr: ['tak', 'nie'],
                            metadata: {
                                displayType: "text"
                            },
                            requestedPlayer: this.bossCard.owner,
                            selectionMessage: "Czy chcesz wybudować ten loch?",
                            onFinish: ([answer]) => {
                                if (answer === 'tak') {
                                    new SelectionRequestUniversal({
                                        amount: 1,
                                        avalibleItemsForSelectArr: avalibleToBuildOn,
                                        metadata: {
                                            displayType: 'dungeonCard',
                                        },
                                        requestedPlayer: this.bossCard.owner,
                                        selectionMessage: "Wybierz gdzie wybudować loch.",
                                        onFinish: ([toBuildOn]) => {
                                            this.bossCard.owner.declareBuild(items[0], this.bossCard.owner.dungeon.indexOf(toBuildOn), { ignoreRoundPhase: true })
                                            this.bossCard.owner.buildDeclaredDungeon()
                                        }
                                    })
                                }
                            }
                        })
                    }
                },
            })
        }

        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

class Draw3SpellsAndDiscard1 extends BossMechanic {
    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        this.bossCard.owner.drawNotUsedSpellCard()
        this.bossCard.owner.drawNotUsedSpellCard()
        this.bossCard.owner.drawNotUsedSpellCard()

        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: this.bossCard.owner.spellCards,
            metadata: {
                displayType: 'spellCard',
            },
            requestedPlayer: this.bossCard.owner,
            selectionMessage: "Wybierz jedno zaklęcie do odrzucenia.",
            onFinish: ([spellCard]) => {
                this.bossCard.owner.throwCardAway(spellCard)
            }
        })
        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

class TakeOneCardFromOpponent extends BossMechanic {
    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        const cardAction = new CardAction({
            title: "Użyj.",
            allowUseFor: [this.bossCard.owner],
            onUse: (abilityOwner) => {
                const targetPlayers = [...this.bossCard.trackedGame.players].filter(player => player.id !== abilityOwner.id)
                new SelectionRequestUniversal({
                    amount: 1,
                    avalibleItemsForSelectArr: targetPlayers,
                    metadata: {
                        displayType: 'mixed',
                    },
                    requestedPlayer: abilityOwner,
                    selectionMessage: "Wybierz gracza od którego chcesz zabrać kartę.",
                    onFinish: ([player]) => {
                        new SelectionRequestUniversal<SpellCard | DungeonCard>({
                            amount: 1,
                            avalibleItemsForSelectArr: [...player.dungeonCards, ...player.spellCards],
                            metadata: {
                                displayType: 'mixed',
                            },
                            requestedPlayer: abilityOwner,
                            selectionMessage: "Wybierz kartę do zabrania.",
                            onFinish: ([card]) => {
                                if (card instanceof SpellCard) {
                                    player.spellCards.splice(player.spellCards.indexOf(card), 1)
                                    abilityOwner.spellCards.push(card)
                                }
                                else if (card instanceof DungeonCard) {
                                    player.dungeonCards.splice(player.dungeonCards.indexOf(card), 1)
                                    abilityOwner.dungeonCards.push(card)
                                }
                            }
                        })
                    }
                })
                cardAction.setActionDisabled(true)
                this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(abilityOwner, this.bossCard, this))
            }
        })
        this.bossCard.addCustomCardAction(cardAction)
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

class Put1HeroFromCityOrHeroesStackAtYourDungeonEntrance extends BossMechanic {
    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
    }

    handleRankUp() {
        const cardAction = new CardAction({
            allowUseFor: [this.bossCard.owner],
            title: "Użyj.",
            onUse: (bossOwner) => {
                const avalibleItems = [
                    ...this.bossCard.trackedGame.notUsedHeroCardsStack,
                    ...this.bossCard.trackedGame.city
                ]
                if (avalibleItems.length > 0) {
                    new SelectionRequestUniversal<HeroCard>({
                        amount: 1,
                        avalibleItemsForSelectArr: avalibleItems,
                        metadata: {
                            displayType: 'mixed',
                        },
                        requestedPlayer: bossOwner,
                        selectionMessage: "Wybierz bohatera do dodania do wejścia do lochu.",
                        onFinish: ([hero]) => {
                            if (this.bossCard.trackedGame.notUsedHeroCardsStack.includes(hero)) {
                                this.bossCard.trackedGame.notUsedHeroCardsStack.splice(this.bossCard.trackedGame.notUsedHeroCardsStack.indexOf(hero), 1)
                            } else {
                                this.bossCard.trackedGame.city.splice(this.bossCard.trackedGame.city.indexOf(hero), 1)
                            }
                            bossOwner.addHeroToDungeonEntrance(hero)
                            hero.setDungeonOwner(bossOwner)
                        }
                    })
                }
                cardAction.setActionDisabled(true)
                this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(bossOwner, this.bossCard, this))
            }
        })
        this.bossCard.addCustomCardAction(cardAction)
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }
    }
}

const bossesMechanicsMap = {
    'Lamia': GainOneGoldEveryTimeMonsterDungeonIsBuild,
    'Scott': BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate,
    'ROBOBO': MakeEveryOpponentDestroyOneDungeon,
    'KRÓL ROPUCH': DrawFancyMonsterDungeonFromDiscardedOrDeck,
    "KLEOPATRA": DrawFancyTrapsDungeonFromDiscardedOrDeck,
    "CEREBELLUS": Draw3SpellsAndDiscard1,
    "DRAKULORD": TakeOneCardFromOpponent,
    "BAŁAMUTIA": Put1HeroFromCityOrHeroesStackAtYourDungeonEntrance,
}

module.exports = {
    bossesMechanicsMap
}

export { BossMechanic }
