"use client";
import LoginModal from "@/modules/auth/components/login-modal";
import HandleShowLogin from "./handle-show-login";
import useLoginState from "@/modules/header/hooks/use-login-state";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import Link from "next/link";

export default function Header() {
  const { user } = useAppContext(AuthContext); // ahora recibís user
  const { showLogin, setShowLogin } = useLoginState();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 z-30">
      {user ? (
        <div className="ml-auto">
          <Link href="/profile">
            <span className="cursor-pointer">👤 {user.username}</span>
          </Link>
        </div>
      ) : (
        <HandleShowLogin setShowLogin={setShowLogin} />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
}
