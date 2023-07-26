import { Player } from "../player/player"
import { BossCard, DungeonCard, HeroCard, SpellCard } from "./cards"
import { Game } from "./game"
import { BossMechanic } from "./unique_mechanics/bossMecahnics"
import { DungeonMechanic } from "./unique_mechanics/dungeonMechanics"
import { SpellMechanic } from "./unique_mechanics/spellsMechanics"

const eventTypes = {
    PLAYER_DECLARED_BUILD: 'BUILD' as const,
    PLAYER_BECOME_READY: 'READY' as const,
    START_FIGHT_PHASE: 'START_FIGHT' as const,
    HERO_GOTO_PLAYER: 'HERO_LURED' as const,
    PLAYER_KILLED_HERO: 'HERO_KILLED' as const,
    HERO_ATTACKED_PLAYER: 'PLAYER_DAMAGED' as const,
    PLAYER_SELECTED_BOSS: 'PLAYER_SELECTED_BOSS' as const,
    START_FIRST_ROUND: 'START_FIRST_ROUND' as const,
    HERO_DAMAGED: 'HERO_DAMAGED' as const,
    PLAYER_ACCEPTED_HERO_MOVE: 'PLAYER_ACCEPTED_HERO_MOVE' as const,
    NO_MORE_HEROES_IN_FIGHT_PHASE: 'NO_MORE_HEROES_IN_FIGHT_PHASE' as const,
    NEW_ROUND_BEGUN: 'NEW_ROUND_BEGUN' as const,
    START_BUILD_PHASE: 'START_BUILD_PHASE' as const,
    PLAYER_DESTROYED_DUNGEON: 'PLAYER_DESTROYED_DUNGEON' as const,
    PLAYER_USED_MECHANIC: 'PLAYER_USED_MECHANIC' as const,
    HERO_DAMAGED_BY_SPELL: 'HERO_DAMAGED_BY_SPELL' as const,
    HERO_WENT_BACK_TO_CITY: 'HERO_WENT_BACK_TO_CITY' as const,
    PLAYER_PLAYED_SPELL: 'PLAYER_PLAYED_SPELL' as const,
    PLAYER_DRAWNED_DUNGEON_CARD: 'PLAYER_DRAWNED_DUNGEON_CARD' as const,
    PLAYER_DRAWNED_SPELL_CARD: 'PLAYER_DRAWNED_SPELL_CARD' as const,
    PLAYER_BUILD_DUNGEON: 'PLAYER_BUILD_DUNGEON' as const,
    PLAYER_ACCEPTED_SPELL_PLAY: 'PLAYER_ACCEPTED_SPELL_PLAY' as const,
    PLAYER_THROWN_AWAY_CARD: 'PLAYER_THROWN_AWAY_CARD' as const,
    HERO_ENTERED_ROOM: 'HERO_ENTERED_ROOM' as const,
    HERO_DIED_IN_ROOM: 'HERO_DIED_IN_ROOM' as const,
    PLAYER_USED_BOSS_RANKUP_MECHANIC: 'PLAYER_USED_BOSS_RANKUP_MECHANIC' as const,
    PLAYER_USED_CUSTOM_CARD_ACTION: 'PLAYER_USED_CUSTOM_CARD_ACTION' as const,
    PLAYER_USED_SPELL_MECHANIC: 'PLAYER_USED_SPELL_MECHANIC' as const,
    PLAYER_USED_DUNGEON_MECHANIC: 'PLAYER_USED_DUNGEON_MECHANIC' as const
}

export type FeedbackEventType = typeof eventTypes[keyof typeof eventTypes]

export type FeedbackEventCore = {
    type: FeedbackEventType,
    message: string,
}

