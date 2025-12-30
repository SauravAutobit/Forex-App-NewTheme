import React, { useState, useEffect, useRef, useMemo } from "react";
import aiArrow from "../../assets/icons/aiArrow.svg";
import squareAi from "../../assets/icons/squareAi.svg";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  sendPromptToAI,
  stopAIChat,
  commitFinalMessage,
  fetchChatHistory,
  type ChatMessage,
} from "../../store/slices/aiChatSlice";
import { type RootState } from "../../store/store";
import "./AIChat.css";

// 1. Import the Markdown component
import Markdown from "markdown-to-jsx";
import { useSelector } from "react-redux";

// 2. Custom Cursor Component
const Cursor = () => <span className="animate-pulse">|</span>;

const AIChat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { messages, status } = useAppSelector(
    (state: RootState) => state.aiChat
  );

  const theme = useSelector((state: RootState) => state.theme.mode);

  const dispatch = useAppDispatch();

  const [typingText, setTypingText] = useState("");
  const [fullResponse, setFullResponse] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null); // For auto-scroll

  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus
  );
  // 🆕 EFFECT TO LOAD CHAT HISTORY ON MOUNT
  useEffect(() => {
    // Only fetch history if the chat is in the initial 'idle' state
    if (apiStatus === "connected" && messages.length <= 1) {
      // Assuming initial message is "Hello!..."
      dispatch(fetchChatHistory());
    }
  }, [apiStatus, dispatch, messages.length]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      setTypingText("");
      setFullResponse("");
      dispatch(sendPromptToAI(inputMessage));
      setInputMessage("");
    }
  };

  const handleStopMessage = () => {
    setFullResponse("");
    setTypingText("");
    dispatch(stopAIChat());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending && !isTyping) {
      handleSendMessage();
    }
  };

  const isSending = status === "loading";
  const isTyping =
    fullResponse.length > 0 && typingText.length < fullResponse.length;

  // 🆕 EFFECT TO HANDLE TYPING ANIMATION
  useEffect(() => {
    const latestAIMessage = [...messages]
      .reverse()
      .find((msg: ChatMessage) => msg.type === "ai_loading");

    if (latestAIMessage && latestAIMessage.text && fullResponse === "") {
      setFullResponse(latestAIMessage.text);
      setTypingText("");
    }

    if (fullResponse.length > 0 && typingText.length < fullResponse.length) {
      const timeout = setTimeout(() => {
        setTypingText(fullResponse.slice(0, typingText.length + 1));
      }, 15);

      // Keep scroll during typing for immediate feedback
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

      return () => clearTimeout(timeout);
    }

    if (fullResponse.length > 0 && typingText.length === fullResponse.length) {
      dispatch(commitFinalMessage(fullResponse));
      setFullResponse("");
    }
  }, [fullResponse, typingText, messages, dispatch]);

  // ✅ FIX: DEDICATED EFFECT FOR SCROLLING AFTER ANY MESSAGE CHANGE
  // This ensures scrolling happens after:
  // 1. History loads (initial render)
  // 2. User sends a message
  // 3. AI response is committed (end of typing animation)
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayMessages = useMemo(() => {
    return messages.filter((msg: ChatMessage) => msg.type !== "ai_loading");
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {displayMessages.map((msg: ChatMessage, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.type === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`p-3 rounded-xl inline-block max-w-[100%] ${
                msg.type === "user"
                  ? "bg-[#AEED09] text-[#181818]"
                  : theme === "dark"
                  ? "bg-[#181818]"
                  : "bg-[#E5E5E5]"
              }`}
            >
              {/* Always use Markdown for committed messages */}
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        ))}

        {/* Current Typing Message Display (FIXED: Uses raw text + cursor) */}
        {(isSending || isTyping || fullResponse.length > 0) && (
          <div className="mb-4 text-left">
            <div
              className={`p-3 rounded-xl inline-block max-w-[100%] ${
                theme === "dark" ? "bg-[#181818]" : "bg-[#E5E5E5]"
              }`}
            >
              {isTyping || fullResponse.length > 0 ? (
                // 🛑 NEW FIX: Do not use Markdown during typing to prevent parsing issues like **
                // Display typingText as raw text, and append the Cursor component as a sibling.
                <>
                  <span className="whitespace-pre-wrap">{typingText}</span>
                  <Cursor />
                </>
              ) : (
                <div className="dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Buttons and Input Bar (omitted for brevity, assume unchanged) */}
      <div
        className="flex gap-2 overflow-x-auto p-2.5"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          className="px-4 py-6 rounded-20 whitespace-nowrap flex flex-col"
          style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
          onClick={() =>
            dispatch(sendPromptToAI("Monthly Profit of my portfolio"))
          }
        >
          Monthly Profit <span className="text-[#505050]">of my portfolio</span>
        </button>

        <button
          className="px-4 py-6 bg-gray-800 rounded-20 whitespace-nowrap flex flex-col"
          style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
          onClick={() => dispatch(sendPromptToAI("Performance of last week"))}
        >
          Performance of <span className="text-[#505050]">last week</span>
        </button>

        <button
          className="px-4 py-6 bg-gray-800 rounded-20 whitespace-nowrap flex flex-col"
          style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
          onClick={() => dispatch(sendPromptToAI("Best performing asset"))}
        >
          Best performing <span className="text-[#505050]">asset</span>
        </button>
      </div>

      <div className="px-3 py-4 space-y-3">
        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <div
            className="w-full flex items-center rounded-[40px]"
            style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
          >
            <input
              type="text"
              placeholder={
                isSending || isTyping ? "Thinking..." : "Ask Anything"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-3 h-[42px] text-primary rounded-full outline-none placeholder:text-[#505050]"
              style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
              disabled={isSending || isTyping}
            />

            <button
              className="rounded-[40px] mr-1 w-[32px] h-[32px] flex justify-center items-center"
              style={{ background: "#AEED09" }}
              onClick={
                isSending || isTyping ? handleStopMessage : handleSendMessage
              }
              disabled={inputMessage.trim() === "" && !isSending && !isTyping}
            >
              <img
                src={isSending || isTyping ? squareAi : aiArrow}
                alt="Send"
                width={"10px"}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
