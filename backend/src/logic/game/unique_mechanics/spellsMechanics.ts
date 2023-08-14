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

    use(playerThatUsed: Player): void {

    }
}


// Na ratuenk
// class PlaceHeroFromCityInOwnedDungeon extends SpellMechanic {

//     targetHero: HeroCard | null

//     constructor(spellCard: SpellCard, mechanicDescription: string, targetHero: HeroCard | null = null) {
//         super(spellCard, mechanicDescription)
//         this.targetHero = targetHero
//     }

//     use(playerThatUsed: Player) {
//         if (!this.targetHero) {
//             this.requestPlayerSelect()
//         }
//         else {
//             this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
//             this.targetHero.goToPlayer(this.spellCard.owner)
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

// Atak żywych trupów
// class ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim extends SpellMechanic {

//     targetHero: HeroCard | null

//     constructor(spellCard: SpellCard, mechanicDescription: string) {
//         super(spellCard, mechanicDescription)
//         this.targetHero = null
//     }

//     use(playerThatUsed: Player) {
//         if (!this.targetHero) {
//             this.requestPlayerSelect()
//         }
//         else {
//             this.targetHero.health = this.targetHero.baseHealth + 2
//             this.targetHero.finishedMoving = false
//             this.targetHero.dungeonRoom = null
//             this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
//         }
//     }

//     requestPlayerSelect() {
//         const selectionReq = new SelectionRequest(this.spellCard.owner, "hero", 1, "DEAD_HEROES", this)
//         this.spellCard.owner.setRequestedSelection(selectionReq)
//     }

//     receiveSelectionData(data) {
//         this.targetHero = data[0]
//     }
// }

class GiveOneTrapRoomPlus3DamageForTurn extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player) {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz pokój któremu dodać 3 obrażenia do końca tury (Annihilator).",
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<DungeonCard[]>((acc, player) => {
                return [...acc, ...player.dungeon.filter(room => room.type === 'traps')]
            }, []),
            requestedPlayer: playerThatUsed,
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

                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            }
        })
    }
}

class BoostOpponentsHeroBy3HpForTurn extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player) {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz gracza (Assassin).",
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.filter(player => player !== playerThatUsed),
            requestedPlayer: playerThatUsed,
            onFinish: ([player]) => {
                new SelectionRequestUniversal({
                    amount: 1,
                    metadata: {
                        displayType: "mixed",
                    },
                    requestedPlayer: playerThatUsed,
                    avalibleItemsForSelectArr: [...player.dungeonEntranceHeroes],
                    selectionMessage: "Wybierz bohatera któremu dodać 3 punkty życia do końca tury (Assassin).",
                    onFinish: ([hero]) => {
                        hero.health += 3

                        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
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

    use(playerThatUsed: Player) {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: "Wybierz pokój do zniszczenia (Cave-In).",
            avalibleItemsForSelectArr: [...playerThatUsed.dungeon],
            requestedPlayer: playerThatUsed,
            onFinish: ([room]) => {
                const hero = room.getHeroOnThisDungeon()
                if (hero) {
                    hero.die()
                }
                room.setAllowDestroy(true)
                playerThatUsed.destroyDungeonCard(room.id, true)
                room.setAllowDestroy(false)

                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            }
        })
    }
}

class CancelPlayedSpell extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
        this.spellCard.setAllowForcePlay(true)
    }

    use(playerThatUsed: Player) {
        const playedSpell = this.spellCard.trackedGame.currentlyPlayedSpell
        if (playedSpell) {
            playedSpell.cancelPlay()
        }

        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
    }
}

class DealDamageOfNumberOfRoomsInDungeonToHero extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player) {
        const damage = playerThatUsed.dungeon.length

        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: `Wybierz bohatera któremu zadać obrażenia (Exhaustion).`,
            avalibleItemsForSelectArr: [...playerThatUsed.dungeonEntranceHeroes],
            requestedPlayer: playerThatUsed,
            onFinish: ([hero]) => {
                hero.getDamaged(damage)
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            }
        })
    }
}

class ChooseHeroInANyDungeonAndPutItBackIntoCity extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player) {
        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed",
            },
            selectionMessage: `Wybierz bohatera do odesłania do miasta (Wyczerpanie).`,
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<HeroCard[]>((acc, player) => {
                return [...acc, ...player.dungeonEntranceHeroes]
            }, []),
            requestedPlayer: playerThatUsed,
            onFinish: ([hero]) => {
                hero.goBackToCity()
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            }
        })
    }
}

