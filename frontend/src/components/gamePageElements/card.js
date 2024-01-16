import { useEffect, useState } from 'react'
import './Card.css'
import { BACKEND_URL } from "../../static/constants"


function Card({ width, _className, bgImage, typeImage, treasure, name = '', subName = '', _onClick, fontHelp }) {

    const [cardTreasureArr, setCardTreasureArr] = useState([])

    useEffect(() => {
        if (treasure) {
            const arr = []
            for (const [symbol, amount] of Object.entries(treasure)) {
                for (let i = 0; i < amount; i++) {
                    arr.push(symbol)
                }
            }
            setCardTreasureArr(arr)
        }
    }, [treasure])

    return (
        <div onClick={_onClick} style={{ width: typeof width === 'string' ? width : width + 'px', fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px` }} className={`main-card-wrapper card-comp ${_className}`}>
            <h3 className='card-info-comp card-name'>{name}</h3>
            <p className='card-info-comp card-subname'>{subName}</p>
            <p className='card-info-comp card-comp card-desc-header'>Awans:</p>
            <p className='card-info-comp card-comp card-desc'>Każdy przeciwnik musi wybrać i zniszczyć komnatę w swoich podziemiach</p>
            <img className='card-info-comp card-img-comp card-comp card-type-comp' src={`${BACKEND_URL}/images/monsters_symbol.png`} />
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={bgImage || `${BACKEND_URL}/images/red_bg_canvas.png`} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={`${BACKEND_URL}/images/bosses/boss_ROBOBO.png`} />
            {cardTreasureArr.map((ele, i) => {
                return (
                    <img key={i} style={{
                        transform: `translateX(-${50 * i}%)`
                    }}
                        className='card-info-comp card-img-comp card-symbol-comp' src={`${BACKEND_URL}/images/strength_sword_cut.png`} />
                )
            })}
        </div>
    )
}

export default Card
