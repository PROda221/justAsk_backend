const express = require('express')
const {addComment, fetchUserFeedbacks, getYourComment} = require('../Controllers/commentController')

const commentRouter = express.Router()

commentRouter.post('/add', addComment)
commentRouter.post('/getyourcomment', getYourComment)
commentRouter.post('/', fetchUserFeedbacks)



module.exports = {
    commentRouter
}