class DeactivateAnyRoom extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player): void {
        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<DungeonCard[]>((acc, player) => {
                return [...acc, ...player.dungeon]
            }, []),
            metadata: {
                displayType: "mixed",
            },
            requestedPlayer: playerThatUsed,
            selectionMessage: "Wybierz pokój do zamrożenia (Freeze).",
            onFinish: ([room]) => {
                room.deactivate()
                const listener = new EventListener({
                    trackedGame: this.spellCard.trackedGame,
                    eventsHandler: (event) => {
                        if (event.type === "NEW_ROUND_BEGUN") {
                            room.activate()
                            listener.unMount()
                        }
                    }
                })
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            },
        })
    }
}

class BoostMonsterRoomBy3ForTurn extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player): void {
        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: this.spellCard.trackedGame.players.reduce<DungeonCard[]>((acc, player) => {
                return [...acc, ...player.dungeon.filter(room => room.type === 'monsters')]
            }, []),
            metadata: {
                displayType: "mixed",
            },
            requestedPlayer: playerThatUsed,
            selectionMessage: "Wybierz pokój potworów do wzmocnienia o 3 (Giant Size).",
            onFinish: ([room]) => {
                room.damage += 3
                const listener = new EventListener({
                    trackedGame: this.spellCard.trackedGame,
                    eventsHandler: (event) => {
                        if (event.type === "NEW_ROUND_BEGUN") {
                            room.damage -= 3
                            listener.unMount()
                        }
                    }
                })
                this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
            },
        })
    }
}

class PlayersDiscardCardsAndDraw1SpellAnd2Rooms extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
        this.spellCard.setAllowForcePlay(true)
    }

    use(playerThatUsed: Player): void {
        const currentlyPlayedSpell = this.spellCard.trackedGame.getCurrentlyPlayedSpell()
        if (currentlyPlayedSpell) {
            currentlyPlayedSpell.cancelPlay()
        }
        this.spellCard.trackedGame.players.forEach(player => {
            let tempD = [...player.dungeonCards].forEach(dungeon => player.discardDungeonCard(dungeon))
            let tempS = [...player.spellCards].forEach(spell => player.discardSpellCard(spell))
            player.drawNotUsedSpellCard()
            player.drawNotUsedDungeonCard()
            player.drawNotUsedDungeonCard()
        })
        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
    }
}

class DenyAnyRoomBuildInThisRound extends SpellMechanic {
    constructor(spellCard: SpellCard, mechanicDescription: string) {
        super(spellCard, mechanicDescription)
    }

    use(playerThatUsed: Player): void {
        this.spellCard.trackedGame.setForceBanBuild(true)
        const listener = new EventListener({
            trackedGame: this.spellCard.trackedGame,
            eventsHandler: (event) => {
                if (event.type === 'NEW_ROUND_BEGUN') {
                    this.spellCard.trackedGame.setForceBanBuild(false)
                    listener.unMount()
                }
            }
        })
        this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_SPELL_MECHANIC(playerThatUsed, this.spellCard, this))
    }
}

const spellsMechanicsMap = {
    // 'Wyczerpanie': Exhaustion,
    // 'Przerażenie': Fear,
    // 'Na ratunek': PlaceHeroFromCityInOwnedDungeon,
    // 'Atak żywych trupów': ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim,
    "Annihilator": GiveOneTrapRoomPlus3DamageForTurn,
    "Assassin": BoostOpponentsHeroBy3HpForTurn,
    "Cave-In": SilentDestroyRoomInYourDungeonAndKillHeroThere,
    "Counterspell": CancelPlayedSpell,
    "Exhaustion": DealDamageOfNumberOfRoomsInDungeonToHero,
    "Fear": ChooseHeroInANyDungeonAndPutItBackIntoCity,
    "Freeze": DeactivateAnyRoom,
    "Giant Size": BoostMonsterRoomBy3ForTurn,
    "Jeopardy": PlayersDiscardCardsAndDraw1SpellAnd2Rooms,
    "Kobold Strike": DenyAnyRoomBuildInThisRound,
}

module.exports = {
    spellsMechanicsMap,
}

export { SpellMechanic }
