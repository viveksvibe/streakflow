import { motion } from "framer-motion";
import type { DashboardUser } from "../../store/statStore";

interface Props {
  user: DashboardUser;
}

export const DashboardHeader = ({ user }: Props) => (
  <motion.div
    className="pt-10"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h1 className="text-2xl font-bold text-gray-800">
      Your Progress 📊
    </h1>
    <p className="text-sm text-gray-500 mt-1">
      Keep going, {user.fullName}
    </p>
  </motion.div>
);
