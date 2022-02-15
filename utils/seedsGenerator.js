import mongoose from "mongoose";
import fs from "fs";
import Message from "../models/message.js";
import Post from "../models/post.js";
import Category from "../models/category.js";
import Transaction from "../models/transaction.js";
import CommonQA from "../models/commonQA.js";
import User from "../models/user.js";

const { ObjectId } = mongoose.Types;

function pickRandom(num, mode = "pick") {
  if (mode === "qnt") {
    return Math.floor(Math.random() * num) + 1;
  }
  return Math.floor(Math.random() * num);
}

export default class SeedGenerators {
  // CLEAROUT datas
  static async clearOutData(select = "") {
    try {
      switch (select) {
        case "category":
          await Category.deleteMany();
          break;
        case "commonqa":
          await CommonQA.deleteMany();
          break;
        case "post":
          await Post.deleteMany();
          break;
        case "transaction":
          await Transaction.deleteMany();
          break;
        case "user":
          await User.deleteMany();
          break;
        case "message":
          await Message.deleteMany();
          break;
        default:
          let collections = await mongoose.connection.db
            .listCollections()
            .toArray();

          let allCollectionNames = collections.map(
            (collection) => collection.name
          );
          for (let name of allCollectionNames) {
            await mongoose.connection.db.dropCollection(name);
          }
          break;
      }
      console.log(`cleared data from ${select ? select : "all"}`);
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  }

  // Category generator
  static async categorySeeds(samples, scenario = "dev") {
    try {
      // clearout old data if exist
      let checkDataExist = await Category.findOne();
      if (checkDataExist) {
        await Category.deleteMany();
        console.log("clear out categories data");
      }

      //generate new datas
      let result = [];
      for (let category of samples) {
        let dataStructure =
          scenario === "dev"
            ? {
                categoryName: category,
              }
            : { ...category };
        let item = await Category.create(dataStructure);
        result.push(item);
      }

      console.log("complete categories data");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // CommonQ&A generator
  static async commonQASeeds(
    samples,
    sizing = samples.length,
    randMode = false
  ) {
    try {
      // clear out data if exist
      let checkDataExist = await CommonQA.findOne();
      if (checkDataExist) {
        await CommonQA.deleteMany();
        console.log("clear out commonQAs data");
      }

      // generate data
      let result = [];
      for (let i = 0; i < sizing; i++) {
        let item = await CommonQA.create({
          ...(randMode ? samples[pickRandom(samples.length)] : samples[i]),
        });
        result.push(item);
      }

      console.log("complete commonQAs data");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // User generator
  static async userSeeds(samples, scenario = "dev") {
    try {
      // clear out data if exist
      let checkDataExist = await User.findOne();
      if (checkDataExist) {
        await User.deleteMany();
        console.log("clear out users data");
      }
      // generate data
      let result = [];
      for (let user of samples) {
        let item;
        if (scenario === "dev") {
          item = await User.create(user);
        } else if (scenario === "restore") {
          let password = user.email.split("@")[0];
          item = await User.create({ ...user, password });
        }
        result.push(item);
      }

      console.log("complete users data");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // Post generator
  static async postSeeds(
    samples,
    sizing = samples.length,
    randMode = false,
    scenario = "dev"
  ) {
    try {
      // clearout data if exist
      let checkDataExist = await Post.findOne();
      if (checkDataExist) {
        await Post.deleteMany({});
        console.log("clearout posts data");
      }

      if (scenario === "restore") {
        console.log("complete posts data");
        return await Post.insertMany(samples);
      }

      // check reference data User, Category
      let checkUser;
      if (scenario === "dev") {
        checkUser = await User.findOne({ email: "owner@mail.com" });
      } else if (scenario === "demo") {
        checkUser = await User.find({ email: { $not: { $regex: /^admin*/ } } });
      }

      let checkCategories = await Category.find();
      if (!checkUser || !checkUser.length || !checkCategories.length) {
        throw new Error("category and user data are required");
      }

      // generate data
      let result = [];
      for (let i = 0; i < sizing; i++) {
        let dataStructure = {};
        if (scenario === "dev") {
          let postInfo = randMode
            ? samples[pickRandom(samples.length)]
            : samples[i];
          dataStructure = { ...postInfo };
          dataStructure.author = checkUser._id;
          dataStructure.category =
            checkCategories[pickRandom(checkCategories.length)];
        } else if (scenario === "demo") {
          const categoryName = samples[i].category;
          let categoryId = await Category.findOne({ categoryName });
          samples[i].category = categoryId._id;
          dataStructure = { ...samples[i] };
          let user = checkUser[pickRandom(checkUser.length)];
          dataStructure.author = user._id;
          dataStructure.imgUrls = [{ imgUrl: undefined }];
          dataStructure.tradingOptions = user.preferDealMethods;
        }

        let item = await Post.create(dataStructure);
        result.push(item);
      }
      console.log("complete posts data");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // Message generator
  static async messageSeeds(
    samples,
    replySamples,
    typeMode = "post",
    sizing = samples.length,
    randMode = false,
    scenario = "dev"
  ) {
    try {
      // clearout data if exist
      if (typeMode !== "post" && typeMode !== "deal") {
        throw new Error(
          "argument 'typeMode' can only be post (default) or deal"
        );
      }
      let query;
      if (typeMode === "post") {
        query = {
          $or: [{ messageType: "apply" }, { messageType: "question" }],
          presentDeal: { $exists: false },
        };
      }
      if (typeMode === "deal") {
        query = {
          messageType: "transaction",
        };
      }
      let checkDataExist =
        scenario === "dev"
          ? await Message.findOne(query)
          : await Message.findOne();

      if (checkDataExist) {
        if (scenario === "dev") {
          await Message.deleteMany(query);
        } else {
          await Message.deleteMany();
        }
        console.log("clearout messages data");
      }

      if (scenario === "restore") {
        for (let sample of samples) {
          await Message.create(sample);
        }
        console.log("complete message data");
        return samples;
      }

      // check reference data User, Post and Transaction
      let checkUsers = await User.find({
        $or: [{ email: "dealer@mail.com" }, { email: "owner@mail.com" }],
      });
      let checkRelation =
        typeMode === "post" ? await Post.find() : await Transaction.find();
      if (!checkUsers.length || !checkRelation.length) {
        throw new Error("post, transaction and user data are required");
      }

      let dealer, owner;
      checkUsers.forEach((user) => {
        if (user.email === "dealer@mail.com") {
          dealer = user._id;
        } else {
          owner = user._id;
        }
      });

      // generate data
      let result = [];
      for (let i = 0; i < sizing; i++) {
        let msgInfo = randMode
          ? samples[pickRandom(samples.length)]
          : samples[i];

        let dataStructure = { ...msgInfo };
        dataStructure.author = dealer;
        if (typeMode === "post") {
          let post = checkRelation[pickRandom(checkRelation.length)];
          dataStructure.post = post._id;
          if (msgInfo.messageType === "apply") {
            let providedOptions = post.tradingOptions.selectedMethods;
            let decidedMethod =
              providedOptions[pickRandom(providedOptions.length)];

            let dealMethod =
              decidedMethod === "面交"
                ? { faceToFace: post.tradingOptions.faceToFace }
                : {
                    convenientStore: decidedMethod,
                  };
            dataStructure.applyDealMethod = dealMethod;
          }
        } else if (typeMode === "deal") {
          let deal = checkRelation[pickRandom(checkRelation.length)];
          dataStructure.deal = deal._id;
        }

        let item = await Message.create({
          ...dataStructure,
        });

        if (item && pickRandom(4) % 2) {
          let replyInfo = replySamples[pickRandom(replySamples.length)];
          let relatedRef = { post: item.post, deal: item.deal };
          let reply = await Message.create({
            ...replyInfo,
            author: owner,
            relatedMsg: item._id,
            messageType: item.messageType,
            ...relatedRef,
          });
          result.push(reply);
        }
        result.push(item);
      }
      console.log("complete messages data");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // Transaction generator
  static async transactionSeeds(
    msgSamples,
    sizing = 1,
    randMode = false,
    scenario = "dev"
  ) {
    try {
      // clearout data if exist
      let checkDataExist = await Transaction.findOne();
      if (checkDataExist) {
        await Transaction.deleteMany({});
        await Message.deleteMany({ presentDeal: { $exists: true } });
        await Post.updateMany({ isDealLimit: true }, { isDealLimit: false });
        console.log(
          "reset post status, and clearout transaction with related message data"
        );
      }

      if (scenario === "restore") {
        return await Transaction.insertMany(samples);
      }

      // check reference data User, Post and Transaction
      let checkUsers = await User.find({
        $or: [{ email: "dealer@mail.com" }, { email: "owner@mail.com" }],
      }).select("+account");

      let checkPosts = await Post.find();
      if (!checkUsers.length || !checkPosts.length) {
        throw new Error("post and user data are required");
      }

      let dealer, owner, ownerAccount;
      checkUsers.forEach((user) => {
        if (user.email === "dealer@mail.com") {
          dealer = user._id;
        } else {
          owner = user._id;
          ownerAccount = user.account;
        }
      });

      // generate data
      let result = [];
      for (let i = 0; i < sizing; i++) {
        let manualPostsCopy = checkPosts.slice(0);
        let post = manualPostsCopy[pickRandom(manualPostsCopy.length)];

        let providedOptions = post.tradingOptions.selectedMethods;
        let decidedMethod = providedOptions[pickRandom(providedOptions.length)];

        let dealMethod =
          decidedMethod === "面交"
            ? { faceToFace: post.tradingOptions.faceToFace }
            : {
                convenientStore: decidedMethod,
              };

        let isFace = dealMethod.faceToFace ? true : false;
        let reservedAmount = 0;

        if ((await Transaction.countDocuments()) >= 1) {
          const checkOtherTransAmount = await Transaction.aggregate([
            { $match: { post: ObjectId(post._id) } },
            {
              $group: {
                _id: { post: "$post" },
                deals: { $push: "$_id" },
                everyAmount: { $push: "$amount" },
                reservedTransAmount: { $sum: "$amount" },
                includedTrans: { $sum: 1 },
              },
            },
          ]);
          if (checkOtherTransAmount.length) {
            reservedAmount = checkOtherTransAmount[0].reservedTransAmount;
          }
        }
        const trans = await Transaction.create({
          amount: pickRandom(post.quantity - reservedAmount, "qnt"),
          post: post._id,
          dealMethod,
          isFilled: isFace,
          isPaid: isFace,
          paymentInfo: isFace ? undefined : ownerAccount,
          dealer,
          owner,
        });

        if (trans) {
          if (
            post.quantity === reservedAmount + trans.amount ||
            post.quantity === trans.amount
          ) {
            manualPostsCopy.splice(manualPostsCopy.indexOf(post), 1);
            post.isDealLimit = true;
            await post.save();
          }

          // settled transaction with related apply messages
          await Message.create({
            ...msgSamples[pickRandom(msgSamples.length)],
            applyDealMethod: dealMethod,
            post: post._id,
            author: dealer,
            presentDeal: trans._id,
          });
        }

        result.push(trans);
      }

      console.log("complete transation data.");
      return result;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // saving point data json
  static async savingJson() {
    try {
      let posts = await Post.find().select("+imgUrls.deleteHash").lean();
      let categories = await Category.find().lean();
      let commonqas = await CommonQA.find().lean();
      let messages = await Message.find()
        .select("+isDeleted +presentDeal")
        .lean();
      let trans = await Transaction.find().lean();
      let users = await User.find()
        .select(
          "+avatarUrl.deleteHash +account +isAllowPost +isAllowMessage +accountAuthority"
        )
        .lean();
      let dataStructure = {
        posts,
        categories,
        commonqas,
        messages,
        trans,
        users,
      };
      let dictstring = JSON.stringify(dataStructure);
      fs.writeFile("saving.json", dictstring, function (err, result) {
        if (err) return { error: err.message };
      });
      return dataStructure;
    } catch (err) {
      console.error(err.message);
      return;
    }
  }

  // restore json data
  static async restore() {
    let getData = fs.readFileSync("saving.json", "utf8");

    let parsedData = JSON.parse(getData);
    try {
      let cleared = await SeedGenerators.clearOutData();
      if (cleared) {
        await SeedGenerators.commonQASeeds(parsedData.commonqas);
        await SeedGenerators.categorySeeds(parsedData.categories, "restore");
        await SeedGenerators.userSeeds(parsedData.users, "restore");
        await SeedGenerators.postSeeds(
          parsedData.posts,
          undefined,
          undefined,
          "restore"
        );
        await SeedGenerators.messageSeeds(
          parsedData.messages,
          undefined,
          undefined,
          undefined,
          undefined,
          "restore"
        );
        await Transaction.insertMany(parsedData.trans);
        console.log("complete transaction data");
      }
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  }
}
