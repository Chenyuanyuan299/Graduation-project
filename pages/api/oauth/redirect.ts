import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from '../index';
import { prepareConnection } from 'db/index';
import { User, UserAuth } from 'db/entity/index';
import { Cookie } from 'next-cookie';
import { setCookie } from 'utils/index';
import request from 'service/fetch';

export default withIronSessionApiRoute(redirect, ironOptions);

async function redirect(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { code } = req?.query || {};
  const githubClientID = '213f2e49fbe19ba0fcf8';
  const githubClientSecret = 'ee15cb2cd7717ad3c73325557f0e8e12b63df9c1';
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubClientSecret}&code=${code}`;

  const result = await request.post(
    url,
    {},
    {
      headers: {
        accept: 'application/json',
      },
    }
  );

  const { access_token } = result as any

  const githubUserInfo = await request.get('https://api.github.com/user', {
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`
    }
  })

  const cookies = Cookie.fromApiRoute(req, res); 
  const db = await prepareConnection();
  const userAuthRepo = db.getRepository(UserAuth)
  const userAuth = await userAuthRepo.findOne({
    identity_type: 'github',
    identifier: githubClientID,
  }, {
    relations: ['user'],
  });

  if (userAuth) {
    const user = userAuth.user;

    const { id, nickname, avatar } = user;
    session.id = id;
    session.nickname = nickname;
    session.avatar = avatar;
    await session.save();
    setCookie(cookies, { id, nickname, avatar });

    res.redirect('http://localhost:3000/');
  } else {
    // 创建一个新用户，包括 user 和 user_auth
    const { login = '', avatar_url = '' } = githubUserInfo as any;
    const user = new User();
    user.nickname = login;
    user.avatar = avatar_url;

    const userAuth = new UserAuth();
    userAuth.identity_type = 'github';
    userAuth.identifier = githubClientID;
    userAuth.credential = access_token;
    userAuth.user = user;

    const resUserAuth = await userAuthRepo.save(userAuth);

    const { id, nickname, avatar } = resUserAuth?.user || {};
    session.id = id;
    session.nickname = nickname;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, { id, nickname, avatar });

    res.redirect('http://localhost:3000/');
  }
}
