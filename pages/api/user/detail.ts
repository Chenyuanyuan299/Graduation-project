import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';
import { EXCEPTION_USER } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(detail, ironOptions);

async function detail(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { id } = session;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);

  const user = await userRepo.findOne({
    where: {
      id: Number(id),
    },
  });

  if (user) {
    res?.status(200)?.json({
      code: 0,
      msg: '',
      data: {
        userInfo: user,
      },
    });
  } else {
    res?.status(200)?.json({
      ...EXCEPTION_USER.NOT_FOUND,
    });
  }
}
