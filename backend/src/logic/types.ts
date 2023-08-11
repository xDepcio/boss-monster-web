import { Player } from "./player/player"

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
