import Wallet from "../models/Wallet.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";

export const getWallets = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Wallet);

  const wallets = await Wallet.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({ success: true, data: wallets, pagination });
});

export const getWallet = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.findById(req.params.id);

  if (!wallet) {
    throw new MyError(req.params.id + " ID-тай ажил байхгүй.", 400);
  }

  // wallet.name += "-"
  // wallet.save(function (err) {
  // if (err) console.log("error: ", err)
  // console.log("saved...")
  // })
  res.status(200).json({ success: true, data: wallet });
});

export const getCvWallets = asyncHandler(async (req, res, next) => {
  req.query.wallet = req.params.cvId;
  return this.getWallets(req, res, next);
});

export const createWallet = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  req.body.apply = req.params.id;
  const wallet = await Wallet.create(req.body);

  res.status(200).json({ success: true, data: wallet });
});

export const updateWallet = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!wallet) {
    return res
      .status(400)
      .json({ success: false, error: req.params.id + " ID-тай ажил байхгүй." });
  }
  res.status(200).json({ success: true, data: wallet });
});

export const deleteWallet = asyncHandler(async (req, res, next) => {
  const wallet = await Wallet.findById(req.params.id);

  if (!wallet) {
    return res
      .status(400)
      .json({ success: false, error: req.params.id + " ID-тай ажил байхгүй." });
  }
  wallet.remove();
  res.status(200).json({ success: true, data: wallet });
});
