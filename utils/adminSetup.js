// // server/utils/adminSetup.js
// const bcrypt = require("bcrypt");

// module.exports.ensureAdminHash = async function () {
//   try {
//     if (process.env.ADMIN_HASH) return;
//     const pw = process.env.ADMIN_PASSWORD;
//     if (!pw) {
//       console.warn("ADMIN_PASSWORD not set in .env — admin login disabled until set.");
//       return;
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(pw, salt);
//     process.env.ADMIN_HASH = hash;
//     console.log("Admin hash prepared.");
//   } catch (err) {
//     console.error("Error preparing admin hash:", err);
//   }
// };


// utils/adminSetup.js
const bcrypt = require("bcrypt");
const Admin = require("./../models/admin");

const ensureAdminHash = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set in env.");
      return;
    }

    let admin = await Admin.findOne({ email });

    if (!admin) {
      const passwordHash = await bcrypt.hash(password, 10);
      admin = await Admin.create({ email, passwordHash });
      console.log("✅ Admin user created:", email);
    } else {
      console.log("ℹ Admin user already exists:", email);
    }
  } catch (err) {
    console.error("Error ensuring admin hash:", err.message);
  }
};

module.exports = { ensureAdminHash };
