/// <reference types="express" />

import type { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}