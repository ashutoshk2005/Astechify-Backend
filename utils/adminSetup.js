// server/utils/adminSetup.js
const bcrypt = require("bcrypt");

module.exports.ensureAdminHash = async function () {
  try {
    if (process.env.ADMIN_HASH) return;
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw) {
      console.warn("ADMIN_PASSWORD not set in .env — admin login disabled until set.");
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pw, salt);
    process.env.ADMIN_HASH = hash;
    console.log("Admin hash prepared.");
  } catch (err) {
    console.error("Error preparing admin hash:", err);
  }
};
