export type ThemeOptions = 'light' | 'dark';
export type LanguageOptions = 'es' | 'en';


export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
    first_name?: string; 
    last_name?: string | null; 
    phone_number?: string | null;
}

export interface UserSettings {
  user_id: number;
  theme: ThemeOptions;
  language: LanguageOptions;
}

export interface UserSettingsUpdate {
  theme?: ThemeOptions;
  language?: LanguageOptions;
}

export interface Author {
    id: number;
    avatar_url: string | null;
    first_name: string;
    last_name: string | null;
    full_name: string;
}

export interface Post {
    id: number;
    title: string;
    description: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
    author: Author;
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
    post_id: number;
    author: Author;
}

export interface PostDetail extends Post {
    comments: Comment[];
}

export interface FriendRequest {
    id: number;
    requester: Author;
}

export interface UserSearch {
    id: number;
    username: string;
    avatar_url: string | null;
    first_name: string;
    last_name: string | null;
    full_name: string;
}

export interface ChatListItem {
    friendship_id: number;
    other_user: Author;
    last_message_content: string | null;
    last_message_at: string | null;
}

export interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
}

export interface AchievementWithStatus extends Achievement {
    is_unlocked: boolean;
    earned_at: string | null;
}