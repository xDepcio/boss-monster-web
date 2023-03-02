const { Game } = require('./game/game')
const Player = require('./player/player')
const util = require('util')
const readline = require('readline');
const prompt = require('prompt');
const { SelectionRequest } = require('./game/playerRequestSelections');


const player1 = new Player(1, 'olek')
const player2 = new Player(2, 'mat')
const game = new Game(1, [player1, player2])

player1.selectBoss(player1.drawnBosses[0].id)
player2.selectBoss(player2.drawnBosses[0].id)
player1.declareBuild(player1.dungeonCards[0])
player2.declareBuild(player2.dungeonCards[0])
// console.log(util.inspect(game, { colors: true, depth: null }))
// console.log('================================')

player1.becomeReady()
// player2.becomeReady()
// console.log(util.inspect(game, { colors: true, depth: null }))




const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


function showOptions(choosenPlayer = null, choosenCard = null, lastError = null) {
    // console.clear()
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');

    if (choosenPlayer) {
        console.log('Your Player: ', choosenPlayer)
    }
    if (choosenCard) {
        console.log('Your card: ', choosenCard)
    }

    if (lastError) {
        console.log('\n', "Error: ", lastError.message, '\n')
    }

    rl.question(`
    Type 'p' to show players
    Type 'c' to show avalible card
    Type 'ready' to become ready
    Type 'g' to get game info
    Type 'play' to use selected card
    Type 'h' to show game actions history
    Type 'acc' to accept hero dungeon entrance
    Type 'b' to show avalible bosses
    Type 'destroy' to choose card to destroy
    Type 'select' to choose requested selections
    `, (choice) => {
        if (choice === 'p') {
            showPlayers()
        }
        else if (choice === 'c') {
            if (!choosenPlayer) {
                console.log("You must choose player first")
                showOptions(choosenPlayer, choosenCard)
            }
            else {
                showCards(choosenPlayer)
            }
        }
        else if (choice === 'g') {
            showGameInfo(choosenPlayer, choosenCard)
        }
        else if (choice === 'play') {
            try {
                switch (choosenCard.CARDTYPE) {
                    case 'DUNGEON': {
                        choosenPlayer.declareBuild(choosenCard)
                        showOptions(choosenPlayer, choosenCard)
                    }
                    case 'SPELL': {
                        choosenPlayer.playSpell(choosenCard.id)
                        showOptions(choosenPlayer, choosenCard)
                    }
                }
            } catch (e) {
                showOptions(choosenPlayer, choosenCard, e)
            }
        }
        else if (choice === 'ready') {
            try {
                choosenPlayer.becomeReady()
                showOptions(choosenPlayer, choosenCard)
            } catch (e) {
                showOptions(choosenPlayer, choosenCard, e)
            }
        }
        else if (choice === 'h') {
            showHistory(choosenPlayer, choosenCard)
        }
        else if (choice === 'acc') {
            try {
                choosenPlayer.acceptHeroMove()
                showOptions(choosenPlayer, choosenCard)
            } catch (e) {
                showOptions(choosenPlayer, choosenCard, e)
            }
        }
        else if (choice === 'b') {
            showBosses(choosenPlayer)
        }
        else if (choice === 'destroy') {
            showDestroyMenu(choosenPlayer)
        }
        else if (choice === 'select') {
            showSelectionMenu(choosenPlayer, choosenCard)
        }
        else {
            showOptions(choosenPlayer, choosenCard)
        }
    })
}


function showSelectionMenu(choosenPlayer, choosenCard) {
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H')
    switch (choosenPlayer.requestedSelection.getRequestItemType()) {
        case SelectionRequest.requestItemTypes.HERO: {
            if (choosenPlayer.requestedSelection.choiceScope !== 'ANY') {
                console.log(choosenPlayer.requestedSelection.choiceScope.dungeonEntranceHeroes)
                rl.question('Type hero card id to select it: ', (heroId) => {
                    try {
                        const selectedHero = choosenPlayer.getHeroFromDungeonEntranceById(parseInt(heroId))
                        choosenPlayer.requestedSelection.selectItem(selectedHero)
                        showOptions(choosenPlayer, choosenCard)
                    } catch (e) {
                        showOptions(choosenPlayer, choosenCard, e)
                    }
                })
            }
            else if (choosenPlayer.requestedSelection.choiceScope === 'ANY') {
                const players = choosenPlayer.trackedGame.players
                let heroes = []
                players.forEach(player => {
                    heroes = heroes.concat(player.dungeonEntranceHeroes)
                })
                console.log(heroes)
                rl.question('Type hero card id to select it: ', (heroId) => {
                    try {
                        const selectedHero = choosenPlayer.getHeroFromDungeonEntranceById(parseInt(heroId))
                        choosenPlayer.requestedSelection.selectItem(selectedHero)
                        showOptions(choosenPlayer, choosenCard)
                    } catch (e) {
                        showOptions(choosenPlayer, choosenCard, e)
                    }
                })
            }
        }
    }
}


function showDestroyMenu(choosenPlayer) {
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H')
    console.log(choosenPlayer.dungeon)
    rl.question('Type dungeon card id to destroy it: ', (dungeonId) => {
        try {
            choosenPlayer.destroyDungeonCard(parseInt(dungeonId))
            showOptions(choosenPlayer)
        } catch (e) {
            showOptions(choosenPlayer, null, e)
        }
    })
}


function showBosses(choosenPlayer) {
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H')
    console.log(choosenPlayer.drawnBosses)
    rl.question('Type boss id to choose him: ', (bossId) => {
        choosenPlayer.selectBoss(parseInt(bossId))
        showOptions(choosenPlayer)
    })
}


function showPlayers(choosenCard) {
    // console.clear()
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
    console.log(game.players)
    let choosen
    rl.question('Type player id to choose him: ', (id) => {
        choosen = Player.getPlayer(id)
        showOptions(choosen, choosenCard)
    })
}


function showGameInfo(choosenPlayer, choosenCard) {
    // console.clear()
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
    console.log(util.inspect(game, { colors: true, depth: null }))
    // console.log(game)
    rl.question('Press Enter to exit: ', (e) => {
        showOptions(choosenPlayer, choosenCard)
    })
}


function showHistory(choosenPlayer, choosenCard) {
    // console.clear()
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
    game.printHistory()
    console.log('')
    rl.question('Press Enter to exit: ', (e) => {
        showOptions(choosenPlayer, choosenCard)
    })
}


function showCards(player) {
    // console.clear()
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
    console.log('SPELL: ', player.spellCards)
    console.log('DUNGEONS: ', player.dungeonCards)

    rl.question(`
    Type 'spell <index>' to choose spell
    Type 'dung <index>' to choose dungeon
    `, (choice) => {
        const [type, index] = choice.split(' ')
        let card
        if (type === 'spell') {
            card = player.spellCards[index]
        }
        else if (type === 'dung') {
            card = player.dungeonCards[index]
        }
        showOptions(player, card)
    })
}


rl.question('Whats your name? ', (answer) => {
    console.log('Hello ', answer)

    showOptions()
})
