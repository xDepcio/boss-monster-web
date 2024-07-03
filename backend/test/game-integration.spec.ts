import * as mocha from 'mocha'
import { expect } from 'chai';
import { Game } from '../src/logic/game/game';
import { Player } from '../src/logic/player/player';
import { BossCard, DungeonCard, HeroCard, SpellCard } from '../src/logic/game/cards';
import allCards from '../src/logic/game/cards-const.js'

describe('Dungeon Cards Tests', () => {
    describe('Haunted Library', () => {
        it('normal draw', () => {
            // const player1 = new Player('1', 'test')
            // const game = new Game('1', [player1])
            // const game = new Game('1', [new Player('1', 'test')])
            // const hauntedLibrary = game.dungeonCards.find(card => card.name === 'Haunted Library')
            // expect(hauntedLibrary).to.not.be.undefined
            // hauntedLibrary?.play()
            // expect(game.dungeonCards.length).to.equal(1)
        })
    })
});
