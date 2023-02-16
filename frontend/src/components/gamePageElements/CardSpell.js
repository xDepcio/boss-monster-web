import './CardSpell.css'
import { phaseImage } from '../../static/constants'


function CardSpell({ width, _className, description = '', mainImg, phase, name = '', _onClick, fontHelp }) {
    return (
        <div onClick={_onClick} style={{ width: typeof width === 'string' ? width : width + 'px', fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px` }} className={`main-card-wrapper card-comp ${_className}`}>
            <h3 className='card-info-comp card-name spell-card-name '>{name}</h3>
            <p className='card-info-comp card-comp spell-card-desc'>Każdy przeciwnik musi wybrać i zniszczyć komnatę w swoich podziemiach</p>
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={'/images/cards_bgs/bg_spell.png'} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={mainImg || '/images/spells/spell_exhaustion.png'} />
            <img className='card-info-comp card-img-comp card-comp spell-card-phase-img' src={phaseImage[phase]} />
        </div>
    )
}

export default CardSpell