// Extended types for notifications and mentions

export type NotificationType = 
  | 'mention'
  | 'friend_request'
  | 'friend_accepted'
  | 'like'
  | 'comment'
  | 'reply'
  | 'vote_up'
  | 'vote_down';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  postId?: string;
  postTitle?: string;
  commentId?: string;
  message?: string;
  read: boolean;
  createdAt: Date;
}

export interface Mention {
  id: string;
  mentionedUserId: string;
  mentionedBy: {
    id: string;
    username: string;
    displayName: string;
  };
  postId?: string;
  commentId?: string;
  createdAt: Date;
}
