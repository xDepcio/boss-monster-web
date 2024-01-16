export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

export const symbolImage = {
    strength: `${BACKEND_URL}/images/treasure_symbols/strength_sword_cut.png`,
    magic: `${BACKEND_URL}/images/treasure_symbols/magic_symbol.png`,
    faith: `${BACKEND_URL}/images/treasure_symbols/faith_symbol.png`,
    fortune: `${BACKEND_URL}/images/treasure_symbols/fortune_symbol.png`,
}

export const phaseImage = {
    build: `${BACKEND_URL}/images/spell_symbols/spell_build_phase.png`,
    fight: `${BACKEND_URL}/images/spell_symbols/spell_fight_phase.png`,
    both: `${BACKEND_URL}/images/spell_symbols/spell_both_phase.png`,
}
