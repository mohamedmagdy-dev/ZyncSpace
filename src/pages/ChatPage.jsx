import { useEffect, useState, useRef } from "react";
import useAuthStore from "../store/useAuthStore";
import { db } from "../../firebase.config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import clsx from "clsx";

import AppLogo from "../components/AppLogo";

export default function ChatPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  console.log(user);
  // شات موحد تجريبي بين الحسابين (Hardcoded Room)
  const chatId = "demo_chat_room";

  // 1. الاستماع للرسائل لحظياً (Real-time)
  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. دالة إرسال الرسالة
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const textToSend = inputText;
    setInputText(""); // تفريغ الحقل فوراً

    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split("@")[0] || "User",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const imgUrl =
    "data:image/jpeg;base64,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";
  const isActive = true;
  return (
    <>
      <header className="bg-white p-4 border-b border-background flex justify-between">
        <AppLogo />
        <div className="flex items-center gap-3">
          <img
            src={imgUrl}
            alt="profile image"
            className="rounded-full object-cover w-12 h-12 border-2 border-background"
          />
          <p className="text-title font-sm ">{user?.displayName}</p>
        </div>
        <button
          type="button"
          className="text-title border-2 border-background py-2 px-5 rounded-sm cursor-pointer font-bold"
        >
          Logout
        </button>
      </header>

      <section className="flex bg-slate-100 h-[calc(100vh-81px)] ">
        <aside className=" w-100 flex flex-col bg-white border-r border-background p-4 ">
          <h3 className="font-bold text-title mb-4 text-2xl">Chats</h3>
          <input
            type="text"
            placeholder="Search Contacts"
            className="border border-background w-full rounded-full py-2 px-5 mb-4"
          />
          <div className="contacts flex flex-col gap-4 h-full overflow-y-scroll">
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
            <div
              className={clsx(
                "flex gap-3 p-2  rounded-md  cursor-pointer",
                isActive === "false" && "bg-[#F1F5F9] ",
              )}
            >
              <div className="w-12 h-12 ">
                <img
                  src={imgUrl}
                  alt="contact image"
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="info max-w-50">
                <h4 className="font-semibold text-title text-sm truncate mb-1">
                  Mohamed Magdy Elsayed
                </h4>
                <p className="text-xs text-light-title truncate font-bold">
                  How Are You
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* منطقة المحادثة */}
        <section className="h-full w-full p-4 flex flex-col gap-4">
          {/* صندوق عرض الرسائل */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 h-full p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <p className="text-center text-slate-400 my-auto">
                No messages yet. Say hello! 👋
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] ${
                      isMe ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    {!isMe && (
                      <span className="text-xs text-slate-500 mb-1 px-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </section>

          {/* حقل الإرسال */}
          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-200 w-full"
          >
            <input
              className="w-full border border-slate-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold text-sm cursor-pointer transition-colors"
            >
              Send
            </button>
          </form>
        </section>
      </section>
    </>
  );
}
