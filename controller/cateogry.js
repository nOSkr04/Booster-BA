import Category from "../models/Category.js";
import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// api/v1/categorys
export const getCategorys = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Category);

  const categorys = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate({
      model: "Video",
      path: "video",
    });
  const watchCategorys = categorys.map((category) => ({
    ...category.toObject(),
    isSeen: user.watched.includes(category._id),
  }));

  console.log(watchCategorys, "aa");

  // const userLikes = await Like.find({
  //   createUser: req.query.userId,
  // });
  // const userMap = userLikes.map((res) => `${res.post}`);

  // const postWithIsLiked = posts.map((post) => ({
  //   ...post.toObject(),
  //   isLiked: userMap.includes(post._id.toString()),
  // }));

  res.status(200).json({
    success: true,
    count: categorys.length,
    data: categorys,
    pagination,
  });
});

export const getCategory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  user.watched = [...user.watched, category._id];
  category.seen += 1;
  user.save();
  category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (
    category.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
    whoDeleted: user.name,
  });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  for (let attr in req.body) {
    category[attr] = req.body[attr];
  }

  category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});
