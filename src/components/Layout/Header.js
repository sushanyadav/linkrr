import Link from "next/link";
import { useSession, signOut } from "next-auth/client";
import { useRouter } from "next/router";

const Header = () => {
  const [session] = useSession();

  const logoutHandler = () => {
    signOut();
  };

  const router = useRouter();

  const isAuthPage = router.pathname === "/auth";

  return (
    <div className="">
      <header className="container flex flex-jc-sb flex-ai-c">
        <Link className="" href="/">
          <a>linkrr</a>
        </Link>
        {session && !isAuthPage && (
          <button onClick={logoutHandler} className="primary">
            Logout
          </button>
        )}
      </header>
    </div>
  );
};

export default Header;
