const eventTypes = {
    PLAYER_DECLARED_BUILD: 'BUILD',
    PLAYER_BECOME_READY: 'READY',
    START_FIGHT_PHASE: 'START_FIGHT',
    HERO_GOTO_PLAYER: 'HERO_LURED',
    PLAYER_KILLED_HERO: 'HERO_KILLED',
    HERO_ATTACKED_PLAYER: 'PLAYER_DAMAGED',
    PLAYER_SELECTED_BOSS: 'PLAYER_SELECTED_BOSS',
    START_FIRST_ROUND: 'START_FIRST_ROUND',
    HERO_DAMAGED: 'HERO_DAMAGED',
    PLAYER_ACCEPTED_HERO_MOVE: 'PLAYER_ACCEPTED_HERO_MOVE',
    NO_MORE_HEROES_IN_FIGHT_PHASE: 'NO_MORE_HEROES_IN_FIGHT_PHASE',
    NEW_ROUND_BEGUN: 'NEW_ROUND_BEGUN',
    START_BUILD_PHASE: 'START_BUILD_PHASE',
    PLAYER_DESTROYED_DUNGEON: 'PLAYER_DESTROYED_DUNGEON',
    PLAYER_USED_MECHANIC: 'PLAYER_USED_MECHANIC',
    HERO_DAMAGED_BY_SPELL: 'HERO_DAMAGED_BY_SPELL',
    HERO_WENT_BACK_TO_CITY: 'HERO_WENT_BACK_TO_CITY',
    PLAYER_PLAYED_SPELL: 'PLAYER_PLAYED_SPELL',
    PLAYER_DRAWNED_DUNGEON_CARD: 'PLAYER_DRAWNED_DUNGEON_CARD',
    PLAYER_DRAWNED_SPELL_CARD: 'PLAYER_DRAWNED_SPELL_CARD',
    PLAYER_BUILD_DUNGEON: 'PLAYER_BUILD_DUNGEON',
    PLAYER_ACCEPTED_SPELL_PLAY: 'PLAYER_ACCEPTED_SPELL_PLAY',
    PLAYER_THROWN_AWAY_CARD: 'PLAYER_THROWN_AWAY_CARD',
    HERO_ENTERED_ROOM: 'HERO_ENTERED_ROOM',
    HERO_DIED_IN_ROOM: 'HERO_DIED_IN_ROOM',
    PLAYER_USED_BOSS_RANKUP_MECHANIC: 'PLAYER_USED_BOSS_RANKUP_MECHANIC',
    PLAYER_USED_CUSTOM_CARD_ACTION: 'PLAYER_USED_CUSTOM_CARD_ACTION'
}

