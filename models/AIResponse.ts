import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const sourceSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    embeddingId: { type: String, required: true },
    score: { type: Number, required: true },
    url: { type: String },
    type: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    videoId: { type: String },
    channelName: { type: String },
    thumbnailUrl: { type: String },
  },
  { _id: false },
);

const aiResponseSchema = new Schema(
  {
    doubtId: {
      type: Schema.Types.ObjectId,
      ref: "Doubt",
      required: true,
      unique: true,
      index: true,
    },
    answer: {
      type: String,
      required: true,
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    recommendedResources: {
      type: [sourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type AIResponseDocument = InferSchemaType<typeof aiResponseSchema> & {
  _id: string;
};

// Force schema reload in Next.js development
if (models.AIResponse) {
  delete models.AIResponse;
}

const AIResponse = model<AIResponseDocument>("AIResponse", aiResponseSchema);

export default AIResponse;
