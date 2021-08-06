import Image from "next/image";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";

import hexToRgb from "utils/hexToRgb";

import githubFavicon from "assets/images/github-favicon.ico";

const Link = ({
  wrapperClassName,
  contentClassName,
  sendMessageHandler,
  data,
  errors,
  message,
  setMessage,
}) => {
  const [showMessageBox, setShowMessageBox] = useState(false);

  const {
    personalDetails,
    socials: { socials, showFavicon },
    contactForm: { toggle },
  } = data;

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
  }, [setShowMessageBox]);

  const backgroundColorRbg = hexToRgb(personalDetails.backgroundColor);
  const textAreaBorderColor = `rgba(${backgroundColorRbg[0]}, ${backgroundColorRbg[1]}, ${backgroundColorRbg[2]}, 0.24)`;

  const onSendMessageClick = () => {
    if (!showMessageBox) {
      setShowMessageBox(true);

      return;
    }
    sendMessageHandler();
  };

  return (
    <div
      className={`${wrapperClassName} link-wrapper`}
      style={{ backgroundColor: personalDetails.backgroundColor }}
    >
      <div
        className={`${contentClassName} link container--link`}
        style={{ borderColor: personalDetails.backgroundColor }}
      >
        <div className="link__main">
          <div className="profile-info">
            <div className="profile-info__image">
              {!errors?.personalDetails?.profileImage &&
              personalDetails.profileImage ? (
                <Image
                  src={personalDetails.profileImage}
                  alt={personalDetails.name}
                  width={200}
                  height={200}
                />
              ) : (
                <div className="preview-placeholder"></div>
              )}
            </div>
            <h1 className="profile-info__name">{personalDetails.name}</h1>
            <h2 className="profile-info__title">{personalDetails.title}</h2>
          </div>
          <div className="social-links">
            {socials.map((social, index) => {
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
                  key={index}
                  className="link-content"
                >
                  {social.link && showFavicon && (
                    <div className="link-content__icon">
                      <Image
                        src={favIconUrl}
                        alt={social.name}
                        width={16}
                        height={16}
                      />
                    </div>
                  )}
                  {social.name || "‎‏‏‎ ‎"}
                </a>
              );
            })}
          </div>
        </div>
        {toggle && (
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
              onClick={onSendMessageClick}
            >
              Send message
              <span>💬</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Link.defaultProps = {
  wrapperClassName: "",
  contentClassName: "",
  message: "",
  setMessage: () => {},
  sendMessageHandler: () => {},
  errors: {},
};

Link.propTypes = {
  sendMessageHandler: PropTypes.func,
  message: PropTypes.string,
  wrapperClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  setMessage: PropTypes.func,
  data: PropTypes.object.isRequired,
  errors: PropTypes.object,
};

export default Link;
