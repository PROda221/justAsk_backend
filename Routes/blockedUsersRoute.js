const express = require('express')
const {getAllBlockedUsers, addBlockedUser, unblockUser, multiUnblock} = require('../Controllers/blockedUserController')

const blockedUsersRouter = express.Router()

blockedUsersRouter.post('/add', addBlockedUser)
blockedUsersRouter.get('/getAll', getAllBlockedUsers)
blockedUsersRouter.post('/unblock', unblockUser)
blockedUsersRouter.post('/multiUnblock', multiUnblock)



module.exports = {
    blockedUsersRouter
}