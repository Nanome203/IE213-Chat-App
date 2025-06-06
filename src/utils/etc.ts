import { Message } from "./types";

export const normalizeDate = (isoString: string) => {
  const date = new Date(isoString);

  // Extract values
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  // Format to "YYYY-MM-DD HH:mm"
  const formatted = `${year}-${month}-${day} ${hour}:${minute}`;
  return formatted;
};

export const isLastMessage = (messages: Message[], currentMessage: Message) => {
  if (!Array.isArray(messages) || messages.length === 0) return false;

  const lastMessage = messages[messages.length - 1];

  return lastMessage === currentMessage;
};
