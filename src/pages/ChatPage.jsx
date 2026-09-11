//lib
import { toast } from "sonner";
import { useEffect } from "react";

export default function ChatPage() {
  useEffect(() => {
    toast.success("Welcome to the chat", {
      id: "welcome-toast",
    });
  }, []);
  return <div>hello chat</div>;
}
