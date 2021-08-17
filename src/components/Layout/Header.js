import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/client";
import { useRouter } from "next/router";

import Button from "components/Button";

const Header = () => {
  const [session] = useSession();

  const logoutHandler = () => {
    signOut();
  };

  const router = useRouter();

  const isAuthPage = router.pathname === "/auth";
  const forgotPasswordPage = router.pathname === "/forgot-password";

  const unauthenticatedPages = isAuthPage || forgotPasswordPage;

  return (
    <div className="container">
      <div className="header-wrapper">
        <header
          className={`${
            unauthenticatedPages ? "flex-jc-c" : "flex-jc-sb"
          } flex flex-ai-c`}
        >
          <Link href="/">
            <a className={`${unauthenticatedPages ? "" : "black"} one-link`}>
              <span className="one-link__logo">
                <span>1</span>
              </span>
              OneLink
            </a>
          </Link>
          {session && !isAuthPage && (
            <div className="center">
              <div className="personal-info center">
                {session.user.image ? (
                  <div className="rounded-image rounded-small-image mr-1">
                    <Image
                      src={session.user.image}
                      alt={session.user.name}
                      width={200}
                      height={200}
                    />
                  </div>
                ) : (
                  <div className="center">
                    <div className="preview-placeholder preview-small-placeholder">
                      {session.user.name.charAt(0)}
                    </div>
                  </div>
                )}

                <div className="personal-info__data ml-1">
                  <div className="username">{session.user.name}</div>
                  <div className="email">{session.user.email}</div>
                </div>
              </div>

              <Button
                text="Log Out"
                onClick={logoutHandler}
                className="black"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                  >
                    <path fill="#1F2937" d="M9 13l5-4-5-4v3H0v2h9v3z"></path>
                    <path
                      fill="#1F2937"
                      d="M16 0H7C5.897 0 5 .897 5 2v4h2V2h9v14H7v-4H5v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V2c0-1.103-.897-2-2-2z"
                    ></path>
                  </svg>
                }
              />
            </div>
          )}
        </header>
      </div>
    </div>
  );
};

export default Header;
