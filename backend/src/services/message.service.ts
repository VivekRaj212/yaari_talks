import { createGoogleGenerativeAI } from "@ai-sdk/google";
import mongoose, { model } from "mongoose";
import cloudinary from "../config/cloudinary.config";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  emitChatAI,
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket";
import UserModel from "../models/user.model";
import { Env } from "../config/env.config";
import { create } from "domain";
import { ModelMessage, streamText } from "ai";
import { file } from "zod/v4";
import { text } from "stream/consumers";
import { emit } from "process";

const google = createGoogleGenerativeAI({
  apiKey: Env.GOOGLE_GENERATIVE_API_KEY,
});

export const sendMessageService = async (
  userId: string,
  body: {
    chatId: string;
    content?: string;
    image?: string;
    replyToId?: string;
  }
) => {
  const { chatId, content, image, replyToId } = body;

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });
  if (!chat) throw new BadRequestException("Chat not found or unauthorized");

  if (replyToId) {
    const replyMessage = await MessageModel.findOne({
      _id: replyToId,
      chatId,
    });
    if (!replyMessage) throw new NotFoundException("Reply message not found");
  }

  let imageUrl;

  if (image) {
    //upload the image to cloudinary
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }

  const newMessage = await MessageModel.create({
    chatId,
    sender: userId,
    content,
    image: imageUrl,
    replyTo: replyToId || null,
  });

  await newMessage.populate([
    { path: "sender", select: "name avatar" },
    {
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    },
  ]);

  chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  //websocket emit the new Message to the chat room
  emitNewMessageToChatRoom(userId, chatId, newMessage);

  //websocket emit the lastmessage to members (personnal room user)
  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastMessageToParticipants(allParticipantIds, chatId, newMessage);

  let aiResponse: any = null;
  if (chat.isAiChat) {
    aiResponse = await getAIResponse(chatId, userId);
    if (aiResponse) {
      chat.lastMessage = aiResponse._id as mongoose.Types.ObjectId;
      await chat.save();
    }
  }

  return {
    userMessage: newMessage,
    aiResponse,
    chat,
    // isAiChat: chat.isAiChat,
  };
};

async function getAIResponse(chatId: string, userId: string) {
  const whopAI = await UserModel.findOne({ isAI: true });
  if (!whopAI) throw new NotFoundException("AI user not found");
  const chatHistory = await getChatHistory(chatId);
  const formattedMessages: ModelMessage[] = chatHistory.map((msg: any) => {
    const role = msg.sender.isAI ? "assistant" : "user";
    const parts: any[] = [];

    if (msg.image) {
      parts.push({
        type: "file",
        data: msg.image,
        mediaType: "image/png",
        fileName: "image.png",
      });
      if (!msg.content) {
        parts.push({
          type: "text",
          text: "Describe what you see in the image",
        });
      }
    }

    if (msg.content) {
      parts.push({
        type: "text",
        text: msg.replyTo
          ? `[Replying to: "${msg.replyTo.content}"]\n${msg.content}`
          : msg.content,
      });
    }

    return { role, content: parts };
  });

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    messages: formattedMessages,
    system:
      "You are WhopAI, an AI assistant integrated into a real-time messaging platform. Provide helpful, concise, and relevant responses based on the user's messages. If the user shares an image, describe its content accurately. Always maintain a friendly and professional tone.",
  });

  let fullResponse = "";
  for await (const chunk of result.textStream) {
    emitChatAI({
      chatId,
      chunk,
      sender: whopAI,
      done: false,
      message: null,
    });
    fullResponse += chunk;
  }
  if (!fullResponse.trim()) return "";

  const aiMessage = await MessageModel.create({
    chatId,
    sender: whopAI._id,
    content: fullResponse,
  });
  await aiMessage.populate("sender", "name avatar isAI");

  // emit ai full response message
  emitChatAI({
    chatId,
    chunk: null,
    sender: whopAI,
    done: true,
    message: aiMessage
  })
  emitLastMessageToParticipants(
    [userId],
    chatId,
    aiMessage
  );
  return aiMessage;
}

async function getChatHistory(chatId: string) {
  const messages = await MessageModel.find({ chatId })
    .populate("replyTo", "content")
    .populate("sender", "isAI")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return messages.reverse();
}
