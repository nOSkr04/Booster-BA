import asyncHandler from "express-async-handler";
import Voucher from "../models/Voucher.js";
import { v4 as uuidv4 } from "uuid";
// createVoucher
export const createVoucher = asyncHandler(async (req, res, next) => {
  const { length } = req.body;

  const vouchers = Array.from({ length }, () => ({
    code: uuidv4().substr(0, 8),
  }));

  const inserted = await Voucher.insertMany(vouchers);

  res.status(200).json({
    success: true,
    inserted,
  });
});

export const getVouchers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Voucher);

  const vouchers = await Voucher.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).json({
    success: true,
    data: vouchers,
    pagination,
    total: pagination.total,
    pageCount: pagination.pageCount,
  });
});
