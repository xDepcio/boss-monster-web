import { Routes, Route, useParams, useLocation } from 'react-router-dom'
import LobbyPage from './components/LobbyPage';
import MainPage from './components/MainPage';
import Cookies from 'js-cookie'
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GamePage from './components/GamePage';
import io from "socket.io-client";


export const socket = io.connect("http://localhost:3001");

function App() {

    useEffect(() => {
        const user = Cookies.get('user')
        if (!user) {
            Cookies.set('user', uuidv4(), { expires: 365 })
        }
    }, [])

    return (
        <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path='/lobby/:lobbyId' element={<LobbyPage />} />
            <Route path='/lobby/:lobbyId/game' element={<GamePage />} />
        </Routes>
    );
}

export default App;
