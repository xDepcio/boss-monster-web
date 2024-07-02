import { BossCard, DungeonCard, HeroCard, SpellCard } from "./game/cards.js"
import { Game } from "./game/game.js"
import { SelectionRequest, SelectionRequestNEW, SelectionRequestOneFromGivenList, SelectionRequestUniversal } from "./game/playerRequestSelections.js"
import { Player } from "./player/player.js"

export type Id = string | number
export type TreasureSign = 'magic' | 'strength' | 'fortune' | 'faith'
export type Treasure = {
    faith?: number
    strength?: number
    magic?: number
    fortune?: number
}
export type DungeonMechanicTypes = 'onDestroy' | 'onBuild' | 'onePerRound' | 'everyGameAction' | 'onUseOnePerRound'
export type RoundPhase = 'fight' | 'build' | 'start' | 'postBuild'
export type CardPlayPhase = 'fight' | 'build' | 'both'
export type CardType = "HERO" | "BOSS" | "DUNGEON" | "SPELL"
export type RequestItemType = 'hero' | 'dungeonCard' | 'builtDungeon' | 'player' | 'spell' | 'treasure'
export type SelectionChoiceScope = 'ANY' | 'CITY' | 'DEAD_HEROES' | Player

export type PlayerJson = {
    id: Id
    name: string
    dungeonCards: DungeonCard[] | undefined
    spellCards: SpellCard[] | undefined
    trackedGame: Game | null | undefined
    finishedPhase: boolean | undefined
    dungeon: DungeonCard[] | undefined
    dungeonEntranceHeroes: HeroCard[] | undefined
    acceptedHeroMove: boolean | undefined
    acceptedSpellPlay: boolean | undefined
    health: number | undefined
    money: number | undefined
    defeatedHeroes: HeroCard[] | undefined
    drawnBosses: BossCard[] | undefined
    selectedBoss: BossCard | null | undefined
    totalScore: number | undefined
    declaredBuild: DungeonCard | null | undefined
    heroesThatDefeatedPlayer: HeroCard[] | undefined
    collectedTreasure: {
        faith: number,
        strength: number,
        magic: number,
        fortune: number
    } | undefined
    requestedSelection: SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any> | undefined
    requestedSelectionsQueue: (SelectionRequest | SelectionRequestOneFromGivenList<any> | null | SelectionRequestNEW | SelectionRequestUniversal<any>)[] | undefined
    automaticallyDrawNewRoundCards: boolean | undefined
}
