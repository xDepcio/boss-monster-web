import * as mocha from 'mocha'
import { expect } from 'chai';
import { Game } from '../src/logic/game/game';
import { Player } from '../src/logic/player/player';
import { BossCard, DungeonCard, HeroCard, SpellCard } from '../src/logic/game/cards';

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

type DeterministicGameData = {
    players: Player[],
    notUsedSpellCardsStack: SpellCard[],
    notUsedDungeonCardsStack: DungeonCard[],
    notUsedHeroCardsStack: HeroCard[],
    notUsedBossesStack: BossCard[],
    discardedDungeonCardsStack: DungeonCard[],
    discardedSpellCardsStack: SpellCard[]
}
interface StartDeterministicGameParams {
    data: DeterministicGameData
}
function createDeterministicGame({ data }: StartDeterministicGameParams) {
    const game = new Game('1', data.players)
    game.notUsedSpellCardsStack = data.notUsedSpellCardsStack
    game.notUsedDungeonCardsStack = data.notUsedDungeonCardsStack
    game.notUsedHeroCardsStack = data.notUsedHeroCardsStack
    game.notUsedBossesStack = data.notUsedBossesStack
    game.discardedDungeonCardsStack = data.discardedDungeonCardsStack
    game.discardedSpellCardsStack = data.discardedSpellCardsStack
    return game
}
