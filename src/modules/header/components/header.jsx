"use client";
import LoginModal from "@/modules/auth/components/login-modal";
import useUsername from "@/modules/auth/hooks/use-username";
import HandleShowLogin from "./handle-show-login";
import useLoginState from "@/modules/header/hooks/use-login-state";
import { handleLogin } from "@/modules/auth/hooks/login";

export default function Header() {
  const { username } = useUsername();
  const { showLogin, setShowLogin } = useLoginState();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 z-30">
      {username ? (
        <div className="ml-auto">
          <span className="cursor-pointer">👤 {username}</span>
        </div>
      ) : (
        <HandleShowLogin setShowLogin={setShowLogin} />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
}
