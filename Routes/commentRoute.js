const express = require('express')
const {addComment, fetchUserFeedbacks} = require('../Controllers/commentController')

const commentRouter = express.Router()

commentRouter.post('/add', addComment)
commentRouter.post('/', fetchUserFeedbacks)



module.exports = {
    commentRouter
}