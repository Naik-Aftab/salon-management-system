import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerByPhone,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "../controllers/customerController";

const router = Router();

router.post("/", createCustomer);
router.get("/", listCustomers);
router.get("/phone/:phone", getCustomerByPhone);
router.get("/:id", getCustomerById);
router.patch("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
