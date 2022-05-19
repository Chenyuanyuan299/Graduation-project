import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';
import { EXCEPTION_USER } from 'pages/api/config/resCode';
import { Cookie } from 'next-cookie';
import { setCookie } from 'utils/index';

export default withIronSessionApiRoute(update, ironOptions);

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const cookies = Cookie.fromApiRoute(req, res);
  const { id, avatar } = session;
  const { nickname = '', job = '', introduce = '' } = req.body;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);

  const user = await userRepo.findOne({
    where: {
      id: Number(id),
    },
  });

  if (user) {
    user.nickname = nickname;
    user.job = job;
    user.introduce = introduce;
    session.nickname = nickname;
    await session.save();
    setCookie(cookies, { id, nickname, avatar });

    const resUser = userRepo.save(user);

    res?.status(200)?.json({
      code: 0,
      msg: '',
      data: resUser,
    });
  } else {
    res?.status(200)?.json({
      ...EXCEPTION_USER.NOT_FOUND,
    });
  }
}
