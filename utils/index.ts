interface ICookieInfo {
  id: number;
  nickname: string;
  avatar: string;
}

export const setCookie = (
  cookies: any,
  { id, nickname, avatar }: ICookieInfo
) => {
  // 登录时效，24h
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const path = '/';

  cookies.set('id', id, {
    path,
    expires,
  });
  cookies.set('nickname', nickname, {
    path,
    expires,
  });
  cookies.set('avatar', avatar, {
    path,
    expires,
  });
};

export const clearCookie = (cookies: any) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const path = '/';

  cookies.set('id', '', {
    path,
    expires,
  });
  cookies.set('nickname', '', {
    path,
    expires,
  });
  cookies.set('avatar', '', {
    path,
    expires,
  });
};
