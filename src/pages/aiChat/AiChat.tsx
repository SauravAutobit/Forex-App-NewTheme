import React, { useState, useEffect, useRef, useMemo } from "react";
import aiArrow from "../../assets/icons/aiArrow.svg";
import squareAi from "../../assets/icons/squareAi.svg";
import aiAvatar from "../../assets/icons/aiAvatar.svg";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import {
  sendPromptToAI,
  stopAIChat,
  commitFinalMessage,
  fetchChatHistory,
  type ChatMessage,
} from "../../store/slices/aiChatSlice";
import { type RootState } from "../../store/store";
import "./chatAi.css";

// 1. Import the Markdown component
import Markdown from "markdown-to-jsx";
import { useSelector } from "react-redux";

// 2. Custom Cursor Component
const Cursor = () => <span className="animate-pulse">|</span>;

// 3. AI Trading Prompts Array
const aiTradingPrompts = [
  "Show my closed trades",
  "Show my open positions",
  "Summarize today's trades",
  "Summarize this week's trades",
  "Summarize this month's trades",

  "Why did my last trade fail?",
  "Why did my last trade succeed?",
  "Analyze my recent losses",
  "Analyze my recent wins",
  "What went wrong in my trades?",

  "Find my biggest mistake",
  "Find my best trade",
  "Which trade performed best?",
  "Which trade caused most loss?",
  "What is my win rate?",

  "Check my risk management",
  "Analyze my stop-loss usage",
  "Analyze my take-profit usage",
  "Did I overtrade?",
  "Did I revenge trade?",

  "Analyze my entry timing",
  "Analyze my exit timing",
  "Did I exit too early?",
  "Did I hold trades too long?",
  "Was my timing correct?",

  "Check my risk–reward ratio",
  "Am I risking too much?",
  "Am I under-risking?",
  "Suggest better risk rules",
  "Improve my trade sizing",

  "Analyze my trading strategy",
  "Is my strategy working?",
  "Suggest strategy improvements",
  "What should I change?",
  "What should I keep doing?",

  "Analyze my drawdown",
  "Why am I losing money?",
  "Why am I profitable?",
  "What causes my losses?",
  "What drives my profits?",

  "Analyze market conditions",
  "Did I trade against trend?",
  "Did I trade during low volume?",
  "Did news affect my trades?",
  "Was volatility too high?",

  "Check my discipline",
  "Am I breaking my rules?",
  "Am I trading emotionally?",
  "Did fear affect my trades?",
  "Did greed affect my trades?",

  "Give me trading insights",
  "Give me improvement tips",
  "Give me performance feedback",
  "Give me a trader score",

  "How can I reduce losses?",
  "How can I improve accuracy?",
  "How can I trade better?",
  "How can I be consistent?",

  "What is my biggest weakness?",
  "What is my biggest strength?",
  "What should I focus on?",
  "What should I avoid?",

  "Prepare me for next trade",
  "What should I do next?",
  "Give me a trading plan",
  "Give me today's bias",

  "Explain my trading behavior",
  "Explain my performance trend",
  "Explain my results simply",

  "Monthly Profit of my portfolio",
  "Performance of last week",
  "Best performing asset",
];

const AIChat = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { messages, status } = useAppSelector(
    (state: RootState) => state.aiChat,
  );

  const theme = useSelector((state: RootState) => state.theme.mode);

  const dispatch = useAppDispatch();

  // 4. Randomly select 3 prompts on component mount
  const randomPrompts = useMemo(() => {
    const shuffled = [...aiTradingPrompts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // 5. Helper function to render prompt with styled parts (dynamic for all prompts)
  const renderPromptText = (prompt: string) => {
    const words = prompt.split(" ");

    // If only 1-2 words, show as single line
    if (words.length <= 2) {
      return prompt;
    }

    // Find the split point: first 1-3 words that fit within ~14 characters
    let splitIndex = 1;
    let firstLineLength = words[0].length;

    for (let i = 1; i < Math.min(3, words.length); i++) {
      const potentialLength = firstLineLength + 1 + words[i].length; // +1 for space
      if (potentialLength <= 14) {
        splitIndex = i + 1;
        firstLineLength = potentialLength;
      } else {
        break;
      }
    }

    const mainPart = words.slice(0, splitIndex).join(" ");
    const secondaryPart = words.slice(splitIndex).join(" ");

    // If there's no secondary part, return as single line
    if (!secondaryPart) {
      return prompt;
    }

    return (
      <div className="flex flex-col">
        {mainPart} <span className="text-[#505050]">{secondaryPart}</span>
      </div>
    );
  };

  const [typingText, setTypingText] = useState("");
  const [fullResponse, setFullResponse] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null); // For auto-scroll

  const apiStatus = useSelector(
    (state: RootState) => state.websockets.apiStatus,
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
    dispatch(commitFinalMessage(typingText || ""));
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
            className={`mb-4 flex gap-2 ${
              msg.type === "user"
                ? "justify-end items-start"
                : "justify-start items-end"
            }`}
          >
            {msg.type === "ai" && (
              <img
                src={aiAvatar}
                alt="AI"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            )}
            <div
              className={`p-3 inline-block max-w-[80%] ${
                msg.type === "user"
                  ? "bg-[#AEED09] text-[#181818] rounded-[20px] rounded-br-none"
                  : theme === "dark"
                    ? "bg-[#181818] rounded-[20px] rounded-bl-none"
                    : "bg-[#E5E5E5] rounded-[20px] rounded-bl-none"
              } break-words`}
            >
              {/* Always use Markdown for committed messages */}
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        ))}

        {/* Current Typing Message Display (FIXED: Uses raw text + cursor) */}
        {(isSending || isTyping || fullResponse.length > 0) && (
          <div className="mb-4 flex items-end gap-2">
            <img
              src={aiAvatar}
              alt="AI"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div
              className={`p-3 rounded-[20px] rounded-bl-none inline-block max-w-[100%] min-w-[280px] break-words ${
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
                <div className="dots-large">
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
        {randomPrompts.map((prompt, index) => (
          <button
            key={index}
            className="px-4 py-6 rounded-20 whitespace-nowrap"
            style={{ background: theme === "dark" ? "#181818" : "#E5E5E5" }}
            onClick={() => dispatch(sendPromptToAI(prompt))}
          >
            {renderPromptText(prompt)}
          </button>
        ))}
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
