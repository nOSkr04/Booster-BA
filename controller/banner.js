import Banner from "../models/Banner.js";
import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
// api/v1/articles
export const getBanners = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Banner);

  const articles = await Banner.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate("image");
  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles,
    pagination,
  });
});

export const getBanner = asyncHandler(async (req, res, next) => {
  const article = await Banner.findById(req.params.id);

  if (!article) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  article.seen += 1;
  article.save();

  res.status(200).json({
    success: true,
    data: article,
  });
});

export const createBanner = asyncHandler(async (req, res, next) => {
  const article = await Banner.create(req.body);

  res.status(200).json({
    success: true,
    data: article,
  });
});

export const deleteBanner = asyncHandler(async (req, res, next) => {
  const article = await Banner.findById(req.params.id);

  if (!article) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  const user = await User.findById(req.userId);

  article.remove();

  res.status(200).json({
    success: true,
    data: article,
    whoDeleted: user.name,
  });
});

export const updateBanner = asyncHandler(async (req, res, next) => {
  const article = await Banner.findById(req.params.id);

  if (!article) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  for (let attr in req.body) {
    article[attr] = req.body[attr];
  }

  article.save();

  res.status(200).json({
    success: true,
    data: article,
  });
});
