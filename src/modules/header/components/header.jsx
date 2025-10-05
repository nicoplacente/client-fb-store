"use client";
import LoginModal from "@/modules/auth/components/login-modal";
import HandleShowLogin from "./handle-show-login";
import useLoginState from "@/modules/header/hooks/use-login-state";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import Link from "next/link";
import { IconUser } from "@tabler/icons-react";

export default function Header() {
  const { user } = useAppContext(AuthContext);
  const { showLogin, setShowLogin } = useLoginState();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 z-30">
      {user ? (
        <div className="ml-auto">
          <Link
            href="/profile"
            className="flex items-center gap-1 font-semibold font-mono border border-green-500/50 bg-gradient-to-br from-neutral-900 via-green-500/30 to-neutral-900 rounded-lg px-6 py-1.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
          >
            <IconUser />
            {user.username}
          </Link>
        </div>
      ) : (
        <HandleShowLogin setShowLogin={setShowLogin} />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
}
