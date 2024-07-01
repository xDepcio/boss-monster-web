import { Player } from "../player/player"
import { BossCard, DungeonCard, HeroCard, SpellCard } from "./cards"
import { Game } from "./game"
import { BossMechanic } from "./unique_mechanics/bossMecahnics"
import { CardAction } from "./unique_mechanics/customCardActions"
import { DungeonMechanic } from "./unique_mechanics/dungeonMechanics"
import { SpellMechanic } from "./unique_mechanics/spellsMechanics"

type EventSchema = {
    PLAYER_DECLARED_BUILD: {
        type: 'PLAYER_DECLARED_BUILD',
        message: string,
        player: Player,
        dungeon: DungeonCard

    },
    PLAYER_BECOME_READY: {
        type: 'READY',
        message: string,
    },
    START_FIGHT_PHASE: {
        type: "START_FIGHT",
        message: string
    },
    HERO_GOTO_PLAYER: {
        type: "HERO_LURED",
        message: string,
        hero: HeroCard,
        player: Player
    },
    PLAYER_KILLED_HERO: {
        type: "HERO_KILLED",
        message: string
    },
    HERO_ATTACKED_PLAYER: {
        type: "PLAYER_DAMAGED",
        message: string
    },
    PLAYER_SELECTED_BOSS: {
        type: "PLAYER_SELECTED_BOSS",
        message: string
    },
    PLAYER_RANKED_UP_BOSS: {
        type: "PLAYER_RANKED_UP_BOSS",
        message: string,
        player: Player,
        boss: BossCard,
    },
    START_FIRST_ROUND: {
        type: "START_FIRST_ROUND",
        message: string
    },
    HERO_DAMAGED: {
        type: "HERO_DAMAGED",
        message: string
    },
    PLAYER_ACCEPTED_HERO_MOVE: {
        type: "PLAYER_ACCEPTED_HERO_MOVE",
        message: string
    },
    NO_MORE_HEROES_IN_FIGHT_PHASE: {
        type: "NO_MORE_HEROES_IN_FIGHT_PHASE",
        message: string
    },
    NEW_ROUND_BEGUN: {
        type: "NEW_ROUND_BEGUN",
        message: string
    },
    START_BUILD_PHASE: {
        type: "START_BUILD_PHASE",
        message: string
    },
    START_POST_BUILD_PHASE: {
        type: "START_POST_BUILD_PHASE",
        message: string
    },
    PLAYER_DESTROYED_DUNGEON: {
        type: "PLAYER_DESTROYED_DUNGEON",
        message: string,
        player: Player,
        dungeon: DungeonCard
    },
    PLAYER_USED_MECHANIC: {
        type: "PLAYER_USED_MECHANIC",
        message: string
    },
    SPELL_GOT_CANCELLED: {
        type: "SPELL_GOT_CANCELLED",
        message: string,
        spell: SpellCard
    },
    HERO_DAMAGED_BY_SPELL: {
        type: "HERO_DAMAGED_BY_SPELL",
        message: string
    },
    HERO_WENT_BACK_TO_CITY: {
        type: "HERO_WENT_BACK_TO_CITY",
        message: string
    },
    PLAYER_PLAYED_SPELL: {
        type: "PLAYER_PLAYED_SPELL",
        message: string,
        player: Player,
        spell: SpellCard
    },
    PLAYER_DRAWNED_DUNGEON_CARD: {
        type: "PLAYER_DRAWNED_DUNGEON_CARD",
        message: string
    },
    PLAYER_DRAWNED_SPELL_CARD: {
        type: "PLAYER_DRAWNED_SPELL_CARD",
        message: string
    },
    PLAYER_BUILD_DUNGEON: {
        type: "PLAYER_BUILD_DUNGEON",
        message: string,
        player: Player,
        dungeon: DungeonCard
    },
    PLAYER_ACCEPTED_SPELL_PLAY: {
        type: "PLAYER_ACCEPTED_SPELL_PLAY",
        message: string
    },
    // PLAYER_THROWN_AWAY_CARD: {
    //     type: "PLAYER_THROWN_AWAY_CARD",
    //     message: string,
    //     player: Player,
    //     card: SpellCard | DungeonCard
    // },
    PLAYER_THROWN_AWAY_SPELL_CARD: {
        type: "PLAYER_THROWN_AWAY_SPELL_CARD",
        message: string,
        player: Player,
        spell: SpellCard
    },
    PLAYER_THROWN_AWAY_DUNGEON_CARD: {
        type: "PLAYER_THROWN_AWAY_DUNGEON_CARD",
        message: string,
        player: Player,
        dungeon: DungeonCard
    },
    PLAYER_TOOK_SPELL_FROM_PLAYER: {
        type: "PLAYER_TOOK_SPELL_FROM_PLAYER",
        message: string,
        whoTook: Player,
        whoGave: Player,
        spell: SpellCard
    },
    PLAYER_TOOK_DUNGEON_FROM_PLAYER: {
        type: "PLAYER_TOOK_DUNGEON_FROM_PLAYER",
        message: string,
        whoTook: Player,
        whoGave: Player,
        dungeon: DungeonCard
    }
    HERO_ENTERED_ROOM: {
        type: "HERO_ENTERED_ROOM",
        message: string,
        hero: HeroCard,
        dungeonCard: DungeonCard,
        dungeonOwner: Player
    },
    HERO_DIED_IN_ROOM: {
        type: "HERO_DIED_IN_ROOM",
        message: string,
        hero: HeroCard,
        room: DungeonCard,
    },
    PLAYER_USED_BOSS_RANKUP_MECHANIC: {
        type: "PLAYER_USED_BOSS_RANKUP_MECHANIC",
        message: string,
        player: Player,
        boss: BossCard,
        mechanic: BossMechanic
    },
    PLAYER_USED_CUSTOM_CARD_ACTION: {
        type: "PLAYER_USED_CUSTOM_CARD_ACTION",
        message: string,
        player: Player,
        card: DungeonCard | HeroCard | BossCard | SpellCard,
        action: CardAction
    },
    PLAYER_USED_SPELL_MECHANIC: {
        type: "PLAYER_USED_SPELL_MECHANIC",
        message: string,
        spell: SpellCard,
        mechanic: SpellMechanic
    },
    PLAYER_USED_DUNGEON_MECHANIC: {
        type: "PLAYER_USED_DUNGEON_MECHANIC",
        message: string,
        dungeon: DungeonCard,
        mechanic: DungeonMechanic
    },
    DUNGEON_CARD_GOT_ACTIVATED: {
        type: "DUNGEON_CARD_GOT_ACTIVATED",
        message: string,
        dungeon: DungeonCard
    },
    DUNGEON_CARD_GOT_DEACTIVATED: {
        type: "DUNGEON_CARD_GOT_DEACTIVATED",
        message: string,
        dungeon: DungeonCard
    }
}

