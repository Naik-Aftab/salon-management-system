import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { getEnv } from "./env";

type JwtPayload = Record<string, unknown>;

const signToken = (
  payload: JwtPayload,
  secretKey: string,
  expiresIn: string
): string => {
  const secret: Secret = secretKey;
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
};

export const generateAuthToken = (payload: JwtPayload): string =>
  signToken(payload, getEnv("JWT_SECRET"), getEnv("JWT_EXPIRES_IN", "1d"));

export const generateResetToken = (payload: JwtPayload): string =>
  signToken(
    payload,
    getEnv("JWT_RESET_SECRET", getEnv("JWT_SECRET")),
    getEnv("JWT_RESET_EXPIRES_IN", "15m")
  );

export const verifyResetToken = (token: string): JwtPayload =>
  jwt.verify(
    token,
    getEnv("JWT_RESET_SECRET", getEnv("JWT_SECRET"))
  ) as JwtPayload;
