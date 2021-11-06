import bcrypt from "bcrypt";
import db from "../../config/mongoose.js";
import User from "../user.js";

// seeder data (with password bcrypt)
const users = [
  {
    email: "owner@mail.com",
    name: "owner",
    password: "owner",
  },
  {
    email: "dealer@mail.com",
    name: "dealer",
    password: "dealer",
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

  //generate 3 dummy users
  Array.from({ length: 3 }, async (_, i) => {
    try {
      const { name, email, password, accountAuthority = "" } = users[i];

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
      if ((await User.countDocuments()) === 3) {
        console.log("user seeder completed.");
        process.exit();
      }
    } catch (err) {
      (err) => console.error(err);
    }
  });
});
