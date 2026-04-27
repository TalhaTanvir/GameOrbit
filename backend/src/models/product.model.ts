import { model, Schema, type Types } from "mongoose";

export type ProductImage = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
};

export type Product = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imagePublicId: string;
  images: ProductImage[];
  category: string;
  stockQuantity: number;
  isActive: boolean;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const productImageSchema = new Schema<ProductImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    format: {
      type: String,
      default: null,
    },
    bytes: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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
    images: {
      type: [productImageSchema],
      required: true,
      validate: {
        validator: (value: ProductImage[]) => Array.isArray(value) && value.length > 0,
        message: "At least one product image is required",
      },
    },
    category: {
      type: String,
      trim: true,
      default: "CDS",
      required: true,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    updatedBy: {
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

export const ProductModel = model<Product>("Product", productSchema);
