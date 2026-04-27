import { model, Schema } from "mongoose";

export type AdminRole = "admin";

export type Admin = {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const adminSchema = new Schema<Admin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 20,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      unique: true,
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

adminSchema.set("toJSON", {
  transform: (_document, returnedObject: Record<string, unknown>) => {
    delete returnedObject.passwordHash;
    return returnedObject;
  },
});

export const AdminModel = model<Admin>("Admin", adminSchema);
