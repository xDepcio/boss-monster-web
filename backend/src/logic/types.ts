export type Id = string | number
export type TreasureSign = 'magic' | 'strength' | 'fortune' | 'faith'
export type DungeonMechanicTypes = 'onDestroy' | 'onBuild' | 'onePerRound' | 'everyGameAction' | 'onUseOnePerRound'
export type RoundPhase = 'fight' | 'build'
export type CardPlayPhase = RoundPhase | 'both'
export type CardType = "HERO" | "BOSS" | "DUNGEON" | "SPELL"
