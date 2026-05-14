import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const feedbackSchema = new Schema(
  {
    doubtId: {
      type: Schema.Types.ObjectId,
      ref: "Doubt",
      required: true,
      index: true,
    },
    isHelpful: {
      type: Boolean,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type FeedbackDocument = InferSchemaType<typeof feedbackSchema> & {
  _id: string;
};

const Feedback =
  (models.Feedback as Model<FeedbackDocument>) ||
  model("Feedback", feedbackSchema);

export default Feedback;
