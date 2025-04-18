"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import PasswordInput from "@/components/ui/password-input";
import EmailInput from "@/components/ui/email-input";
import Image from "next/image";

export default function HomePage() {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-bold">Dataweb Group</h1>
        <p className="text-xl text-gray-600">Home page</p>
      </main>
    </div>
  );
}
