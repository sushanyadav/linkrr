import Link from "next/link";
import { useSession, signOut } from "next-auth/client";

const Header = () => {
  const [session] = useSession();

  const logoutHandler = () => {
    signOut();
  };

  return (
    <div className="header-wrapper">
      <header className="container flex flex-jc-sb flex-ai-c">
        <Link className="logo" href="/">
          <a>linkrr</a>
        </Link>
        {session && (
          <button onClick={logoutHandler} className="primary">
            Logout
          </button>
        )}
      </header>
    </div>
  );
};

export default Header;