export type GameEvent = EventSchema[keyof EventSchema]

export const feedback = {
    PLAYER_DECLARED_BUILD: (player: Player, dungeon: DungeonCard): GameEvent => {
        return {
            type: "PLAYER_DECLARED_BUILD",
            message: `player ${player.getName()} declared building an dungeon`,
            player,
            dungeon
        }
    },
    PLAYER_BECOME_READY: (player: Player): GameEvent => {
        return {
            type: "READY",
            message: `player ${player.getName()} is ready now`
        }
    },
    START_FIGHT_PHASE: (): GameEvent => {
        return {
            type: "START_FIGHT",
            message: `build phase has ended and new fight phase has started`
        }
    },
    HERO_GOTO_PLAYER: (hero: HeroCard, player: Player): GameEvent => {
        return {
            type: "HERO_LURED",
            message: `hero ${hero.getName()} went to ${player.getName()}`,
            hero,
            player
        }
    },
    PLAYER_KILLED_HERO: (player: Player, hero: HeroCard): GameEvent => {
        return {
            type: "HERO_KILLED",
            message: `player ${player.getName()} killed hero ${hero.getName()}`
        }
    },
    HERO_ATTACKED_PLAYER: (hero: HeroCard, player: Player): GameEvent => {
        return {
            type: "PLAYER_DAMAGED",
            message: `hero ${hero.getName()} damaged player ${player.getName()} for ${hero.damageDealt} hp`
        }
    },
    PLAYER_SELECTED_BOSS: (player: Player, boss: BossCard): GameEvent => {
        return {
            type: "PLAYER_SELECTED_BOSS",
            message: `player ${player.getName()} selected boss ${boss.getName()}`
        }
    },
    START_FIRST_ROUND: (): GameEvent => {
        return {
            type: "START_FIRST_ROUND",
            message: `All players chose their bosses and first round has started`
        }
    },
    HERO_DAMAGED: (hero: HeroCard, amount: number, player: Player): GameEvent => {
        return {
            type: "HERO_DAMAGED",
            message: `Hero ${hero.getName()} got damaged for ${amount} hp in ${player.getName()}'s dungeon. Hp left: ${hero.health}`
        }
    },
    PLAYER_ACCEPTED_HERO_MOVE: (player: Player): GameEvent => {
        return {
            type: "PLAYER_ACCEPTED_HERO_MOVE",
            message: `Player ${player.getName()} accepted hero move`
        }
    },
    NO_MORE_HEROES_IN_FIGHT_PHASE: (): GameEvent => {
        return {
            type: "NO_MORE_HEROES_IN_FIGHT_PHASE",
            message: `All heroes completed their movement. Waiting for players to become ready for round end`
        }
    },
    NEW_ROUND_BEGUN: (game: Game): GameEvent => {
        return {
            type: "NEW_ROUND_BEGUN",
            message: `===== Round ${game.gameRound} has started =====`
        }
    },
    START_BUILD_PHASE: (): GameEvent => {
        return {
            type: "START_BUILD_PHASE",
            message: `New build phase has started`
        }
    },
    START_POST_BUILD_PHASE: (): GameEvent => {
        return {
            type: "START_POST_BUILD_PHASE",
            message: `New post build phase has started`
        }
    },
    PLAYER_DESTROYED_DUNGEON: (player: Player, dungeon: DungeonCard): GameEvent => {
        return {
            type: "PLAYER_DESTROYED_DUNGEON",
            message: `player ${player.getName()} destroyed dungeon ${dungeon.getName()}`,
            player,
            dungeon
        }
    },
    PLAYER_PLAYED_SPELL: (player: Player, spell: SpellCard): GameEvent => {
        return {
            type: "PLAYER_PLAYED_SPELL",
            message: `player ${player.getName()} used spell: '${spell.getName()}'`,
            player: player,
            spell: spell
        }
    },
    /** Deprecated. Too ambigious, use PLAYER_USED_SPELL_MECHANIC or PLAYER_USED_DUNGEON_MECHANIC instead.*/
    PLAYER_USED_MECHANIC: (player: Player, mechanic: DungeonMechanic | SpellMechanic): GameEvent => {
        return {
            type: "PLAYER_USED_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}'`
        }
    },
    SPELL_GOT_CANCELLED: (spell: SpellCard): GameEvent => {
        return {
            type: "SPELL_GOT_CANCELLED",
            message: `spell ${spell.getName()} got cancelled`,
            spell
        }
    },
    PLAYER_USED_SPELL_MECHANIC: (player: Player, spell: SpellCard, mechanic: SpellMechanic): GameEvent => {
        return {
            type: "PLAYER_USED_SPELL_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}' of spell '${spell.getName()}'`,
            spell,
            mechanic
        }
    },
    PLAYER_USED_DUNGEON_MECHANIC: (player: Player, dungeon: DungeonCard, mechanic: DungeonMechanic): GameEvent => {
        return {
            type: "PLAYER_USED_DUNGEON_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}' of dungeon '${dungeon.getName()}'`,
            dungeon,
            mechanic
        }
    },
    HERO_DAMAGED_BY_SPELL: (hero: HeroCard, spellDamageAmount: number, spellName: string, player: Player): GameEvent => {
        return {
            type: "HERO_DAMAGED_BY_SPELL",
            message: `player ${player.getName()} damaged hero ${hero.getName()} for ${spellDamageAmount} with ${spellName}`
        }
    },
    HERO_WENT_BACK_TO_CITY: (hero: HeroCard): GameEvent => {
        return {
            type: "HERO_WENT_BACK_TO_CITY",
            message: `hero ${hero.getName()} went back to the city`
        }
    },
    PLAYER_DRAWNED_SPELL_CARD: (player: Player): GameEvent => {
        return {
            type: "PLAYER_DRAWNED_SPELL_CARD",
            message: `player ${player.getName()} drawned new spell card`
        }
    },
    PLAYER_DRAWNED_DUNGEON_CARD: (player: Player): GameEvent => {
        return {
            type: "PLAYER_DRAWNED_DUNGEON_CARD",
            message: `player ${player.getName()} drawned new dungeon card`
        }
    },
    PLAYER_BUILD_DUNGEON: (player: Player, dungeon: DungeonCard): GameEvent => {
        return {
            type: "PLAYER_BUILD_DUNGEON",
            message: `player ${player.getName()} build ${dungeon.getName()}.`,
            player,
            dungeon
        }
    },
    PLAYER_ACCEPTED_SPELL_PLAY: (player: Player, spell: SpellCard): GameEvent => {
        return {
            type: "PLAYER_ACCEPTED_SPELL_PLAY",
            message: `player ${player.getName()} accepted play of '${spell.getName()}' by ${spell.owner.getName()}.`,
        }
    },
    // PLAYER_THROWN_AWAY_CARD: (player: Player, card: SpellCard | DungeonCard): GameEvent => {
    //     return {
    //         type: "PLAYER_THROWN_AWAY_CARD",
    //         message: `player ${player.getName()} thrown away card '${card.getName()}'.`,
    //         player,
    //         card
    //     }
    // },
    PLAYER_THROWN_AWAY_SPELL_CARD: (player: Player, spell: SpellCard): GameEvent => {
        return {
            type: "PLAYER_THROWN_AWAY_SPELL_CARD",
            message: `player ${player.getName()} thrown away spell '${spell.getName()}'.`,
            player,
            spell
        }
    },
    PLAYER_THROWN_AWAY_DUNGEON_CARD: (player: Player, dungeon: DungeonCard): GameEvent => {
        return {
            type: "PLAYER_THROWN_AWAY_DUNGEON_CARD",
            message: `player ${player.getName()} thrown away dungeon '${dungeon.getName()}'.`,
            player,
            dungeon
        }
    },
    PLAYER_TOOK_SPELL_FROM_PLAYER: (whoTook: Player, whoGave: Player, spell: SpellCard): GameEvent => {
        return {
            type: "PLAYER_TOOK_SPELL_FROM_PLAYER",
            message: `player ${whoTook.getName()} took spell from ${whoGave.getName()}.`,
            spell,
            whoGave,
            whoTook
        }
    },
    PLAYER_TOOK_DUNGEON_FROM_PLAYER: (whoTook: Player, whoGave: Player, dungeon: DungeonCard): GameEvent => {
        return {
            type: "PLAYER_TOOK_DUNGEON_FROM_PLAYER",
            message: `player ${whoTook.getName()} took dungeon from ${whoGave.getName()}.`,
            dungeon,
            whoGave,
            whoTook
        }
    },
    HERO_ENTERED_ROOM: (hero: HeroCard, dungeonCard: DungeonCard, dungeonOwner: Player): GameEvent => {
        return {
            type: "HERO_ENTERED_ROOM",
            message: `hero ${hero.getName()} entered ${dungeonCard.getName()} at ${dungeonOwner.getName()}'s dungeon.`,
            hero,
            dungeonCard,
            dungeonOwner
        }
    },
    HERO_DIED_IN_ROOM: (hero: HeroCard, room: DungeonCard): GameEvent => {
        return {
            type: "HERO_DIED_IN_ROOM",
            message: `hero ${hero.getName()} died in ${room.getName()} at ${room.owner.getName()}'s dungeon.`,
            hero,
            room,
        }
    },
    PLAYER_USED_BOSS_RANKUP_MECHANIC: (player: Player, boss: BossCard, mechanic: BossMechanic): GameEvent => {
        return {
            type: "PLAYER_USED_BOSS_RANKUP_MECHANIC",
            message: `player ${player.getName()} used ${boss.getName()}'s '${mechanic.getDescription()}'`,
            player,
            boss,
            mechanic
        }
    },
    PLAYER_USED_CUSTOM_CARD_ACTION: (player: Player, card: DungeonCard | HeroCard | BossCard | SpellCard, action: CardAction): GameEvent => {
        return {
            type: "PLAYER_USED_CUSTOM_CARD_ACTION",
            message: `player ${player.getName()} used ${card.getName()}'s action '${action.title}'`,
            player,
            card,
            action
        }
    },
    PLAYER_RANKED_UP_BOSS: (player: Player, boss: BossCard): GameEvent => {
        return {
            type: "PLAYER_RANKED_UP_BOSS",
            message: `player ${player.getName()} ranked up ${boss.getName()}`,
            player,
            boss
        }
    },
    DUNGEON_CARD_GOT_ACTIVATED: (dungeon: DungeonCard): GameEvent => {
        return {
            type: "DUNGEON_CARD_GOT_ACTIVATED",
            message: `dungeon ${dungeon.getName()} got activated ${dungeon.owner ? `at ${dungeon.owner.getName()}'s dungeon` : ''}}`,
            dungeon,
        }
    },
    DUNGEON_CARD_GOT_DEACTIVATED: (dungeon: DungeonCard): GameEvent => {
        return {
            type: "DUNGEON_CARD_GOT_DEACTIVATED",
            message: `dungeon ${dungeon.getName()} got deactivated ${dungeon.owner ? `at ${dungeon.owner.getName()}'s dungeon` : ''}}`,
            dungeon,
        }
    }
}

module.exports = {
    feedback,
    // eventTypes
}

export { }
