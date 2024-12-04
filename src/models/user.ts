import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { IUser } from "../types/user";

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Unique identifier for the task',
    default: () => randomUUID()
  },
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
    maxlength: 100,
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>("User", userSchema);

export default User;