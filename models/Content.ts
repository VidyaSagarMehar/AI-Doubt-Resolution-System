import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const contentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    embeddingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
