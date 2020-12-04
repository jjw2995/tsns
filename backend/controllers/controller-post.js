const { formatError } = require("../utils/helper");
const {
  PostService,
  FollowService,
  CommentService,
  UserService,
} = require("../services");
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const Reaction = mongoose.model("Reaction");
const Follower = mongoose.model("Follower");
const Comment = mongoose.model("Comment");
const User = mongoose.model("User");

let userService = new UserService(User);
const postService = new PostService(Post, Reaction);
const commentService = new CommentService(Comment, Reaction);
const followService = new FollowService(Follower);

module.exports = class PostController {
  post(req, res) {
    log("posting a post");
    let files = Object.values(req.files || []);
    log(req.body);
    log(req.body.description);
    log(req.body.level);
    log(req.files);
    // log(req.body);
    // log();
    log(files);
    postService
      .addPost(req.user, req.body, files)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(400).json(e);
      });
  }

  delete(req, res) {
    let postID = req.params.postID;
    postService
      .removePost(req.user, postID)
      .then((r) => {
        return commentService.removeCommentsOnPost(postID);
      })
      .then((r) => res.sendStatus(204))
      .catch((e) => {
        log(e);
        res.status(400).json(e);
      });
  }

  patch(req, res) {
    postService
      .updatePost(
        req.user,
        req.body.postID,
        req.body.description,
        req.body.level
      )
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(formatError(e)));
  }
  get(req, res) {
    let num = req.query.num;
    // let num;

    let user = req.user;
    followService
      .getFollowees(user)
      .then((followees) => {
        return postService.getPosts(user, followees, num);
      })
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(formatError(e)));
  }
  async getByUID(req, res) {
    let userID_toGetFrom = req.params.userID;
    let num;
    try {
      if (req.user._id === userID_toGetFrom) {
        throw {
          status: 400,
          message: "use GET api/posts/mine for getting own posts",
        };
      }
      let isFollowing = await followService.checkFollowing(
        req.user._id,
        userID_toGetFrom
      );
      let posts = await postService.getPostsByUserID(
        req.user,
        userID_toGetFrom,
        isFollowing,
        req.params["last-created-at"],
        req.params.num
      );
      res.status(200).json(posts);
    } catch (e) {
      // log(e);
      res.status(e.status).json(e.message);
    }
  }

  getMine(req, res) {
    postService
      .getMyPosts(req.user, req.query.num)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(500).json(formatError(e)));
  }

  getExplore(req, res) {
    postService
      .getExplorePosts(req.user, req.params["last-created-at"], req.params.num)
      .then((r) => res.status(200).json(r))
      .catch((e) => {
        res.status(500).json(formatError(e));
      });
  }

  postReact(req, res) {
    // FIX TO req.body.postID
    postService
      .postReaction(req.user, req.body.postID, req.body.reaction)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e.message));
  }
  deleteReact(req, res) {
    // let postID = req.params.postID;
    postService
      .deleteReaction(req.user, req.params.postID)
      .then((r) => res.status(200).json(r))
      .catch((e) => res.status(400).json(e));
  }
};

// 	// res.status().send().;
// 	// res.status().json()
// 	// res.send().json()

// 	// req.headers
// 	// req.body
// 	// req.params
// 	// req.query
// };
