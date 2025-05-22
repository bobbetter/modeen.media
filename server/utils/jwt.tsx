import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const BASE_APP_URL = "https://modeenmedia-dustinhamerla.replit.app"

export interface ProductTokenPayload {
  product_id: number;
  download_link_id: number;
  iat?: number;
  exp?: number;
}

export function create_jwt_token(
  product_id: number,
  download_link_id: number,
  expire_after_seconds: number = 3600, // default to 1 hour
): string {
  const payload = { 'product_id': product_id, 'download_link_id': download_link_id };
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: expire_after_seconds,
  });
  return token;
}

export function decode_jwt_token(token: string): ProductTokenPayload {
  const decoded = jwt.verify(token, SECRET_KEY) as ProductTokenPayload;
  return decoded;
}


export function make_download_url(token: string): string {
  return `${BASE_APP_URL}/api/download?token=${token}`;
}