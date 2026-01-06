// import { UserDocument } from "../models/user.model";

// declare global {
//   namespace Express {
//     interface User extends UserDocument {
//       _id?: any;
//     }
//   }
// }

declare namespace Express {
  interface Request {
    user?: import("../models/user.model").UserDocument;
  }
}
