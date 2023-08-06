import { useEffect, useMemo, useState } from 'react'
import './Card.css'
import './CardBoss.css'
import { symbolImage } from '../../static/constants'
import { getBgColor, getBossDescEm } from '../utils'
import CardRequestedSelectionHandle from './CardRequestedSelectionHandle'
import { useSelector } from 'react-redux'


function CardBoss({ width, _className, bgImage, description = '', mainImg, treasure, name = '', pd = 0, subName = '', _onClick, fontHelp, card }) {

    const [cardTreasureArr, setCardTreasureArr] = useState([])
    const bgUrl = useMemo(() => getBgColor(treasure), [treasure])
    const selfPlayer = useSelector(state => state.game?.selfPlayer)
    const [enhance, setEnhance] = useState(false)

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
        <div onClick={_onClick} onContextMenu={(e) => {
            e.preventDefault()
            setEnhance(!enhance)
        }} style={{
            width: typeof width === 'string' ? width : width + 'px',
            fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px`,
            transform: enhance ? 'scale(2)' : '',
            zIndex: enhance ? '100' : '1'
        }} className={`main-card-wrapper card-comp ${_className}`}>
            {selfPlayer?.requestedSelection && <CardRequestedSelectionHandle card={card} />}
            <h3 className='card-info-comp card-name'>{name}</h3>
            <p className='card-info-comp card-subname boss-card-subname'>{subName || 'Boss subname destr'}</p>
            <p className='card-info-comp boss-card-pd'>{pd} PD</p>
            <p className='card-info-comp card-comp card-desc-header'>Awans:</p>
            <p className='card-info-comp card-comp boss-card-desc' style={{ fontSize: getBossDescEm(description?.length ?? '') }} >{description ?? ''}</p>
            <img className='card-info-comp card-img-comp card-comp card-type-comp' src={'/images/dungeon_types/monsters_symbol.png'} />
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={bgUrl || '/images/red_bg_canvas.png'} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={mainImg || '/images/bosses/boss_ROBOBO.png'} />
            {cardTreasureArr.map((symbol, i) => {
                return (
                    <img key={i} style={{
                        transform: `translateX(-${50 * i}%)`
                    }}
                        className='card-info-comp card-img-comp card-symbol-comp' src={symbolImage[symbol]} />
                )
            })}
        </div>
    )
}

export default CardBoss
