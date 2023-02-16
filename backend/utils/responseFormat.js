const CircularJSON = require('circular-json')

function flattenCircular(obj) {
    return JSON.parse(CircularJSON.stringify(obj))
}

module.exports = {
    flattenCircular
}