export const feedback = {
    PLAYER_DECLARED_BUILD: (player: Player) => {
        return {
            type: "BUILD",
            message: `player with id ${player.id} declared building an dungeon`,
        }
    },
    PLAYER_BECOME_READY: (player: Player) => {
        return {
            type: "READY",
            message: `player with id ${player.id} is ready now`
        }
    },
    START_FIGHT_PHASE: () => {
        return {
            type: "START_FIGHT",
            message: `build phase has ended and new fight phase has started`
        }
    },
    HERO_GOTO_PLAYER: (hero: HeroCard, player: Player) => {
        return {
            type: "HERO_LURED",
            message: `hero ${hero.getName()} went to ${player.getName()}`,
            hero,
            player
        }
    },
    PLAYER_KILLED_HERO: (player: Player, hero: HeroCard) => {
        return {
            type: "HERO_KILLED",
            message: `player ${player.getName()} killed hero ${hero.getName()}`
        }
    },
    HERO_ATTACKED_PLAYER: (hero: HeroCard, player: Player) => {
        return {
            type: "PLAYER_DAMAGED",
            message: `hero ${hero.getName()} damaged player ${player.getName()} for ${hero.damageDealt} hp`
        }
    },
    PLAYER_SELECTED_BOSS: (player: Player, boss: BossCard) => {
        return {
            type: "PLAYER_SELECTED_BOSS",
            message: `player ${player.getName()} selected boss ${boss.getName()}`
        }
    },
    START_FIRST_ROUND: () => {
        return {
            type: "START_FIRST_ROUND",
            message: `All players chose their bosses and first round has started`
        }
    },
    HERO_DAMAGED: (hero: HeroCard, dungeon: DungeonCard, player: Player) => {
        return {
            type: "HERO_DAMAGED",
            message: `Hero ${hero.getName()} got damaged for ${dungeon.damage} hp in ${player.getName()}'s dungeon. Hp left: ${hero.health}`
        }
    },
    PLAYER_ACCEPTED_HERO_MOVE: (player: Player) => {
        return {
            type: "PLAYER_ACCEPTED_HERO_MOVE",
            message: `Player ${player.getName()} accepted hero move`
        }
    },
    NO_MORE_HEROES_IN_FIGHT_PHASE: () => {
        return {
            type: "NO_MORE_HEROES_IN_FIGHT_PHASE",
            message: `All heroes completed their movement. Waiting for players to become ready for round end`
        }
    },
    NEW_ROUND_BEGUN: (game: Game) => {
        return {
            type: "NEW_ROUND_BEGUN",
            message: `===== Round ${game.gameRound} has started =====`
        }
    },
    START_BUILD_PHASE: () => {
        return {
            type: "START_BUILD_PHASE",
            message: `New build phase has started`
        }
    },
    PLAYER_DESTROYED_DUNGEON: (player: Player, dungeon: DungeonCard) => {
        return {
            type: "PLAYER_DESTROYED_DUNGEON",
            message: `player ${player.getName()} destroyed dungeon ${dungeon.getName()}`
        }
    },
    PLAYER_PLAYED_SPELL: (player: Player, spell: SpellCard) => {
        return {
            type: "PLAYER_PLAYED_SPELL",
            message: `player ${player.getName()} used spell: '${spell.getName()}'`,
            player: player,
            spell: spell
        }
    },
    /** Deprecated. Too ambigious, use PLAYER_USED_SPELL_MECHANIC or PLAYER_USED_DUNGEON_MECHANIC instead.*/
    PLAYER_USED_MECHANIC: (player: Player, mechanic: DungeonMechanic | SpellMechanic) => {
        return {
            type: "PLAYER_USED_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}'`
        }
    },
    PLAYER_USED_SPELL_MECHANIC: (player: Player, spell: SpellCard, mechanic: SpellMechanic) => {
        return {
            type: "PLAYER_USED_SPELL_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}' of spell '${spell.getName()}'`,
            spell,
            mechanic
        }
    },
    PLAYER_USED_DUNGEON_MECHANIC: (player: Player, dungeon: DungeonCard, mechanic: DungeonMechanic) => {
        return {
            type: "PLAYER_USED_DUNGEON_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}' of dungeon '${dungeon.getName()}'`,
            dungeon,
            mechanic
        }
    },
    HERO_DAMAGED_BY_SPELL: (hero: HeroCard, spellDamageAmount: number, spellName: string, player: Player) => {
        return {
            type: "HERO_DAMAGED_BY_SPELL",
            message: `player ${player.getName()} damaged hero ${hero.getName()} for ${spellDamageAmount} with ${spellName}`
        }
    },
    HERO_WENT_BACK_TO_CITY: (hero: HeroCard) => {
        return {
            type: "HERO_WENT_BACK_TO_CITY",
            message: `hero ${hero.getName()} went back to the city`
        }
    },
    PLAYER_DRAWNED_SPELL_CARD: (player: Player) => {
        return {
            type: eventTypes.PLAYER_DRAWNED_SPELL_CARD,
            message: `player ${player.getName()} drawned new spell card`
        }
    },
    PLAYER_DRAWNED_DUNGEON_CARD: (player: Player) => {
        return {
            type: eventTypes.PLAYER_DRAWNED_DUNGEON_CARD,
            message: `player ${player.getName()} drawned new dungeon card`
        }
    },
    PLAYER_BUILD_DUNGEON: (player: Player, dungeon: DungeonCard) => {
        return {
            type: eventTypes.PLAYER_BUILD_DUNGEON,
            message: `player ${player.getName()} build ${dungeon.getName()}.`,
            player,
            dungeon
        }
    },
    PLAYER_ACCEPTED_SPELL_PLAY: (player: Player, spell: SpellCard) => {
        return {
            type: eventTypes.PLAYER_ACCEPTED_SPELL_PLAY,
            message: `player ${player.getName()} accepted play of '${spell.getName()}' by ${spell.owner.getName()}.`,
        }
    },
    PLAYER_THROWN_AWAY_CARD: (player: Player, card: SpellCard | DungeonCard) => {
        return {
            type: eventTypes.PLAYER_THROWN_AWAY_CARD,
            message: `player ${player.getName()} thrown away card '${card.getName()}'.`,
            player,
            card
        }
    },
    HERO_ENTERED_ROOM: (hero: HeroCard, dungeonCard: DungeonCard, dungeonOwner: Player) => {
        return {
            type: eventTypes.HERO_ENTERED_ROOM,
            message: `hero ${hero.getName()} entered ${dungeonCard.getName()} at ${dungeonOwner.getName()}'s dungeon.`,
            hero,
            dungeonCard,
            dungeonOwner
        }
    },
    HERO_DIED_IN_ROOM: (hero: HeroCard, room: DungeonCard) => {
        return {
            type: eventTypes.HERO_DIED_IN_ROOM,
            message: `hero ${hero.getName()} died in ${room.getName()} at ${room.owner.getName()}'s dungeon.`,
            hero,
            room,
        }
    },
    PLAYER_USED_BOSS_RANKUP_MECHANIC: (player: Player, boss: BossCard, mechanic: BossMechanic) => {
        return {
            type: eventTypes.PLAYER_USED_BOSS_RANKUP_MECHANIC,
            message: `player ${player.getName()} used ${boss.getName()}'s '${mechanic.getDescription()}'`,
            player,
            boss,
            mechanic
        }
    },
    PLAYER_USED_CUSTOM_CARD_ACTION: (player: Player, card: DungeonCard | HeroCard | BossCard | SpellCard, actionTitle: string) => {
        return {
            type: eventTypes.PLAYER_USED_CUSTOM_CARD_ACTION,
            message: `player ${player.getName()} used ${card.getName()}'s action '${actionTitle}'`,
            player,
            card,
            actionTitle
        }
    }
}

module.exports = {
    feedback,
    eventTypes
}

export { }
