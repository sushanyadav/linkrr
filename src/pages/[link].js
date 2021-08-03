import PropTypes from "prop-types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import githubFavicon from "assets/images/github-favicon.ico";

import { connectToDatabase } from "lib/db";
const LinkPage = ({ data, errorFromServer }) => {
  const [message, setMessage] = useState();
  const [showMessageBox, setShowMessageBox] = useState(false);

  const messageRef = useRef(null);
  const messageAreaRef = useRef(null);

  useEffect(() => {
    if (message) {
      const textArea = messageRef.current;

      textArea.scrollTop = textArea.scrollHeight;
    }
  }, [message]);

  useEffect(() => {
    if (document) {
      document.addEventListener("click", (evt) => {
        let targetElement = evt.target; // clicked element

        do {
          if (targetElement === messageAreaRef.current) {
            // This is a click inside.
            return;
          }

          targetElement = targetElement.parentNode;
        } while (targetElement);
        // This is a click outside.
        setShowMessageBox(false);
      });
    }
  }, []);

  if (errorFromServer) {
    return (
      <div className="container center-vph-w-header">
        <h1>{errorFromServer}</h1>
      </div>
    );
  }

  const {
    personalDetails,
    socials: { socials, showFavicon },
  } = data;

  const hexToRgb = (hex) =>
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));

  const backgroundColorRbg = hexToRgb(personalDetails.backgroundColor);
  const textAreaBorderColor = `rgba(${backgroundColorRbg[0]}, ${backgroundColorRbg[1]}, ${backgroundColorRbg[2]}, 0.24)`;

  const sendMessageHandler = () => {
    if (!showMessageBox) {
      setShowMessageBox(true);

      return;
    }

    // console.log("hello");
  };

  return (
    <div
      className="link-wrapper"
      style={{ backgroundColor: personalDetails.backgroundColor }}
    >
      <div
        className="link container--link"
        style={{ borderColor: personalDetails.backgroundColor }}
      >
        <div className="link__main">
          <div className="profile-info">
            <div className="profile-info__image">
              <Image
                src={personalDetails.profileImage}
                alt={personalDetails.name}
                width={200}
                height={200}
              />
            </div>
            <h1 className="profile-info__name">{personalDetails.name}</h1>
            <h2 className="profile-info__title">{personalDetails.title}</h2>
          </div>
          <div className="social-links">
            {socials.map((social) => {
              let favIconUrl =
                "https://s2.googleusercontent.com/s2/favicons?domain_url=" +
                social.link;

              if (social.link.includes("github")) {
                favIconUrl = githubFavicon;
              }

              return (
                <a
                  target="_blank"
                  href={social.link}
                  rel="noreferrer"
                  key={social.link}
                  className="link-content"
                >
                  {showFavicon && (
                    <div className="link-content__icon">
                      <Image
                        src={favIconUrl}
                        alt={social.name}
                        width={16}
                        height={16}
                      />
                    </div>
                  )}
                  {social.name}
                </a>
              );
            })}
          </div>
        </div>
        <div ref={messageAreaRef} className="send-message-wrapper">
          <label
            className={`${
              showMessageBox ? "message-label--has-message" : ""
            } message-label`}
            htmlFor="message"
          >
            Send me a message
          </label>
          <textarea
            ref={messageRef}
            name=""
            id="message"
            cols="30"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="7"
            placeholder="Say something..."
            className={`${showMessageBox ? "has-message" : ""} send-message`}
            style={{ borderColor: textAreaBorderColor }}
          ></textarea>

          <button
            className={showMessageBox ? "--has-link" : ""}
            onClick={sendMessageHandler}
          >
            Send message
            <span>💬</span>
          </button>
        </div>
      </div>
    </div>
  );
};

LinkPage.defaultProps = {
  data: undefined,
  errorFromServer: undefined,
};

LinkPage.propTypes = {
  data: PropTypes.object,
  errorFromServer: PropTypes.string,
};

export async function getServerSideProps(context) {
  const link = context.query.link;

  let client;

  try {
    client = await connectToDatabase();
  } catch (error) {
    return {
      props: {
        errorFromServer: "Couldn't connect to database!",
      },
    };
  }

  const userCollection = client.db().collection("users");

  let user;

  try {
    user = await userCollection.findOne({
      "data.link": link,
    });
  } catch (err) {
    return {
      props: {
        errorFromServer: "Couldn't find the data.",
      },
    };
  }

  if (user && user.data) {
    return {
      props: {
        data: user.data,
      },
    };
  } else {
    return {
      props: {
        errorFromServer: "Couldn't find the data.",
      },
    };
  }
}

export default LinkPage;
