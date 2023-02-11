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
    }
}

module.exports = feedback
