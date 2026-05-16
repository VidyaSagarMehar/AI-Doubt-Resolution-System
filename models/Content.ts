import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const contentChunkSchema = new Schema({
  text: { type: String, required: true },
  topic: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  chunkIndex: { type: Number, required: true },
  embeddingId: { type: String, required: true },
});

const contentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    rawContent: {
      type: String,
      required: true,
    },
    chunks: {
      type: [contentChunkSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "video", "article", "documentation", "pdf_notes", "playlist", "course"],
      default: "text",
    },
  },
  {
    timestamps: true,
  },
);

export type ContentDocument = InferSchemaType<typeof contentSchema> & {
  _id: string;
};

const Content =
  (models.Content as Model<ContentDocument>) || model("Content", contentSchema);

export default Content;
