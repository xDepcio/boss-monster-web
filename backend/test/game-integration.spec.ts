import * as mocha from 'mocha'
import { expect } from 'chai';
import { initDeterminsticGame } from './utils.js';
import { Player } from '../src/logic/player/player.js';

const startScenarioSimple = function () {
    return initDeterminsticGame({
        players: [
            {
                id: 1,
                name: 'player1',
                drawnBossesNames: ['Scott', 'KRÓL ROPUCH'],
                selectedBossName: 'Scott',
                dungeonCardsNames: ['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp'],
                spellCardsNames: ['Annihilator', 'Assassin']
            },
            {
                id: 2,
                name: 'player2',
                drawnBossesNames: ['BAŁAMUTIA', 'CEREBELLUS'],
                selectedBossName: 'BAŁAMUTIA',
                dungeonCardsNames: ['Beast Menagerie', 'Bezdenna czeluść', 'Biuro kadr', 'Boulder Ramp'],
                spellCardsNames: ['Annihilator', 'Assassin']
            }
        ]
    })
}

interface IPlayerEntrypointsPure {
    selectBoss: typeof Player.prototype.selectBoss
    declareBuild: typeof Player.prototype.declareBuild
    playSpell: typeof Player.prototype.playSpell
    becomeReady: typeof Player.prototype.becomeReady
    acceptHeroMove: typeof Player.prototype.acceptHeroMove
    acceptSpellPlay: typeof Player.prototype.acceptSpellPlay
    destroyDungeonCard: typeof Player.prototype.destroyDungeonCard
    useDungeonEffect: typeof Player.prototype.useDungeonEffect
}

describe('Dungeon Cards Tests', () => {
    describe('Correct deterministic Game init', () => {
        let { game, players } = startScenarioSimple()

        beforeEach(() => {
            const data = startScenarioSimple()
            game = data.game
            players = data.players
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

        it('should have correct spell cards', () => {
            expect(players.get('player1')!.spellCards.map(s => s.name)).to.deep.equal(['Annihilator', 'Assassin'])
            expect(players.get('player2')!.spellCards.map(s => s.name)).to.deep.equal(['Annihilator', 'Assassin'])
        })

        it("Should save correct moves history without logging drawing cards", () => {
            expect(game.movesHistory).to.deep.equal([
                { type: 'PLAYER_SELECTED_BOSS', message: "player player1 selected boss Scott" },
                { type: "READY", message: "player player1 is ready now" },
                { type: 'PLAYER_SELECTED_BOSS', message: "player player2 selected boss BAŁAMUTIA" },
                { type: "READY", message: "player player2 is ready now" },
                { type: "START_FIRST_ROUND", message: "All players chose their bosses and first round has started" }
            ])
        })
    })
});
