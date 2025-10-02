"use client";
import { useState } from "react";

export default function useLoginState() {
  const [showLogin, setShowLogin] = useState(false);

  return {
    showLogin,
    setShowLogin,
  };
}
