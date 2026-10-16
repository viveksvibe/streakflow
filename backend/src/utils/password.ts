import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
