class RoundModifer {

    // onModifierUsed: () => void
    onModifierUsed: () => void
    onRoundEnd: () => void

    constructor(onModifierUsed: () => void, onRoundEnd: () => void) {
        this.onModifierUsed = onModifierUsed
        this.onRoundEnd = onRoundEnd
        this.handleModifierused()
    }

    handleModifierused() {
        this.onModifierUsed()
    }

    handleRoundEnded() {
        this.onRoundEnd()
    }

    endManually() {
        this.handleRoundEnded()
        this.handleRoundEnded = () => { }
    }
}


module.exports = {
    RoundModifer
}

export { RoundModifer }
