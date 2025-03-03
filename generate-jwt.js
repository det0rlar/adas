import jwt from "jsonwebtoken";
import fs from "fs";

const privateKey = fs.readFileSync("Key 2_5_2025, 10_35_21 AM.pk", "utf8");

const payload = {
  aud: "jitsi",
  iss: "vpaas-magic-cookie-09233160e96b4dd78c97a173de155ea0",  // Replace with your JaaS API Key ID
  sub: "8x8.vc",
  room: "*",
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1-hour expiration
};

const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

console.log("Your JWT Token:", token);
