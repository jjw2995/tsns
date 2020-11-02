// const { update } = require("../db/db-reaction");

// const qwe = require("mongoose").model("Post");
const log = (msg) => console.log("\n", msg);
// let this.Content;
// let this.Reaction;
module.exports = class Reactionable {
  constructor(contentModel, reactionModel) {
    this.Content = contentModel;
    this.Reaction = reactionModel;
    // this.Content.find({}).then((r) => {
    // log("HEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHEREHERE");
    //   log(r);
    // });
    // log(this.Reaction);
  }

  _checkReaction(reaction) {
    // log(!["love", "haha", "sad", "angry"].includes(reaction));
    if (!["love", "haha", "sad", "angry"].includes(reaction)) {
      throw new Error("reaction is not one of love, haha, sad, and angry");
    }
  }

  // dec (remove reaction)
  // TODO: maybe ensure no negative values?
  async _decrementReaction(contentID, reaction) {
    // this._checkReaction(reaction);

    let update = { $inc: { ["reactions." + reaction]: -1 } };
    let options = { new: true };
    let a = await this.Content.findByIdAndUpdate(contentID, update, options);
    return a;
  }

  // inc (add new reaction)
  async _incrementReaction(contentID, reaction) {
    let update = { $inc: { ["reactions." + reaction]: 1 } };
    let options = { new: true };
    let incrementedReaction = await this.Content.findByIdAndUpdate(
      contentID,
      update,
      options
    );
    return incrementedReaction;
  }

  // update dec inc (change existing reation)
  async _updateReaction(contentID, previousReaction, newReaction) {
    let prevReact = "reactions." + previousReaction;
    let newReact = "reactions." + newReaction;
    let update = { $inc: { [prevReact]: -1 }, $inc: { [newReact]: 1 } };
    let options = { new: true };

    let a = await this.Content.findByIdAndUpdate(contentID, update, options);
    return a;
  }

  async postReaction(user, contentID, reaction) {
    this._checkReaction(reaction);

    let reactionDoc = await this.Reaction.findOneAndUpdate(
      {
        contentID: contentID,
        "user._id": user._id,
      },
      reactionObj(contentID, user, reaction),
      { upsert: true }
    );
    // log(reactionDoc);
    let newDoc;
    if (reactionDoc) {
      newDoc = await this._updateReaction(
        contentID,
        reactionDoc.reaction,
        reaction
      );
    } else {
      // log("herereerer");
      newDoc = await this._incrementReaction(contentID, reaction);
    }

    let reactions = await this.getReactionCounts(contentID);
    // log(reactions);
    return reactions;
  }

  async deleteReactions(contentIDs) {
    let a = await this.Reaction.deleteMany({ contentID: { $in: contentIDs } });
    return a;
  }

  async appendReqReactions(user, contents) {
    let arr = contents.map((content) => {
      content.userReaction = null;
      return content._id;
    });
    arr = await this.Reaction.find({
      contentID: { $in: arr },
      "user._id": user._id,
    });
    // log("herehereherehereherehere?");
    arr.map((reactionDoc) => {
      let contentRef = contents.find((content) => {
        return content._id === reactionDoc.contentID;
      });
      this.appendReaction(contentRef, reactionDoc.reaction);
    });
    // erase this
    // console.log(contents);
    return contents;

    // let a = Promise.all(arr)
  }
  appendReaction(contentRef, reaction = null) {
    contentRef.userReaction = reaction;
  }

  async getReactionCounts(contentID) {
    let reactions =
      //
      await this.Reaction.aggregate([
        { $match: { contentID: contentID } },
        { $project: { user: 1, reaction: 1, _id: 0 } },
        {
          $group: {
            _id: "$reaction",
            count: { $sum: 1 },
          },
        },
      ]);

    let reactionsObj = {};
    reactions.forEach((reaction) => {
      // log(reaction._id);
      reactionsObj[reaction._id] = reaction.count;
    });
    // log(reactionsObj);
    // log(reactions);
    return reactionsObj;
  }

  async getReactions(contentID, reaction, lastReaction = null) {
    let reactions =
      //
      await this.Reaction.aggregate([
        { $match: { contentID: contentID } },
        // { $project: { user: 1, reaction: 1, _id: 0 } },
        // {
        //   $group: {
        //     _id: "$reaction",
        //     count: { $sum: 1 },
        //   },
        // },
      ]);
    return reactions;
  }
  // // change to paging each emotion, 20
  // async getReactions(contentID) {
  //   let reactions =
  //     //
  //     await this.Reaction.aggregate([
  //       { $match: { contentID: contentID } },
  //       { $project: { user: 1, reaction: 1, _id: 0 } },
  //       {
  //         $group: {
  //           _id: "$reaction",
  //           count: { $sum: 1 },
  //           documents: { $push: "$$ROOT" },
  //         },
  //       },
  //     ]);

  //   return reactions;
  // }
};

function reactionObj(contentID, user, reaction) {
  return { reaction: reaction, user: user, contentID: contentID };
}
