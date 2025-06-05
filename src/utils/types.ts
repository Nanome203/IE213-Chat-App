export type SocketMsg = {
  type: string;
  id?: string;
  message?: string;
  invitor?: string; // iuse f type is friendRequest
  invited?: string; // use if type is friendRequest
};
