import { FilterQuery, Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import AIResponse from "@/models/AIResponse";
import Doubt from "@/models/Doubt";
import Feedback from "@/models/Feedback";
import User from "@/models/User";
import type {
  CreateDoubtInput,
  FeedbackInput,
  ListDoubtsFilters,
  UpdateDoubtInput,
} from "@/types";

export async function createDoubt(input: CreateDoubtInput) {
  await connectToDatabase();

  if (!input.title?.trim() || !input.description?.trim()) {
    throw new Error("Title and description are required.");
  }

  if (!Types.ObjectId.isValid(input.userId)) {
    throw new Error("Valid userId is required.");
  }

  const user = await User.findById(input.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const doubt = await Doubt.create({
    userId: user._id,
    title: input.title.trim(),
    description: input.description.trim(),
    status: "open",
  });

  return await getDoubtById(doubt._id.toString());
}

export async function listDoubts(filters: ListDoubtsFilters = {}) {
  await connectToDatabase();

  const query: FilterQuery<{ status?: string; userId?: Types.ObjectId }> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userEmail) {
    const user = await User.findOne({ email: filters.userEmail.toLowerCase() });
    query.userId = user?._id ?? new Types.ObjectId();
  }

  if (filters.userId) {
    if (!Types.ObjectId.isValid(filters.userId)) {
      throw new Error("Invalid user id.");
    }

    query.userId = new Types.ObjectId(filters.userId);
  }

  const doubts = await Doubt.find(query).sort({ createdAt: -1 }).lean();
  const responses = await AIResponse.find({
    doubtId: { $in: doubts.map((doubt) => doubt._id) },
  }).lean();

  const responseMap = new Map(
    responses.map((response) => [response.doubtId.toString(), response]),
  );

  return doubts.map((doubt) => ({
    ...serializeDocument(doubt),
    aiResponse: responseMap.has(doubt._id.toString())
      ? serializeDocument(responseMap.get(doubt._id.toString())!)
      : null,
  }));
}

export async function getDoubtById(id: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doubt id.");
  }

  const doubt = await Doubt.findById(id).lean();

  if (!doubt) {
    return null;
  }

  const aiResponse = await AIResponse.findOne({ doubtId: doubt._id }).lean();
  const feedback = await Feedback.find({ doubtId: doubt._id })
    .sort({ createdAt: -1 })
    .lean();

  return {
    ...serializeDocument(doubt),
    aiResponse: aiResponse ? serializeDocument(aiResponse) : null,
    feedback: feedback.map((item) => serializeDocument(item)),
  };
}

export async function canAccessDoubt(doubtId: string, userId: string, role: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(doubtId) || !Types.ObjectId.isValid(userId)) {
    return false;
  }

  if (role === "mentor") {
    return true;
  }

  const doubt = await Doubt.findOne({
    _id: doubtId,
    userId: new Types.ObjectId(userId),
  }).lean();

  return Boolean(doubt);
}

export async function updateDoubtById(id: string, input: UpdateDoubtInput) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doubt id.");
  }

  const doubt = await Doubt.findByIdAndUpdate(
    id,
    {
      ...(input.title ? { title: input.title.trim() } : {}),
      ...(input.description ? { description: input.description.trim() } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
    { new: true },
  ).lean();

  return doubt ? getDoubtById(doubt._id.toString()) : null;
}

export async function deleteDoubtById(id: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid doubt id.");
  }

  const deleted = await Doubt.findByIdAndDelete(id).lean();
  if (deleted) {
    await Promise.all([
      AIResponse.deleteOne({ doubtId: deleted._id }),
      Feedback.deleteMany({ doubtId: deleted._id }),
    ]);
  }

  return deleted;
}

export async function submitFeedback(input: FeedbackInput) {
  await connectToDatabase();

  if (!input.doubtId || typeof input.isHelpful !== "boolean") {
    throw new Error("doubtId and isHelpful are required.");
  }

  if (!Types.ObjectId.isValid(input.doubtId)) {
    throw new Error("Invalid doubt id.");
  }

  const doubt = await Doubt.findById(input.doubtId);
  if (!doubt) {
    throw new Error("Doubt not found.");
  }

  const feedback = await Feedback.create({
    doubtId: doubt._id,
    isHelpful: input.isHelpful,
    comment: input.comment?.trim(),
  });

  return serializeDocument(feedback.toObject());
}

export async function escalateDoubt(doubtId: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(doubtId)) {
    throw new Error("Invalid doubt id.");
  }

  const doubt = await Doubt.findByIdAndUpdate(
    doubtId,
    { status: "escalated" },
    { new: true },
  ).lean();

  if (!doubt) {
    throw new Error("Doubt not found.");
  }

  return getDoubtById(doubt._id.toString());
}

function serializeDocument<T extends { _id?: unknown; createdAt?: unknown; updatedAt?: unknown }>(
  document: T,
) {
  const typedDocument = document as T & {
    userId?: unknown;
    doubtId?: unknown;
  };

  return {
    ...document,
    _id: document._id?.toString?.() ?? document._id,
    userId: typedDocument.userId?.toString?.() ?? typedDocument.userId,
    doubtId: typedDocument.doubtId?.toString?.() ?? typedDocument.doubtId,
    createdAt:
      document.createdAt instanceof Date
        ? document.createdAt.toISOString()
        : document.createdAt,
    updatedAt:
      document.updatedAt instanceof Date
        ? document.updatedAt.toISOString()
        : document.updatedAt,
  };
}
