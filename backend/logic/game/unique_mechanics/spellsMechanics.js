class SpellMechanic {
    constructor(id) {
        this.id = id
    }
}

class HeartAttack extends SpellMechanic {
    constructor(id) {
        super(id)
        this.description = 'Znisz komnatę w Twoich podziemiach. Wyeliminuj dowolnego bohatera w tej komnacie.'
    }



}
