import { useEffect, useState } from 'react'
import './Card.css'
import './CardBack.css'


function CardBack({ width, _className, bgImage, _onClick, fontHelp, text }) {

    return (
        <div onClick={_onClick} style={{ width: typeof width === 'string' ? width : width + 'px', fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px` }} className={`main-card-wrapper card-comp ${_className}`}>
            <p className='bard-back-text'>{text}</p>
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={bgImage || '/images/basic/dungeon_back_no_text.png'} />
        </div>
    )
}

export default CardBack
