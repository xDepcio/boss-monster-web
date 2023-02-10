const { Game } = require('./game/game')
const Player = require('./player/player')
const util = require('util')
const readline = require('readline');
const prompt = require('prompt')


const player1 = new Player(1)
const player2 = new Player(2)
const game = new Game(1, [player1, player2])


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


function showPlayers(choosenCard) {
    console.clear()
    console.log(game.players)
    let choosen
    rl.question('Type player id to choose him: ', (id) => {
        choosen = Player.getPlayer(id)
        showOptions(choosen, choosenCard)
    })
}


function showOptions(choosenPlayer = null, choosenCard = null) {
    console.clear()
    if (choosenPlayer) {
        console.log('Your Player: ', choosenPlayer)
    }
    if (choosenCard) {
        console.log('Your card: ', choosenCard)
    }

    rl.question(`
        Type 'p' to show players
        Type 'c' to show avalible card
        Type 'ready' to become ready
        Type 'g' to get game info
        Type 'play' to use selected card
        Type 'h' to show game actions history
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
            switch (choosenCard.CARDTYPE) {
                case 'DUNGEON': {
                    choosenPlayer.declareBuild(choosenCard)
                    showOptions(choosenPlayer, choosenCard)
                }
            }
        }
        else if (choice === 'ready') {
            choosenPlayer.becomeReady()
            showOptions(choosenPlayer, choosenCard)
        }
        else if (choice === 'h') {
            showHistory(choosenPlayer, choosenCard)
        }
    })
}


function showGameInfo(choosenPlayer, choosenCard) {
    console.clear()
    // console.log(util.inspect(game, { colors: true, depth: null }))
    console.log(game)
    rl.question('Press Enter to exit: ', (e) => {
        showOptions(choosenPlayer, choosenCard)
    })
}


function showHistory(choosenPlayer, choosenCard) {
    console.clear()
    game.printHistory()
    rl.question('Press Enter to exit: ', (e) => {
        showOptions(choosenPlayer, choosenCard)
    })
}


function showCards(player) {
    console.clear()
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
