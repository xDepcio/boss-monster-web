import { useEffect, useMemo, useState } from 'react'
import './Card.css'
import './CardDungeon.css'
import { symbolImage } from '../../static/constants'
import { getBgColor, getFontEm } from '../utils'


function CardDungeon({ width, _className, bgImage, isFancy = false, description = '', mainImg, damage = 'X', type, treasure, name = '', _onClick, fontHelp }) {
    const [cardTreasureArr, setCardTreasureArr] = useState([])
    const [subHeader, setSubHeader] = useState('')
    const [typeUrl, setTypeUrl] = useState('')
    const bgUrl = useMemo(() => getBgColor(treasure), [treasure])

    useEffect(() => {
        switch (type) {
            case 'traps': {
                if (isFancy) {
                    setSubHeader('Wypaśna komnata pułapek')
                    setTypeUrl('/images/dungeon_types/traps_type_enchanced.png')
                }
                else {
                    setSubHeader('Komnata pułapek')
                    setTypeUrl('/images/dungeon_types/traps_type.png')
                }
                break
            }
            case 'monsters': {
                if (isFancy) {
                    setSubHeader('Wypaśna komnata potworów')
                    setTypeUrl('/images/dungeon_types/monsters_type_enchanced.png')
                }
                else {
                    setSubHeader('Komnata potworów')
                    setTypeUrl('/images/dungeon_types/monsters_type.png')
                }
                break
            }
            default: {
                break
            }
        }
    }, [])

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
        <div onClick={_onClick}
            style={{
                width: typeof width === 'string' ? width : width + 'px',
                fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px`
            }}
            className={`main-card-wrapper card-comp ${_className}`}
        >
            <h3 style={{ fontSize: getFontEm(name.length) }} className='card-info-comp card-name dung-card-name'>{name}</h3>
            <p className='card-info-comp card-subname dungeon-card-type'>{subHeader}</p>
            <p className='card-info-comp dungeon-card-damage'>{damage}</p>
            <p className='card-info-comp card-comp dung-card-desc'>Każdy przeciwnik musi wybrać i zniszczyć komnatę w swoich podziemiach</p>
            <img className='card-info-comp card-img-comp card-comp card-type-comp' src={typeUrl} />
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={bgUrl || '/images/red_bg_canvas.png'} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={mainImg || '/images/bosses/boss_ROBOBO.png'} />
            <img className='card-info-comp card-img-comp card-comp dungeon-card-damage-img' src={mainImg || '/images/basic/dungeon_damage_heart.png'} />
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

export default CardDungeon
