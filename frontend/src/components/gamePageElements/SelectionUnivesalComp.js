import { useDispatch, useSelector } from 'react-redux'
import './SelectionUnivesalComp.css'
import { useParams } from 'react-router-dom'
import CardDungeon from './CardDungeon'
import { saveResponseError } from '../utils'
import Cookies from 'js-cookie'

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
                        // <div onClick={() => handleSelectItem(item)} className='single-item-holder' key={i}>
                        // <p className='single-item-value'>{item}</p>
                        // </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='treasure-selection-wrapper'>
            <h3 className='treasure-selection-header'>{selectionMessage}</h3>
            <div className='treasure-sumbol-holder'>
                {avalibleItemsForSelectArr?.map((item, i) => (
                    <div onClick={() => handleSelectItem(item)} className='single-item-holder' key={i}>
                        <p className='single-item-value'>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
