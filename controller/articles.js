import Article from "../models/Article.js";
import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// api/v1/articles
export const getArticles = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Article);

  const articles = await Article.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate({
      model: "Video",
      path: "video",
    });
  const watchArticles = articles.map((article) => ({
    ...article.toObject(),
    isSeen: user.watched.includes(article._id),
  }));

  console.log(watchArticles, "aa");

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
    count: articles.length,
    data: articles,
    pagination,
  });
});

export const getArticle = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  user.watched = [...user.watched, article._id];
  article.seen += 1;
  user.save();
  article.save();

  res.status(200).json({
    success: true,
    data: article,
  });
});

export const createArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.create(req.body);

  res.status(200).json({
    success: true,
    data: article,
  });
});

export const deleteArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (
    article.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  article.remove();

  res.status(200).json({
    success: true,
    data: article,
    whoDeleted: user.name,
  });
});

export const updateArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

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
