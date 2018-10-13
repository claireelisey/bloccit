const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const validation = require("./validation");
const helper = require("../auth/helpers");

router.get("/topics/:topicId/posts/new", postController.new);

router.post("/topics/:topicId/posts/create",
<<<<<<< HEAD
    helper.ensureAuthenticated,
    validation.validatePosts,
    postController.create);
=======
   helper.ensureAuthenticated,
   validation.validatePosts,
   postController.create);
>>>>>>> attempt-2-checkpoint-authorization

router.get("/topics/:topicId/posts/:id", postController.show);

router.post("/topics/:topicId/posts/:id/destroy", postController.destroy);

router.get("/topics/:topicId/posts/:id/edit", postController.edit);
<<<<<<< HEAD
=======

>>>>>>> attempt-2-checkpoint-authorization
router.post("/topics/:topicId/posts/:id/update", validation.validatePosts, postController.update);

module.exports = router;