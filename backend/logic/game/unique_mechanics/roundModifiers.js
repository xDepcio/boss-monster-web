class RoundModifer {
    constructor(onModifierUsed, onRoundEnd) {
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
}


module.exports = {
    RoundModifer
}
