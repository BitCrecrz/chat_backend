export interface Chat {
  id: string;
  user1Id: number;
  user2Id: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: number;
  text: string;
  timestamp: Date;
}
