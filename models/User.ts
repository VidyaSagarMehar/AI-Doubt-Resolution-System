import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: string;
};

const User = (models.User as Model<UserDocument>) || model("User", userSchema);

export default User;
