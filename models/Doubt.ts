import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const doubtSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "escalated"],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type DoubtDocument = InferSchemaType<typeof doubtSchema> & {
  _id: string;
};

const Doubt =
  (models.Doubt as Model<DoubtDocument>) || model("Doubt", doubtSchema);

export default Doubt;
