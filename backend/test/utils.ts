import allCards, { bossCardFromPojo, dungeonCardFromPojo, spellCardFromPojo } from "../src/logic/game/cards-const.js"
import { Game } from "../src/logic/game/game.js"
import { Player } from "../src/logic/player/player.js"
import { Id } from "../src/logic/types.js"

interface InitDeterminsticGameParams<T extends string> {
    players: {
        id: Id,
        name: T,
        drawnBossesNames: typeof allCards.bosses[number]['name'][],
        selectedBossName: typeof allCards.bosses[number]['name'],
        dungeonCardsNames: typeof allCards.dungeons[number]['name'][]
        spellCardsNames: typeof allCards.spells[number]['name'][]
    }[]
}
function initDeterminsticGame<D extends string>({ players }: InitDeterminsticGameParams<D>) {
    const playersArr = players.map(player => new Player(player.id, player.name))
    const playersOldDrawStartingBosses = playersArr.map(player => player.drawStartingBosses)
    const playersOldDrawStartCards = playersArr.map(player => player.drawStartCards)
    playersArr.forEach(player => {
        player.drawStartingBosses = () => { }
        player.drawStartCards = () => { }
    })

    const game = new Game(1, playersArr)

    players.forEach((player, i) => {
        const p = playersArr[i]
        p.drawnBosses = player.drawnBossesNames.map(bossName => bossCardFromPojo({
            card: allCards.bosses.find(boss => boss.name === bossName)!,
            trackedGame: game
        }))
    })
    players.forEach((player, i) => {
        const p = playersArr[i]
        p.selectBoss(allCards.bosses.find(boss => boss.name === player.selectedBossName)!.id)
    })
    players.forEach((player, i) => {
        const p = playersArr[i]
        p.dungeonCards = player.dungeonCardsNames.map(dungeonName => dungeonCardFromPojo({
            trackedGame: game,
            card: allCards.dungeons.find(dungeon => dungeon.name === dungeonName)!
        }))
    })
    players.forEach((player, i) => {
        const p = playersArr[i]
        p.spellCards = player.spellCardsNames.map(spellName => spellCardFromPojo({
            trackedGame: game,
            card: allCards.spells.find(spell => spell.name === spellName)!
        }))
    })

    playersArr.forEach((player, i) => {
        player.drawStartingBosses = playersOldDrawStartingBosses[i]
        player.drawStartCards = playersOldDrawStartCards[i]
    })

    return {
        game,
        players: new Map(players.map(player => [player.name, playersArr.find(p => p.name === player.name)!]))
    }
}

export {
    initDeterminsticGame,
    InitDeterminsticGameParams
}
