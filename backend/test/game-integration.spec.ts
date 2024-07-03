import * as mocha from 'mocha'
import { expect } from 'chai';
import { Game } from '../src/logic/game/game.js';
import { Player } from '../src/logic/player/player.js';
import { BossCard, DungeonCard, HeroCard, SpellCard } from '../src/logic/game/cards.js';
import allCards, { bossCardFromPojo, dungeonCardFromPojo } from '../src/logic/game/cards-const.js'
import { Id } from '../src/logic/types.js';

const startScenarioSimple = function () {
    return initDeterminsticGame({
        players: [
            {
                id: 1,
                name: 'player1',
                drawnBossesNames: ['Scott', 'KRÓL ROPUCH'],
                selectedBossName: 'Scott',
                dungeonCardsNames: ['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp']
            },
            {
                id: 2,
                name: 'player2',
                drawnBossesNames: ['BAŁAMUTIA', 'CEREBELLUS'],
                selectedBossName: 'BAŁAMUTIA',
                dungeonCardsNames: ['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp']
            }
        ]
    })
}

describe('Dungeon Cards Tests', () => {
    describe('Correct deterministic Game init', () => {
        let { game, players } = startScenarioSimple()

        beforeEach(() => {
            let { game, players } = startScenarioSimple()
        })

        it('should select correct boss', () => {
            expect(players.get('player1')!.selectedBoss!.name).to.equal('Scott')
            expect(players.get('player2')!.selectedBoss!.name).to.equal('BAŁAMUTIA')
        })

        it('should have correct dungeon cards', () => {
            expect(players.get('player1')!.dungeonCards.map(d => d.name)).to.deep.equal(['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp'])
            expect(players.get('player2')!.dungeonCards.map(d => d.name)).to.deep.equal(['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp'])
        })

        it("should make correct order of players", () => {
            expect(game.players.map(p => p.name)).to.deep.equal(['player1', 'player2'])
        })

        it('should start in build phase', () => {
            expect(game.roundPhase).to.equal('build')
        })
    })
});

interface InitDeterminsticGameParams<T extends string> {
    players: {
        id: Id,
        name: T,
        drawnBossesNames: typeof allCards.bosses[number]['name'][],
        selectedBossName: typeof allCards.bosses[number]['name'],
        dungeonCardsNames: typeof allCards.dungeons[number]['name'][]
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

    playersArr.forEach((player, i) => {
        player.drawStartingBosses = playersOldDrawStartingBosses[i]
        player.drawStartCards = playersOldDrawStartCards[i]
    })

    return {
        game,
        players: new Map(players.map(player => [player.name, playersArr.find(p => p.name === player.name)!]))
    }
}
