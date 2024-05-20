const express = require('express')
const {getAllBlockedUsers, addBlockedUser, unblockUser} = require('../Controllers/blockedUserController')

const blockedUsersRouter = express.Router()

blockedUsersRouter.post('/add', addBlockedUser)
blockedUsersRouter.get('/getAll', getAllBlockedUsers)
blockedUsersRouter.post('/unblock', unblockUser)



module.exports = {
    blockedUsersRouter
}