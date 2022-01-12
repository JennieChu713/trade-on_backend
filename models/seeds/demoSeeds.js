import db from "../../config/mongoose.js";
import Category from "../category.js";
import User from "../user.js";

const categories = [
  "配件飾品",
  "3C電器",
  "美妝香氛",
  "衣飾配件",
  "居家雜貨",
  "辦公文具",
  "寵物用品",
  "親子育幼",
  "運動器材",
  "其他", // 同 "未分類"
];

const users = [
  {
    email: "evergreen111@example.com",
    password: "evergreen111",
    nickname: "不能再綠惹",
    avatarUrl: {
      imgUrl:
        "https://images.unsplash.com/photo-1554311884-415bfda22b47?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
    },
    description: '"向世界分享更多美好。"',
    preferDealMethods: {
      selectedMethods: ["7-11", "全家", "面交"],
    },
  },
  {
    email: "snowball_white@ggmail.com",
    password: "snowball_white",
    nickname: "雪球白",
  },
  {
    email: "admin@mail.com",
    password: "admin",
    nickname: "管理員",
    accountAuthority: "admin",
  },
  {
    email: "cinnamon888bunbun@yufoo.tw",
    password: "cinnamon888bunbun",
    nickname: "肉桂幫幫",
  },
];
