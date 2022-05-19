import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article } from 'db/entity/index';
import { EXCEPTION_COMMENT } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(like, ironOptions);

async function like(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { articleId = 0, type = '' } = req.body;
  const db = await prepareConnection();

  // 点赞用户
  const user = await db.getRepository(User).findOne({
    id: session?.id,
  });

  if (user) {
    const articleRepo = db.getRepository(Article);
    const article = await articleRepo.findOne({
      relations: ['like_users'],
      where: {
        id: articleId,
      },
    });
    if (article) {
      if (type === 'like') {
        article.like_users = article.like_users.concat([user]);
        article.like_counts++;
      } else if (type === 'unlike') {
        article.like_users = article.like_users.filter(
          (user) => user.id !== session.id
        );
        article.like_counts--;
      }
      const resArticle = await articleRepo.save(article);
      if (resArticle) {
        res.status(200).json({
          code: 0,
          msg: '点赞成功',
          data: resArticle,
        });
      } else {
        res.status(200).json({
          ...EXCEPTION_COMMENT.LIKE_FAILED,
        });
      }
    }
  }
}
