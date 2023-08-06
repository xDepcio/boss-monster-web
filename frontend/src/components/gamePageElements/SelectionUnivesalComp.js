import { useDispatch, useSelector } from 'react-redux'
import './SelectionUnivesalComp.css'
import { useParams } from 'react-router-dom'
import CardDungeon from './CardDungeon'
import { saveResponseError } from '../utils'
import Cookies from 'js-cookie'
import CardSpell from './CardSpell'

export default function SelectionUnivesalComp() {
    const avalibleItemsForSelectArr = useSelector(state => state.game?.selfPlayer?.requestedSelection?.avalibleItemsForSelectArr)
    const selectionMessage = useSelector(state => state.game?.selfPlayer?.requestedSelection?.selectionMessage)
    const metadata = useSelector(state => state.game?.selfPlayer?.requestedSelection?.metadata)
    const dispatch = useDispatch()
    const params = useParams()

    function handleSelectItem(item) {
        const res = fetch(`/game/${params.lobbyId}/select-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                selectedItem: item
            })
        })
        saveResponseError(res, dispatch)
    }

    if (metadata?.displayType === 'dungeonCard') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((dungeon, i) => (
                        <CardDungeon
                            baseDamage={dungeon.baseDamage}
                            _onClick={() => {
                                handleSelectItem(dungeon)
                            }}
                            damage={dungeon.damage} width={150}
                            treasure={dungeon.treasure}
                            type={dungeon.type}
                            name={dungeon.name}
                            id={dungeon.id}
                            description={dungeon.description}
                            isFancy={dungeon.isFancy}
                            _className={'built-dung'}
                            card={dungeon}
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (metadata?.displayType === 'spellCard') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((spell, i) => (
                        <CardSpell
                            _onClick={() => handleSelectItem(spell)}
                            width={150}
                            name={spell.name}
                            description={spell.description}
                            key={i}
                            phase={spell.playablePhase}
                            _className={'player-card-in-inv'}
                            card={spell}
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (metadata?.displayType === 'text') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((text, i) => (
                        <div className='text-choice-holder'>
                            <p className='text-choice' key={i} onClick={() => handleSelectItem(text)}>{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return <></>
}
