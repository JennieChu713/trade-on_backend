<<<<<<< HEAD:models/seeds/userSeeder.js
=======
import db from "../../config/mongoose.js";
import User from "../user.js";
>>>>>>> user:models/userSeeder.js
import bcrypt from "bcrypt";
import db from "../../config/mongoose.js";
import User from "../user.js";

// seeder data (with password bcrypt)
const users = [
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
    nickname: "admin",
    password: "admin",
    accountAuthority: "admin",
  },
];

db.once("open", async () => {
  console.log("generating seed data for user.");

  // clearout users collection data if exist
  const dataExist = await User.find();
  if (dataExist.length) {
    await User.deleteMany({});
    console.log("clearout origin document data.");
  }

  //generate 3 dummy users
  Array.from({ length: 3 }, async (_, i) => {
    try {
      let nickname, email, password, accountAuthority;
      if (Object.keys(users[i]).length === 3) {
        nickname = users[i].nickname;
        email = users[i].email;
        password = users[i].password;
      } else {
        nickname = users[i].nickname;
        email = users[i].email;
        password = users[i].password;
        accountAuthority = users[i].accountAuthority;
      }

      const avatarUrl =
        "https://images.unsplash.com/photo-1558276561-95e31d860c4b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80";

      if (accountAuthority) {
        await User.create({
          nickname,
          email,
          password,
          accountAuthority,
          avatarUrl,
        });
      } else {
        await User.create({
          nickname,
          email,
          password,
          avatarUrl,
        });
      }
      if ((await User.countDocuments()) === 3) {
        console.log("user seeder completed.");
        process.exit(1);
      }
    } catch (err) {
      (err) => console.error(err.message);
    }
  });
});
