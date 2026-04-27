import { model, Schema, type Types } from "mongoose";

export type HeroImage = {
  title: string;
  imageUrl: string;
  imagePublicId: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
  createdBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const heroImageSchema = new Schema<HeroImage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 180,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const HeroImageModel = model<HeroImage>("HeroImage", heroImageSchema);
