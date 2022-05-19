import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from '../index';
import { prepareConnection } from 'db/index';
import { User, UserAuth } from 'db/entity/index';
import { Cookie } from 'next-cookie';
import { setCookie } from 'utils/index';

export default withIronSessionApiRoute(login, ironOptions);

async function login(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const cookies = Cookie.fromApiRoute(req, res);
  const { phone = '', verify = '', identity_type = 'phone' } = req.body;
  const db = await prepareConnection();
  // const userRepo = db.getRepository(User);
  const userAuthRepo = db.getRepository(UserAuth);

  if (String(session.verifyCode) === String(verify)) {
    const userAuth = await userAuthRepo.findOne(
      {
        identity_type,
        identifier: phone,
      },
      {
        relations: ['user'],
      }
    );

    if (userAuth) {
      const user = userAuth.user;
      const { id, nickname, avatar } = user;
      session.id = id;
      session.nickname = nickname;
      session.avatar = avatar;
      await session.save();
      setCookie(cookies, { id, nickname, avatar });

      res?.status(200).json({
        code: 0,
        msg: '登录成功',
        data: {
          id: id,
          nickname,
          avatar,
        },
      });
    } else {
      const user = new User();
      user.nickname = `用户_${new Date().getTime()}`;
      user.avatar = '/images/avatar.jpg';
      user.job = '无';
      user.introduce = '无';

      const userAuth = new UserAuth();
      userAuth.identifier = phone;
      userAuth.identity_type = identity_type;
      userAuth.credential = session.verifyCode;
      userAuth.user = user;

      const resUserAuth = await userAuthRepo.save(userAuth);
      const {
        user: { id, nickname, avatar },
      } = resUserAuth;

      session.id = id;
      session.nickname = nickname;
      session.avatar = avatar;
      await session.save();
      setCookie(cookies, { id, nickname, avatar });

      res?.status(200).json({
        code: 0,
        msg: '登录成功',
        data: {
          id: id,
          nickname,
          avatar,
        },
      });
    }
  } else {
    res?.status(200).json({ code: -1, msg: '验证码错误' });
  }
}
