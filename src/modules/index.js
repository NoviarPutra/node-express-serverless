module.exports = (app) => {
  app.use("/api/authentication", require("./authentication/authentication.route"));
  app.use("/api/categories", require("./categories/categories.route"));
  app.use("/api/products", require("./products/products.route"));
  app.use("/api/order", require("./order/order.route"));
  app.use("/api/transaction", require("./transaction/transaction.route"));
};
