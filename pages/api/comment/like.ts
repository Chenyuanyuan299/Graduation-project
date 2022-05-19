import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Comment, RelatedComment } from 'db/entity/index';
import { EXCEPTION_COMMENT } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(like, ironOptions);

async function like(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { commentId = 0, rank = 0, type = '' } = req.body;
  const db = await prepareConnection();

  // 点赞用户
  const user = await db.getRepository(User).findOne({
    id: session?.id,
  });

  if (user) {
    if (rank === 1) {
      const commentRepo = db.getRepository(Comment);
      const comment = await commentRepo.findOne({
        relations: ['like_users'],
        where: {
          id: commentId,
        },
      });
      if (comment) {
        if (type === 'like') {
          comment.like_users = comment.like_users.concat([user]);
          comment.like_counts++;
        } else if (type === 'unlike') {
          comment.like_users = comment.like_users.filter(
            (user) => user.id !== session.id
          );
          comment.like_counts--;
        }
        const resComment = await commentRepo.save(comment);
        if (resComment) {
          res.status(200).json({
            code: 0,
            msg: '点赞成功',
            data: resComment,
          });
        } else {
          res.status(200).json({
            ...EXCEPTION_COMMENT.LIKE_FAILED,
          });
        }
      }
    } else {
      const relCommentRepo = db.getRepository(RelatedComment);
      const relComment = await relCommentRepo.findOne({
        relations: ['like_users'],
        where: {
          id: commentId,
        },
      });
      if (relComment) {
        if (type === 'like') {
          relComment.like_users = relComment.like_users.concat([user]);
          relComment.like_counts++;
        } else if (type === 'unlike') {
          relComment.like_users = relComment.like_users.filter(
            (user) => user.id !== session.id
          );
          relComment.like_counts--;
        }
        const resComment = await relCommentRepo.save(relComment);
        if (resComment) {
          res.status(200).json({
            code: 0,
            msg: '点赞成功',
            data: resComment,
          });
        } else {
          res.status(200).json({
            ...EXCEPTION_COMMENT.LIKE_FAILED,
          });
        }
      }
    }
  }
}
