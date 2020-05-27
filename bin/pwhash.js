import argon2 from "argon2";
import process from "process";

var args = process.argv.slice(2);
argon2.hash(args[0]).then(console.log);
