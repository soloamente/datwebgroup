"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function AdminLoginLeftSide() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="bg-login-credentials relative hidden h-full w-full rounded-2xl p-4 md:block md:w-2/5 lg:w-1/2"
    >
      <div className="flex h-full items-center justify-center">
        <Image
          src="/Admin-cuate.svg"
          alt="Login Notai"
          width={500}
          height={500}
          className="h-auto w-full object-contain sm:w-[300px] md:w-[400px] lg:max-w-[500px]"
          priority
        />
      </div>
    </motion.div>
  );
}
