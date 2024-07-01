import express from 'express';
import usersRouter from './users.js'
import lobbyRouter from './lobby.js'
import gameRouter from './game.js'
import * as _ from './socket.js'

const router = express.Router();

router.use('/users', usersRouter)
router.use('/lobby', lobbyRouter)
router.use('/game', gameRouter)


/* GET home page. */
router.get('/', (req, res, next) => {
    res.json({ title: 'Express' });
});

module.exports = router;

export { }
