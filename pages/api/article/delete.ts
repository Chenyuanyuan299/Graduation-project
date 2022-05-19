import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(deleteBlog, ironOptions);

async function deleteBlog(req: NextApiRequest, res: NextApiResponse) {
  const { id = 0 } = req?.query || {};

  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);

  const article = await articleRepo.findOne({
    where: {
      id,
    },
    relations: ['user'],
  });

  if (article) {
    article.is_delete = true

    const resArticle = await articleRepo.save(article);

    if (resArticle) {
      res.status(200).json({ data: resArticle, code: 0, msg: '删除成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_ARTICLE.DELETE_FAILED });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_ARTICLE.NOT_FOUND });
  }
}
