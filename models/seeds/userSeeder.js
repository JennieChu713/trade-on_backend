<<<<<<< HEAD:models/seeds/userSeeder.js
import bcrypt from "bcrypt";
import db from "../../config/mongoose.js";
import User from "../user.js";
=======
import db from "../config/mongoose.js";
import User from "./user.js";
import bcrypt from "bcrypt";
>>>>>>> user:models/userSeeder.js

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
<<<<<<< HEAD:models/seeds/userSeeder.js
      const { name, email, password, accountAuthority = "" } = users[i];
=======
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
>>>>>>> user:models/userSeeder.js

      const hashed = await bcrypt.hash(password, 10);

      if (accountAuthority) {
        await User.create({
          nickname,
          email,
          password: hashed,
          accountAuthority,
        });
      } else {
        await User.create({
          nickname,
          email,
          password: hashed,
        });
      }
<<<<<<< HEAD:models/seeds/userSeeder.js
      if ((await User.countDocuments()) === 3) {
        console.log("user seeder completed.");
        process.exit();
=======

      if (i === 2) {
        console.log("seeder completed.");
        process.exit(1);
>>>>>>> user:models/userSeeder.js
      }
    } catch (err) {
      (err) => console.error(err.message);
    }
  });
});
