import { Player } from "../../player/player"
import { feedback } from "../actionFeedbacks"
import { DungeonCard, HeroCard, SpellCard } from "../cards"
import { SelectionRequest, SelectionRequestUniversal } from "../playerRequestSelections"
import { EventListener } from "./eventListener"

// const { feedback } = require("../actionFeedbacks")
// const { SelectionRequest } = require("../playerRequestSelections")


class SpellMechanic {

    spellCard: SpellCard
    mechanicDescription: string

    constructor(spellCard: SpellCard, mechanicDescription: string) {
        this.spellCard = spellCard
        this.mechanicDescription = mechanicDescription
        if (!this.spellCard.getDescription()) {
            this.spellCard.setDescription(this.mechanicDescription)
        }
    }

    getDescription() {
        return this.mechanicDescription
    }

    use() {

    }
}


// Wyczerpanie
// class Exhaustion extends SpellMechanic {

//     targetHero: HeroCard | null

//     constructor(spellCard: SpellCard, mechanicDescription: string, targetHero: HeroCard | null = null) {
//         super(spellCard, mechanicDescription)
//         this.targetHero = targetHero
//     }

//     use() {
//         if (!this.targetHero) {
//             this.requestPlayerSelect()
//         }
//         else {
//             const damageToDeal = this.calculateDamageDealt()
//             this.targetHero.getDamaged(damageToDeal)
//             this.spellCard.trackedGame.saveGameAction(feedback.HERO_DAMAGED_BY_SPELL(this.targetHero, damageToDeal, this.spellCard.name, this.spellCard.owner))
//             if (this.targetHero.checkDeath()) {
//                 this.targetHero.die()
//             }

//             //code if valid TODO...
//             this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
//             this.spellCard.completeUsage()
//         }
//     }

//     receiveSelectionData(data) {
//         this.targetHero = data[0]
//     }

//     requestPlayerSelect() {
//         const selectionReq = new SelectionRequest(this.spellCard.owner, "hero", 1, this.spellCard.owner, this)
//         this.spellCard.owner.setRequestedSelection(selectionReq)
//     }

//     calculateDamageDealt() {
//         return this.spellCard.owner.dungeon.length
//     }
// }

// Przerażenie
// class Fear extends SpellMechanic {

//     targetHero: HeroCard | null

//     constructor(spellCard: SpellCard, mechanicDescription: string, targetHero: HeroCard | null = null) {
//         super(spellCard, mechanicDescription)
//         this.targetHero = targetHero
//     }

//     use() {
//         if (!this.targetHero) {
//             this.requestPlayerSelect()
//         }
//         else {
//             this.targetHero.goBackToCity()
//             // this.spellCard.trackedGame.addHeroToCity(this.targetHero)
//             // this.targetHero.finishMoving()
//             // this.targetHero.setDungeonOwner(null)
//             this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
//             this.spellCard.completeUsage()
//         }
//     }

//     requestPlayerSelect() {
//         const selectionReq = new SelectionRequest(this.spellCard.owner, "hero", 1, "ANY", this)
//         this.spellCard.owner.setRequestedSelection(selectionReq)
//     }

//     receiveSelectionData(data) {
//         this.targetHero = data[0]
//     }
// }


// Na ratuenk
class PlaceHeroFromCityInOwnedDungeon extends SpellMechanic {

    targetHero: HeroCard | null

    constructor(spellCard: SpellCard, mechanicDescription: string, targetHero: HeroCard | null = null) {
        super(spellCard, mechanicDescription)
        this.targetHero = targetHero
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.targetHero.goToPlayer(this.spellCard.owner)
            this.spellCard.completeUsage()
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, "hero", 1, "ANY", this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }
}

// Atak żywych trupów
class ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim extends SpellMechanic {

    targetHero: HeroCard | null

    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
        this.targetHero = null
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            this.targetHero.health = this.targetHero.baseHealth + 2
            this.targetHero.finishedMoving = false
            this.targetHero.dungeonRoom = null
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.spellCard.completeUsage()
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, "hero", 1, "DEAD_HEROES", this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }
}

