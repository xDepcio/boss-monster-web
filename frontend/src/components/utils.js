import { loadErrorMessage } from "../store/game"

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
        return '0.5em'
    }
}

export function getHeroDescFontEm(textLength) {
    if (!textLength) {
        return '0.5em'
    }

    if (textLength <= 145) {
        return '0.7em'
    }
    if (textLength <= 175) {
        return '0.65em'
    }
    return '0.5em'
}

export function getSpellDescDontEm(textLength) {
    if (!textLength) {
        return '0.5em'
    }
    if (textLength <= 100) {
        return '0.8em'
    }
    if (textLength <= 145) {
        return '0.7em'
    }
    if (textLength <= 175) {
        return '0.65em'
    }
    return '0.5em'
}

export function getDungDescEm(textLength) {
    if (!textLength) {
        return '0.5em'
    }
    if (textLength <= 100) {
        return '0.8em'
    }
    if (textLength <= 145) {
        return '0.7em'
    }
    if (textLength <= 175) {
        return '0.65em'
    }
    return '0.5em'
}

export function getBossDescEm(textLength) {
    if (!textLength) {
        return '0.5em'
    }
    if (textLength <= 50) {
        return '0.9em'
    }
    if (textLength <= 100) {
        return '0.8em'
    }
    if (textLength <= 145) {
        return '0.7em'
    }
    if (textLength <= 175) {
        return '0.65em'
    }
    return '0.5em'
}

export function getSpellNameEm(textLength) {
    if (!textLength) {
        return '0.6em'
    }
    if (textLength <= 11) {
        return '1em'
    }
    if (textLength <= 15) {
        return '0.9em'
    }
    if (textLength <= 20) {
        return '0.63em'
    }
    return '0.6em'
}

export function saveResponseError(response, dispatch) {
    response.then((res) => {
        return new Promise((resolve, reject) => {
            resolve(res.json())
        }).then((d) => {
            return {
                response: res,
                data: d
            }
        })
    }).then((payload) => {
        // console.log(payload.response)
        // console.log(payload.data)
        if (!payload.response.ok) {
            dispatch(loadErrorMessage(payload.data.message))
        }
    })
}

export function dumbFlat(obj) {
    if (typeof obj !== 'object') return obj
    const newObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] !== 'object') {
                newObj[key] = obj[key];
            }
        }
    }

    return newObj;
}
