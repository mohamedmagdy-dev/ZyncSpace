import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "../store/useAuthStore";
import { db } from "../../firebase.config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import clsx from "clsx";

import AppLogo from "../components/AppLogo";
import SearchNewContacts from "../components/SearchNewContacts";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import { SearchContactInput } from "../components/FormInputs";

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const [isAddContactHidden, setIsAddContactHidden] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      return;
    }

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const otherUserId = (data.participants || []).find((id) => id !== user.uid);
        const otherUser = data.participantDetails?.[otherUserId] || {
          displayName: "User",
          photoURL: null,
        };
        return {
          chatId: docSnap.id,
          contact: {
            uid: otherUserId,
            ...otherUser,
          },
          lastMessage: data.lastMessage || "",
          updatedAt: data.updatedAt?.toMillis() || 0,
        };
      });

      convs.sort((a, b) => b.updatedAt - a.updatedAt);
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!activeChat?.chatId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chats", activeChat.chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat?.chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeChat?.chatId) return;

    const textToSend = inputText;
    setInputText("");

    try {
      const messagesRef = collection(db, "chats", activeChat.chatId, "messages");
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split("@")[0] || "User",
        createdAt: serverTimestamp(),
      });

      const chatDocRef = doc(db, "chats", activeChat.chatId);
      await setDoc(
        chatDocRef,
        {
          lastMessage: textToSend,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setInputText(textToSend);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const term = sidebarSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.contact?.displayName || "").toLowerCase().includes(term) ||
      (c.contact?.email || "").toLowerCase().includes(term)
    );
  });

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      navigate("/login");
    }
  };

  return (
    <>
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <SearchNewContacts
        isAddContactHidden={isAddContactHidden}
        setIsAddContactHidden={setIsAddContactHidden}
        onSelectContact={(chatData) => setActiveChat(chatData)}
      />
      <header className="bg-white px-3 md:px-4 py-2.5 md:py-3 border-b border-background flex flex-wrap justify-between items-center gap-2">
        <AppLogo />
        <div
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 md:gap-3 cursor-pointer p-1 md:p-1.5 rounded-md hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
          title="Click to edit profile"
        >
          <div className="relative w-9 h-9 md:w-11 md:h-11 shrink-0">
            <img
              src={user?.photoURL || defaultAvatar}
              alt="profile image"
              className="rounded-full object-cover w-full h-full border-2 border-background"
            />
            <span className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center text-[9px] md:text-[10px] leading-none shadow">
              ✎
            </span>
          </div>
          <div className="flex flex-col text-left max-w-28 sm:max-w-40 md:max-w-none">
            <p className="text-title font-semibold text-xs md:text-sm leading-tight truncate">
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </p>
            <span className="text-[10px] md:text-[11px] text-blue-600 font-medium hidden sm:inline">Settings</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-title border-2 border-background hover:bg-slate-100 py-1.5 md:py-2 px-3 md:px-5 rounded-sm cursor-pointer font-bold text-xs md:text-sm transition shrink-0"
        >
          Logout
        </button>
      </header>

      <section className="flex bg-slate-100 h-[calc(100vh-65px)] md:h-[calc(100vh-81px)] overflow-hidden">
        <aside
          className={clsx(
            "flex-col bg-white border-r border-background p-3 md:p-4 h-full shrink-0 w-full md:w-80 lg:w-96",
            activeChat ? "hidden md:flex" : "flex"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-title text-xl md:text-2xl">Chats</h3>
            <button
              type="button"
              onClick={() => setIsAddContactHidden(!isAddContactHidden)}
              className="text-title border-2 border-background px-3 rounded-sm cursor-pointer font-bold text-xl"
            >
              +
            </button>
          </div>
          <SearchContactInput
            id="sidebar-search"
            placeholder="Search Contacts"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
          <div className="contacts flex flex-col gap-2 h-full overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = activeChat?.chatId === conv.chatId;
                return (
                  <div
                    key={conv.chatId}
                    onClick={() =>
                      setActiveChat({
                        chatId: conv.chatId,
                        contact: conv.contact,
                      })
                    }
                    className={clsx(
                      "flex gap-3 p-2 rounded-md cursor-pointer border transition",
                      isSelected
                        ? "bg-[#F1F5F9] border-slate-300"
                        : "hover:bg-slate-50 border-transparent"
                    )}
                  >
                    <div className="w-12 h-12 shrink-0">
                      <img
                        src={conv.contact?.photoURL || defaultAvatar}
                        alt="contact image"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="info flex-1 min-w-0">
                      <h4 className="font-semibold text-title text-sm truncate mb-1">
                        {conv.contact?.displayName || conv.contact?.email?.split("@")[0] || "User"}
                      </h4>
                      <p className="text-xs text-light-title truncate font-medium">
                        {conv.lastMessage || "Start a conversation..."}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active conversations.<br />Click <span className="font-bold text-title">+</span> to start one.
              </div>
            )}
          </div>
        </aside>

        <section
          className={clsx(
            "h-full w-full p-2 md:p-4 flex flex-col gap-2 md:gap-4 overflow-hidden",
            !activeChat ? "hidden md:flex" : "flex"
          )}
        >
          {!activeChat ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-4 text-slate-400">
                💬
              </div>
              <h3 className="text-xl font-bold text-title mb-2">No Chat Selected</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Click + to find and choose a contact to start your private conversation.
              </p>
              <button
                type="button"
                onClick={() => setIsAddContactHidden(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold text-sm cursor-pointer transition-colors"
              >
                Find Contacts
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white px-3 md:px-4 py-2 md:py-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2.5 md:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-1.5 -ml-1 text-title hover:bg-slate-100 rounded-md cursor-pointer transition font-bold text-lg leading-none"
                  aria-label="Back to conversations list"
                >
                  ←
                </button>
                <img
                  src={activeChat.contact?.photoURL || defaultAvatar}
                  alt={activeChat.contact?.displayName || "Contact"}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-title text-sm truncate">
                    {activeChat.contact?.displayName || activeChat.contact?.email?.split("@")[0] || "User"}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {activeChat.contact?.email || "Direct Message"}
                  </p>
                </div>
              </div>

              <section className="bg-white rounded-lg shadow-sm border border-slate-200 h-full p-3 md:p-4 overflow-y-auto flex flex-col gap-3">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-400 my-auto">
                    No messages yet. Say hello to {activeChat.contact?.displayName || "them"}! 👋
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
            </>
          )}
        </section>
      </section>
    </>
  );
}