class GiveOneTrapRoomPlus3DamageForTurn extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use() {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz pokój któremu dodać 3 obrażenia do końca tury (Annihilator).",
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<DungeonCard[]>((acc, player) => {
                return [...acc, ...player.dungeon.filter(room => room.type === 'traps')]
            }, []),
            requestedPlayer: this.spellCard.owner,
            onFinish: ([room]) => {
                room.damage += 3

                const listener = new EventListener({
                    trackedGame: this.spellCard.trackedGame,
                    eventsHandler: (event) => {
                        if (event.type === 'NEW_ROUND_BEGUN') {
                            room.damage -= 3
                            listener.unMount()
                        }
                    }
                })

                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
                this.spellCard.completeUsage()
            }
        })
    }
}

class BoostOpponentsHeroBy3HpForTurn extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use() {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz gracza (Assassin).",
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.filter(player => player !== this.spellCard.owner),
            requestedPlayer: this.spellCard.owner,
            onFinish: ([player]) => {
                new SelectionRequestUniversal({
                    amount: 1,
                    metadata: {
                        displayType: "mixed",
                    },
                    requestedPlayer: this.spellCard.owner,
                    avalibleItemsForSelectArr: [...player.dungeonEntranceHeroes],
                    selectionMessage: "Wybierz bohatera któremu dodać 3 punkty życia do końca tury (Assassin).",
                    onFinish: ([hero]) => {
                        hero.health += 3

                        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
                        this.spellCard.completeUsage()
                    }
                })
            }
        })
    }
}

// Does not trigger on destory effects
class SilentDestroyRoomInYourDungeonAndKillHeroThere extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string, targetRoom: DungeonCard | null = null) {
        super(spellCard, mechanicDescription)
    }

    use() {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz pokój do zniszczenia (Cave-In).",
            avalibleItemsForSelectArr: [...this.spellCard.owner.dungeon],
            requestedPlayer: this.spellCard.owner,
            onFinish: ([room]) => {
                const hero = room.getHeroOnThisDungeon()
                if (hero) {
                    hero.die()
                }
                room.setAllowDestroy(true)
                this.spellCard.owner.destroyDungeonCard(room.id, true)
                room.setAllowDestroy(false)

                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
                this.spellCard.completeUsage()
            }
        })
    }
}

class CancelPlayedSpell extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
        this.spellCard.setAllowForcePlay(true)
    }

    use() {
        const playedSpell = this.spellCard.trackedGame.currentlyPlayedSpell
        if (playedSpell) {
            playedSpell.cancelPlay()
        }

        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
        this.spellCard.completeUsage()
    }
}

class DealDamageOfNumberOfRoomsInDungeonToHero extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use() {
        const damage = this.spellCard.owner.dungeon.length

        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: `Wybierz bohatera któremu zadać obrażenia (Exhaustion).`,
            avalibleItemsForSelectArr: [...this.spellCard.owner.dungeonEntranceHeroes],
            requestedPlayer: this.spellCard.owner,
            onFinish: ([hero]) => {
                hero.getDamaged(damage)
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
                this.spellCard.completeUsage()
            }
        })
    }
}

class ChooseHeroInANyDungeonAndPutItBackIntoCity extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use() {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: `Wybierz bohatera do odesłania do miasta (Wyczerpanie).`,
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<HeroCard[]>((acc, player) => {
                return [...acc, ...player.dungeonEntranceHeroes]
            }, []),
            requestedPlayer: this.spellCard.owner,
            onFinish: ([hero]) => {
                hero.goBackToCity()
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(this.spellCard.owner, this.spellCard, this))
                this.spellCard.completeUsage()
            }
        })
    }
}

const spellsMechanicsMap = {
    // 'Wyczerpanie': Exhaustion,
    // 'Przerażenie': Fear,
    'Na ratunek': PlaceHeroFromCityInOwnedDungeon,
    'Atak żywych trupów': ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim,
    "Annihilator": GiveOneTrapRoomPlus3DamageForTurn,
    "Assassin": BoostOpponentsHeroBy3HpForTurn,
    "Cave-In": SilentDestroyRoomInYourDungeonAndKillHeroThere,
    "Counterspell": CancelPlayedSpell,
    "Exhaustion": DealDamageOfNumberOfRoomsInDungeonToHero,
    "Fear": ChooseHeroInANyDungeonAndPutItBackIntoCity,
}

module.exports = {
    spellsMechanicsMap,
}

export { SpellMechanic }
