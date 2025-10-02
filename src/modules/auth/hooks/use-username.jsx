"use client";
import { useState, useEffect } from "react";

export default function useUsername() {
  const [username, setUsername] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("kickUsername");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);
  return { username, setUsername };
}
