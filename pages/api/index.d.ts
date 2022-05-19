import { IronSession } from 'iron-session';

export type ISession = IronSession & Record<string, any>;

export type IUserInfo = {
  id: number,
  nickname?: string,
  avatar?: string,
  job?: string,
  introduce?: string,
};

export type ITag = {
  id: number,
  title: string,
  icon: string,
  follow_count: number,
  article_count: number,
  users: IUserInfo[],
};

export type IComment = {
  id: number,
  content: string,
  create_time: Date,
  update_time: Date,
  article_id?: number,
  rank: number,
  is_delete?: boolean,
  like_counts: number,
  like_users: IUserInfo[],
  user: IUserInfo,
  related_comments: IRelatedComment[],
};

export type IRelatedComment = {
  id: number,
  content: string,
  create_time: Date,
  update_time: Date,
  rank: number,
  is_delete?: boolean,
  like_counts: number,
  like_users: IUserInfo[],
  user: IUserInfo,
  rel_comment_id: number,
  rel_user: IUserInfo,
};

export type IArticle = {
  id: number,
  title: string,
  content: string,
  views: number,
  like_counts: number,
  like_users: IUserInfo[],
  create_time: Date,
  update_time: Date,
  is_delete?: boolean,
  is_draft?: boolean,
  rel_id?: number,
  user: IUserInfo,
  tags: ITag[],
  comments: IComment[],
};
