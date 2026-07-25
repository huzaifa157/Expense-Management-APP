const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

const INCOME_CATEGORIES = ["Salary", "Business", "Gift", "Other"];

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

module.exports = { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ALL_CATEGORIES };
