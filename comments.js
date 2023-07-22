// Create web server

// Import Express
const express = require('express');

// Create a router object
const router = express.Router();

// Import the Comment model
const Comment = require('../models/Comment');

// Import the Article model
const Article = require('../models/Article');

// Import the User model
const User = require('../models/User');

// Import the middleware
const { ensureAuthenticated } = require('../config/auth');

// @route   GET /comments/:article_id
// @desc    Show the comments of an article
// @access  Private
router.get('/:article_id', ensureAuthenticated, (req, res) => {
    // Find the article by id
    Article.findById(req.params.article_id, (err, article) => {
        if (err) {
            console.log(err);
        } else {
            // Find the comments
            Comment.find({ article_id: req.params.article_id })
                .populate('user_id', 'username')
                .exec((err, comments) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // Render the view
                        res.render('comments', {
                            article: article,
                            comments: comments
                        });
                    }
                });
        }
    });
});

// @route   POST /comments/:article_id
// @desc    Create a comment
// @access  Private
router.post('/:article_id', ensureAuthenticated, (req, res) => {
    // Get the article
    Article.findById(req.params.article_id, (err, article) => {
        if (err) {
            console.log(err);
        } else {
            // Create a new comment
            const newComment = new Comment({
                article_id: article._id,
                user_id: req.user._id,
                content: req.body.content
            });

            // Save the comment
            newComment.save((err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    // Update the article
                    article.comments.push(comment._id);
                    article.save((err, article) => {
                        if (err) {
                            console.log(err);
                        } else {
                            // Redirect to the comments page
                            res.redirect(`/comments/${article._id}`);
                        }
                    });
                }
            });
        }
    });
});

// @route   DELETE /comments/:article_id/:comment_id
// @desc    Delete a comment
// @access  Privategit 