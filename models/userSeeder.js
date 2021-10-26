import bcrypt from "bcrypt";
import db from "../config/mongoose.js";
import user from "./user.js";
import User from "./user.js";

// seeder data (with password bcrypt)
const users = [
  {
    email: "dummy@mail.com",
    name: "dummyExample",
    password: "dummy",
  },
  {
    email: "admin@mail.com",
    name: "admin",
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

  //generate 2 dummy data, one user one admin
  Array.from({ length: 2 }, async (_, i) => {
    try {
      let name, email, password, accountAuthority;
      if (Object.keys(users[i]).length === 3) {
        name = users[i].name;
        email = users[i].email;
        password = users[i].password;
      } else {
        name = users[i].name;
        email = users[i].email;
        password = users[i].password;
        accountAuthority = users[i].accountAuthority;
      }
      const hashed = await bcrypt.hash(password, 10);
      if (accountAuthority) {
        await User.create({
          name,
          email,
          password: hashed,
          accountAuthority,
        });
      } else {
        await User.create({
          name,
          email,
          password: hashed,
        });
      }

      if (i === 1) {
        console.log("seeder completed.");
        process.exit();
      }
    } catch (err) {
      (err) => console.error(err);
    }
  });
});
