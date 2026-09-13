import { SearchContactInput } from "./FormInputs";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";

export default function SearchNewContacts({
  isAddContactHidden,
  setIsAddContactHidden,
  onSelectContact,
}) {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (isAddContactHidden) return;

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const contactsRef = collection(db, "users");
        const snapshot = await getDocs(contactsRef);
        const fetchedContacts = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((contact) => contact.uid !== user?.uid);
        setContacts(fetchedContacts);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [isAddContactHidden, user?.uid]);

  const handleStartChat = async (contact) => {
    if (!user || !contact) return;
    try {
      const chatId = [user.uid, contact.uid].sort().join("_");

      const chatRef = doc(db, "chats", chatId);
      await setDoc(
        chatRef,
        {
          participants: [user.uid, contact.uid],
          participantDetails: {
            [user.uid]: {
              uid: user.uid,
              displayName: user.displayName || user.email?.split("@")[0] || "User",
              photoURL: user.photoURL || null,
            },
            [contact.uid]: {
              uid: contact.uid,
              displayName: contact.displayName || contact.email?.split("@")[0] || "User",
              photoURL: contact.photoURL || null,
            },
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (onSelectContact) {
        onSelectContact({
          chatId,
          contact,
        });
      }

      setIsAddContactHidden(true);
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const term = searchInput.toLowerCase().trim();
    if (!term) return true;
    const name = (c.displayName || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    !isAddContactHidden && (
      <div className="fixed top-0 z-999 right-0 w-full min-h-screen p-6 bg-black/40 flex justify-center items-center">
        <div className="bg-white rounded-sm p-6 md:w-[320px] h-106.25 overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title font-bold ">Search by Name</h3>
              <button
                type="button"
                onClick={() => setIsAddContactHidden(!isAddContactHidden)}
                className="text-xs text-light-title font-bold bg-background px-2 py-1 rounded-sm cursor-pointer"
                aria-label="Close search modal"
              >
                X
              </button>
            </div>
            <SearchContactInput
              id="modal-search"
              placeholder="Search Contacts"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <div className="contacts mt-2 overflow-y-scroll h-68">
              {loading ? (
                <p className="text-sm text-slate-400 my-auto text-center">
                  Loading users...
                </p>
              ) : filteredContacts.length === 0 ? (
                <p className="text-sm text-slate-400 my-auto text-center">
                  No users found
                </p>
              ) : (
                filteredContacts.map((contact) => {
                  return (
                    <div
                      key={contact.id}
                      className="contact flex gap-4 items-center mb-5 hover:bg-slate-50 p-1 rounded-md transition"
                    >
                      <div className="w-10 h-10 shrink-0">
                        <img
                          src={contact.photoURL || defaultAvatar}
                          alt="contact image"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="info w-full min-w-0">
                        <h4 className="font-semibold text-title text-sm truncate mb-1">
                          {contact.displayName || contact.email?.split("@")[0] || "User"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleStartChat(contact)}
                          className="text-xs w-full text-light-title font-bold bg-background hover:bg-slate-200 px-3 py-1 rounded-sm cursor-pointer transition"
                        >
                          contact
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
