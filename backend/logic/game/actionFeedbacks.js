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
    }
}

module.exports = feedback