const feedback = {
    PLAYER_DECLARED_BUILD: (player) => {
        return {
            type: "BUILD",
            message: `player with id ${player.id} declared building an dungeon`,
        }
    },
    PLAYER_BECOME_READY: (player) => {
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
    HERO_GOTO_PLAYER: (hero, player) => {
        return {
            type: "HERO_LURED",
            message: `hero ${hero.getName()} went to ${player.getName()}`,
            hero,
            player
        }
    },
    PLAYER_KILLED_HERO: (player, hero) => {
        return {
            type: "HERO_KILLED",
            message: `player ${player.getName()} killed hero ${hero.getName()}`
        }
    },
    HERO_ATTACKED_PLAYER: (hero, player) => {
        return {
            type: "PLAYER_DAMAGED",
            message: `hero ${hero.getName()} damaged player ${player.getName()} for ${hero.damageDealt} hp`
        }
    },
    PLAYER_SELECTED_BOSS: (player, boss) => {
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
    HERO_DAMAGED: (hero, dungeon, player) => {
        return {
            type: "HERO_DAMAGED",
            message: `Hero ${hero.getName()} got damaged for ${dungeon.damage} hp in ${player.getName()}'s dungeon. Hp left: ${hero.health}`
        }
    },
    PLAYER_ACCEPTED_HERO_MOVE: (player) => {
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
    NEW_ROUND_BEGUN: (game) => {
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
    PLAYER_DESTROYED_DUNGEON: (player, dungeon) => {
        return {
            type: "PLAYER_DESTROYED_DUNGEON",
            message: `player ${player.getName()} destroyed dungeon ${dungeon.getName()}`
        }
    },
    PLAYER_PLAYED_SPELL: (player, spell) => {
        return {
            type: "PLAYER_PLAYED_SPELL",
            message: `player ${player.getName()} used spell: '${spell.getName()}'`,
            player: player,
            spell: spell
        }
    },
    PLAYER_USED_MECHANIC: (player, mechanic) => {
        return {
            type: "PLAYER_USED_MECHANIC",
            message: `player ${player.getName()} used '${mechanic.getDescription()}'`
        }
    },
    HERO_DAMAGED_BY_SPELL: (hero, spellDamageAmount, spellName, player) => {
        return {
            type: "HERO_DAMAGED_BY_SPELL",
            message: `player ${player.getName()} damaged hero ${hero.getName()} for ${spellDamageAmount} with ${spellName}`
        }
    },
    HERO_WENT_BACK_TO_CITY: (hero) => {
        return {
            type: "HERO_WENT_BACK_TO_CITY",
            message: `hero ${hero.getName()} went back to the city`
        }
    },
    PLAYER_DRAWNED_SPELL_CARD: (player) => {
        return {
            type: eventTypes.PLAYER_DRAWNED_SPELL_CARD,
            message: `player ${player.getName()} drawned new spell card`
        }
    },
    PLAYER_DRAWNED_DUNGEON_CARD: (player) => {
        return {
            type: eventTypes.PLAYER_DRAWNED_DUNGEON_CARD,
            message: `player ${player.getName()} drawned new dungeon card`
        }
    },
    PLAYER_BUILD_DUNGEON: (player, dungeon) => {
        return {
            type: eventTypes.PLAYER_BUILD_DUNGEON,
            message: `player ${player.getName()} build ${dungeon.getName()}.`,
            player,
            dungeon
        }
    },
    PLAYER_ACCEPTED_SPELL_PLAY: (player, spell) => {
        return {
            type: eventTypes.PLAYER_ACCEPTED_SPELL_PLAY,
            message: `player ${player.getName()} accepted play of '${spell.getName()}' by ${spell.owner.getName()}.`,
        }
    },
    PLAYER_THROWN_AWAY_CARD: (player, card) => {
        return {
            type: eventTypes.PLAYER_THROWN_AWAY_CARD,
            message: `player ${player.getName()} thrown away card '${card.getName()}'.`,
            player,
            card
        }
    },
    HERO_ENTERED_ROOM: (hero, dungeonCard, dungeonOwner) => {
        return {
            type: eventTypes.HERO_ENTERED_ROOM,
            message: `hero ${hero.getName()} entered ${dungeonCard.getName()} at ${dungeonOwner.getName()}'s dungeon.`,
            hero,
            dungeonCard,
            dungeonOwner
        }
    },
    HERO_DIED_IN_ROOM: (hero, room) => {
        return {
            type: eventTypes.HERO_DIED_IN_ROOM,
            message: `hero ${hero.getName()} died in ${room.getName()} at ${room.owner.getName()}'s dungeon.`,
            hero,
            room,
        }
    },
    PLAYER_USED_BOSS_RANKUP_MECHANIC: (player, boss, mechanic) => {
        return {
            type: eventTypes.PLAYER_USED_BOSS_RANKUP_MECHANIC,
            message: `player ${player.getName()} used ${boss.getName()}'s '${mechanic.getDescription()}'`,
            player,
            boss,
            mechanic
        }
    },
    PLAYER_USED_CUSTOM_CARD_ACTION: (player, card, actionTitle) => {
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
