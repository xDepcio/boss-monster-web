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
            message: `hero ${hero.name} went to ${player.name}`
        }
    },
    PLAYER_KILLED_HERO: (player, hero) => {
        return {
            type: "HERO_KILLED",
            message: `player ${player.name} killed hero ${hero.name}`
        }
    },
    HERO_ATTACKED_PLAYER: (hero, player) => {
        return {
            type: "PLAYER_DAMAGED",
            message: `hero ${hero.name} damaged player ${player.name} for ${hero.damageDealt} hp`
        }
    },
    PLAYER_SELECTED_BOSS: (player, boss) => {
        return {
            type: "PLAYER_SELECTED_BOSS",
            message: `player ${player.name} selected boss ${boss.name}`
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
            message: `Hero ${hero.name} got damaged for ${dungeon.damage} hp in ${player.name}'s dungeon. Hp left: ${hero.health}`
        }
    },
    PLAYER_ACCEPTED_HERO_MOVE: (player) => {
        return {
            type: "PLAYER_ACCEPTED_HERO_MOVE",
            message: `Player ${player.name} accepted hero move`
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
            message: `player ${player.name} destroyed dungeon ${dungeon.name}`
        }
    },
    PLAYER_USED_MECHANIC: (player, mechanic) => {
        return {
            type: "PLAYER_USED_MECHANIC",
            message: `player ${player.name} used '${mechanic.getDescription()}'`
        }
    }
}

module.exports = feedback
