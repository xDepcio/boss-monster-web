import { useSelector } from 'react-redux'
import { getHeroDescFontEm } from '../utils'
import './CardHero.css'
import CardRequestedSelectionHandle from './CardRequestedSelectionHandle'
import HeroToMoveMarker from './HeroToMoveMarker'
import { BACKEND_URL } from "../../static/constants"


function CardHero({ width, _className, heroClass = '', id, mainImg, type = 'common', name = '',
    description = '', baseHealth, health, treasure, damageDealt, _onClick, fontHelp, card,
    typeName = '', specialName = '' }) {

    const heroToMove = useSelector(state => state.game?.game.heroToMove)
    const selfPlayer = useSelector(state => state.game?.selfPlayer)

    const treasures = {
        strength: `${BACKEND_URL}/images/hero/symbols/hero_strength.png`,
        faith: `${BACKEND_URL}/images/hero/symbols/hero_faith.png`,
        magic: `${BACKEND_URL}/images/hero/symbols/hero_magic.png`,
        fortune: `${BACKEND_URL}/images/hero/symbols/hero_fortune.png`
    }

    const heroTypes = {
        legendary: 'Legendarny bohater',
        common: 'Typowy bohater'
    }

    return (
        <div onClick={_onClick}
            style={{
                width: typeof width === 'string' ? width : width + 'px',
                fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px`
            }}
            className={`main-card-wrapper card-comp ${heroToMove ? heroToMove.id === id ? 'hero-to-move' : '' : ''} ${_className}`}
        >
            {selfPlayer?.requestedSelection && <CardRequestedSelectionHandle card={card} />}
            {(heroToMove?.id === id && heroToMove?.dungeonRoom === null) && <HeroToMoveMarker />}
            <h3 className='card-info-comp card-name hero-card-name '>{name}</h3>
            <p className='card-info-comp card-comp hero-card-subname'>{heroTypes[type]}</p>
            <p className='card-info-comp card-comp hero-card-special-name'>{specialName}</p>
            <p style={{ fontSize: getHeroDescFontEm(description?.length) }} className='card-info-comp card-comp hero-card-desc'>{description || 'Każdy przeciwnik musi wybrać i zniszczyć komnatę w swoich podziemiach'}</p>
            <p className={`card-info-comp card-comp hero-hp-text ${health < baseHealth && 'hero-hp-damaged'} ${health > baseHealth && 'hero-hp-buffed'} `}>{health}</p>
            <img className='card-info-comp card-img-comp card-comp hero-health-img' src={`${BACKEND_URL}/images/hero/hero_hp.png`} />
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={`${BACKEND_URL}/images/hero/bgs/hero_common_bg.png`} />
            <img className='card-info-comp card-img-comp card-comp hero-treasure-comp' src={treasures[treasure]} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={mainImg || `${BACKEND_URL}/images/hero/heroes/wayward_the_drifter.png`} />
            {new Array(damageDealt).fill(null).map((e, i) => {
                return (
                    <img key={i} style={{
                        transform: `translateX(-${32 * i}%)`
                    }}
                        className='card-info-comp card-img-comp hero-damage-comp' src={`${BACKEND_URL}/images/hero/hero_one_damage_blood.png`} />
                )
            })}
        </div>
    )
}

export default CardHero
