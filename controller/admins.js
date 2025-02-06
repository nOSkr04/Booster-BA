import asyncHandler from "../middleware/asyncHandle.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import MyError from "../utils/myError.js";

export const lessonPaymentSuccess = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  const user = await User.findById(id);

  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }
  try {
    user.isPayment = true;
    user.save();
    res.status(200).json(user);
  } catch (err) {
    throw new MyError("Серверийн алдаа", 500);
  }
});

export const bookPaymentSuccess = asyncHandler(async (req, res) => {
  const { id, bookCount } = req.body;
  const user = await User.findById(id);
  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }
  try {
    user.bookPaymentDate = new Date();
    user.bookBoughtCount = bookCount;
    user.isBoughtBook = true;
    user.save();
    res.status(200).json(user);
  } catch (err) {
    throw new MyError("Серверийн алдаа", 500);
  }
});

export const payedDashboard = asyncHandler(async (req, res) => {
  try {
    const today = new Date();

    // Define date ranges
    const lastWeekStart = new Date();
    lastWeekStart.setDate(today.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date();
    prevWeekStart.setDate(today.getDate() - 14);
    prevWeekStart.setHours(0, 0, 0, 0);

    const prevWeekEnd = new Date();
    prevWeekEnd.setDate(today.getDate() - 7);
    prevWeekEnd.setHours(23, 59, 59, 999);

    const usersByDay = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: prevWeekStart }, // Get users from last 14 days
        },
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // Convert createdAt to weekday (1=Sunday, 7=Saturday)
          weekType: {
            $cond: {
              if: { $gte: ["$createdAt", lastWeekStart] },
              then: "lastWeek",
              else: "prevWeek",
            },
          },
        },
      },
      {
        $group: {
          _id: { weekType: "$weekType", dayOfWeek: "$dayOfWeek" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.weekType": 1, "_id.dayOfWeek": 1 },
      },
    ]);

    // Map MongoDB's $dayOfWeek numbers to actual day names
    const dayMapping = {
      1: "Бүтэнсайн",
      2: "Даваа",
      3: "Мягмар",
      4: "Лхагва",
      5: "Пүрэв",
      6: "Баасан",
      7: "Хагассайн",
    };

    // Initialize result with all days set to 0
    const defaultWeekStats = () =>
      Object.values(dayMapping).reduce((acc, day) => {
        acc[day] = 0;
        return acc;
      }, {});

    const result = {
      lastWeek: defaultWeekStats(),
      prevWeek: defaultWeekStats(),
    };

    // Fill in actual counts from MongoDB
    usersByDay.forEach((day) => {
      const weekType = day._id.weekType;
      const dayName = dayMapping[day._id.dayOfWeek];
      result[weekType][dayName] = day.count;
    });

    const lessonUserCount = await User.countDocuments({ isPayment: true });
    const bookUserCount = await User.countDocuments({ isBoughtBook: true });
    const allUserCount = await User.countDocuments({
      isBoughtBook: true,
      isPayment: true,
    });

    res
      .status(200)
      .json({
        lessonUserCount,
        bookUserCount,
        allUserCount,
        result,
      })
      .end();
  } catch (err) {
    console.log(err);
    throw new MyError("Серверийн алдаа", 500);
  }
});
