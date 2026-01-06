import { UserDocument } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
    
    interface User extends UserDocument {
      _id?: any;
    }
  }
}

export {};