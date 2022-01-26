import db from "../../config/mongoose.js";
import SeedGenerators from "../../utils/seedsGenerator.js";

const { userSeeds } = SeedGenerators;

// seeder data (with password bcrypt)
const seedUsers = [
  {
    email: "owner@mail.com",
    nickname: "owner",
    password: "owner",
    account: {
      bankCode: "333",
      accountNum: "123456789011",
    },
  },
  {
    email: "dealer@mail.com",
    nickname: "dealer",
    password: "dealer",
  },
  {
    email: "admin@mail.com",
    nickname: "admin",
    password: "admin",
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
    nickname: "tomato",
    password: "tomato",
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

let userSamples = [];
for (let user of seedUsers) {
  let dataStructure = {
    ...user,
  };

  if (user.nickname !== "tomato" && user.nickname !== "admin") {
    dataStructure.preferDealMethods =
      preferMethods[pickRandom(preferMethods.length)];
  }
  userSamples.push(dataStructure);
}

db.once("open", async () => {
  console.log("generating seed data for user.");

  let complete = await userSeeds(userSamples);

  if (complete.length) {
    process.exit(1);
  }
});
