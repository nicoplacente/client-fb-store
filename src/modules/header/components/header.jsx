"use client";
import LoginModal from "@/modules/auth/components/login-modal";
import HandleShowLogin from "./handle-show-login";
import useLoginState from "@/modules/header/hooks/use-login-state";
import { AuthContext } from "@/context/auth-context/auth-context";
import useAppContext from "@/context/use-app-context";
import Link from "next/link";
import { IconUser, IconBrandKick } from "@tabler/icons-react";
import coins from "@/assets/coins.webp";
import Image from "next/image";

export default function Header() {
  const { user } = useAppContext(AuthContext);
  const { showLogin, setShowLogin } = useLoginState();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-6 z-30">
      {user ? (
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/market"
            className="flex items-center gap-2 font-semibold font-mono border-2 border-dashed border-orange-300/50 bg-gradient-to-br from-neutral-900 via-orange-300/30 to-neutral-900 rounded-lg px-4 py-0.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
          >
            <Image src={coins} className="size-6" alt="Creditos" />
            <div className="flex flex-col ">
              <span className="text-xs text-orange-300 font-normal ">
                Creditos
              </span>
              <span className="text-sm text-[#ffe000] font-semibold ">
                1.000
              </span>
            </div>
          </Link>

          <span className="flex items-center gap-2 font-semibold font-mono border-2 border-dashed text-green-500 border-green-500/50 bg-gradient-to-br from-neutral-900 via-green-500/30 to-neutral-900 rounded-lg px-4 py-0.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200">
            <IconBrandKick />
            <div className="flex flex-col ">
              <span className="text-xs text-green-500/70 font-normal ">
                Creditos
              </span>
              <span className="text-sm  font-semibold ">1.000</span>
            </div>
          </span>

          <span className="flex items-center gap-2 font-semibold font-mono border-2 border-dashed text-green-500 border-green-500/50 bg-gradient-to-br from-neutral-900 via-green-500/30 to-neutral-900 rounded-lg px-4 py-0.5 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200">
            <IconBrandKick />
            <div className="flex flex-col ">
              <span className="text-xs text-green-500/70 font-normal ">
                Extensión
              </span>
              <span className="text-sm  font-semibold ">1.000</span>
            </div>
          </span>

          <Link
            href="/profile"
            className="flex items-center gap-1 font-semibold font-mono border text-red-500 border-red-500/50 bg-gradient-to-br from-neutral-900 via-primary/20 to-neutral-900 rounded-lg px-6 py-2 hover:translate-y-0.5 transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] saturate-150 hover:saturate-200"
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
