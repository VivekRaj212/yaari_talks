// AI Features Source code link =>
import "dotenv/config";
import UserModel from "../models/user.model";
import connectDatabase from "../config/database.config";

export const createwhopAI = async () => {
  let existingAI = await UserModel.findOne({ isAI: true });
  if (existingAI) {
    await UserModel.deleteOne({ _id: existingAI._id });
  }
  const whopAI = await UserModel.create({
    name: "Wisdom AI",
    isAI: true,
    avatar:
      "https://res.cloudinary.com/yaari-chats/image/upload/v1766761473/AI_logo_ycl85q.png",
  });
  console.log("Wisdom AI created:", whopAI._id);
  return whopAI;
};

const seedWhoopAI = async () => {
  try {
    await connectDatabase();
    await createwhopAI();
    console.log("Seeding completed");
    process.exit(0);
  } catch (error) {
    console.log("Seeding failed:", error);
    process.exit(1);
  }
};
seedWhoopAI();
