import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { tag_id = 0, user_id = 0 } = req?.query || {};
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);

  let articles = [];

  if (user_id && tag_id) {
    articles = await articleRepo.find({
      relations: ['user', 'tags'],
      order: {
        update_time: 'DESC',
      },
      where: (qb: any) => {
        qb.where('user_id = :id', {
          id: Number(user_id),
        })
          .andWhere('tag_id = :id', {
            id: Number(tag_id),
          })
          .andWhere('is_delete = false');
      },
    });
  } else if (user_id) {
    articles = await articleRepo.find({
      relations: ['user', 'tags'],
      order: {
        update_time: 'DESC',
      },
      where: {
        user: {
          id: Number(user_id),
        },
        is_delete: false,
      },
    });
  } else if (tag_id) {
    articles = await articleRepo.find({
      relations: ['user', 'tags'],
      order: {
        update_time: 'DESC',
      },
      where: (qb: any) => {
        qb.where('tag_id = :id', {
          id: Number(tag_id),
        })
          .andWhere('is_delete = false')
          .andWhere('is_draft = false');
      },
    });
  } else {
    articles = await articleRepo.find({
      where: { is_delete: false, is_draft: false },
      order: {
        update_time: 'DESC',
      },
      relations: ['user', 'tags'],
    });
  }

  res?.status(200).json({
    code: 0,
    msg: '',
    data: articles || [],
  });
}
