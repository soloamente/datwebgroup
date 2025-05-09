"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function AdminLoginLeftSide() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="bg-login-credentials relative hidden h-full w-full rounded-2xl md:block md:w-2/5"
    >
      <div className="flex h-full items-center justify-center">
        <Image
          src="/Admin-cuate.svg"
          alt="Login Notai"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
    </motion.div>
  );
}
