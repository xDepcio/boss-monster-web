export function getBgColor(treasure) {
    if (treasure) {
        const bgs = {
            yellow: '/images/cards_bgs/bg_yellow.png',
            red: '/images/cards_bgs/bg_red.png',
            blue: '/images/cards_bgs/bg_blue.png',
            white: '/images/cards_bgs/bg_white.png',
            black: '/images/cards_bgs/bg_black.png',
        }

        const symbols = Object.keys(treasure)
        if (symbols.length > 1) {
            return bgs.yellow
        }

        const symbol = symbols[0]
        switch (symbol) {
            case 'magic':
                return bgs.blue
            case 'strength':
                return bgs.red
            case 'faith':
                return bgs.white
            case 'fortune':
                return bgs.black
        }
    }
}

export function getFontEm(textLength) {
    if (textLength) {
        if (textLength <= 10) {
            return '1em'
        }
        if (textLength <= 15) {
            return '0.8em'
        }
        if (textLength <= 20) {
            return '0.65em'
        }
    }
}
