import { z } from "zod";
export const JWT_PASSWORD= "password1234";

export const objectIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "Invalid ObjectId format"
);