const express = require('express');
const router = express.Router();

const usersRouter = require('./users')
const lobbyRouter = require('./lobby')
const gameRouter = require('./game')

router.use('/users', usersRouter)
router.use('/lobby', lobbyRouter)
router.use('/game', gameRouter)

/* GET home page. */
router.get('/', (req, res, next) => {
    res.json({ title: 'Express' });
});

module.exports = router;
