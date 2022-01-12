import db from "../../config/mongoose.js";
import User from "../user.js";

// seeder data (with password bcrypt)
const seedUsers = [
  {
    email: "owner@mail.com",
    nickname: "owner",
    password: "owner",
  },
  {
    email: "dealer@mail.com",
    nickname: "dealer",
    password: "dealer",
  },
  {
    email: "admin@mail.com",
    nickname: "admin123",
    password: "admin123",
    accountAuthority: "admin",
  },
  {
    email: "mango@mail.com",
    nickname: "mango",
    password: "mango",
  },
  {
    email: "banana@mail.com",
    nickname: "banana",
    password: "banana",
  },
  {
    email: "tomato@mail.com",
    nickname: "tomato123",
    password: "tomato123",
  },
];

const preferMethods = [
  {
    selectedMethods: ["7-11", "面交"],
    faceToFace: {
      region: "新北市",
      district: "新莊區",
    },
  },

  {
    selectedMethods: ["7-11", "全家"],
  },

  {
    selectedMethods: ["面交"],
    faceToFace: {
      region: "南投縣",
      district: "埔里鎮",
    },
  },
  {
    selectedMethods: ["全家", "面交"],
    faceToFace: {
      region: "臺南市",
      district: "善化區",
    },
  },

  {
    selectedMethods: ["全家"],
  },
  {
    selectedMethods: ["面交"],
    faceToFace: {
      region: "基隆市",
      district: "安樂區",
    },
  },
];

function pickRandom(num) {
  return Math.floor(Math.random() * num);
}

db.once("open", async () => {
  console.log("generating seed data for user.");

  // clearout users collection data if exist
  const dataExist = await User.findOne();
  if (dataExist) {
    await User.deleteMany({});
    console.log("clearout origin document data.");
  }

  //generate 6 dummy users
  Array.from({ length: 6 }, async (_, i) => {
    const { nickname, email, password, accountAuthority } = seedUsers[i];

    const dataStructure = {
      nickname,
      email,
      password,
      accountAuthority,
      avatarUrl: {
        imgUrl:
          "https://images.unsplash.com/photo-1558276561-95e31d860c4b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
      },
    };

    if (nickname !== "tomato" && nickname !== "admin") {
      dataStructure.preferDealMethods =
        preferMethods[pickRandom(preferMethods.length)];
    }

    try {
      await User.create({ ...dataStructure });

      if ((await User.countDocuments()) === 6) {
        console.log("user seeder completed.");
        process.exit(1);
      }
    } catch (err) {
      console.error(err.message);
    }
  });
});
