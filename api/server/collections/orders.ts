import { Order } from "../models/order";
import { makeCollection } from "../lib/make-collections";

export const Orders = makeCollection<Order>('orders', Order);
