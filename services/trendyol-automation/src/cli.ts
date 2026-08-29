import { configFromEnv, listOrders, listProducts } from "./client.js";

const command = process.argv[2];
const config = configFromEnv();
const result =
  command === "products"
    ? await listProducts(config)
    : command === "orders"
      ? await listOrders(config)
      : null;

if (!result) throw new Error("Use products or orders");
console.log(JSON.stringify(result, null, 2));
