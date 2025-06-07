export type SocketMsg = {
  type: string;
  id?: string;
  message?: string;
  invitor?: string;
  invited?: string;
  sender?: string;
  receiver?: string;
};

export type Message = {
  id: string;
  sender: string;
  createdAt: string;
  image: string | File | ArrayBuffer;
  text: string;
  gif?: string;
  voice?: string;
};
