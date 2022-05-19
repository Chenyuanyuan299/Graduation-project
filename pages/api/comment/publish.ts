import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article, Comment, RelatedComment } from 'db/entity/index';
import { EXCEPTION_COMMENT } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const {
    articleId = 0,
    replyCommentId = 0,
    replyUserId = 0,
    content = '',
    rank = 0,
  } = req.body;
  const db = await prepareConnection();

  // 提交评论用户
  const user = await db.getRepository(User).findOne({
    id: session?.id,
  });

  // 评论所在文章
  const article = await db.getRepository(Article).findOne({
    id: articleId,
  });

  // 被回复用户
  const rel_user = await db.getRepository(User).findOne({
    id: replyUserId,
  });

  // 被回复的根评论
  const rel_comment = await db.getRepository(Comment).findOne({
    id: replyCommentId,
  });

  if (rank === 1) {
    const commentRepo = db.getRepository(Comment);
    const comment = new Comment();
    comment.content = content;
    comment.create_time = new Date();
    comment.update_time = new Date();
    comment.rank = 1;
    if (user) {
      comment.user = user;
    }
    if (article) {
      comment.article = article;
    }
    const resComment = await commentRepo.save(comment);

    if (resComment) {
      res.status(200).json({
        code: 0,
        msg: '发表成功',
        data: resComment,
      });
    } else {
      res.status(200).json({
        ...EXCEPTION_COMMENT.PUBLISH_FAILED,
      });
    }
  } else {
    const relCommentRepo = db.getRepository(RelatedComment);
    const relComment = new RelatedComment();
    relComment.content = content;
    relComment.create_time = new Date();
    relComment.update_time = new Date();
    relComment.rank = rank;
    if (user) {
      relComment.user = user;
    }
    if (rel_user) {
      relComment.rel_user = rel_user;
    }
    if (rel_comment) {
      relComment.rel_comment = rel_comment;
    }

    const resRelComment = await relCommentRepo.save(relComment);

    if (resRelComment) {
      res.status(200).json({
        code: 0,
        msg: '发表成功',
        data: resRelComment,
      });
    } else {
      res.status(200).json({
        ...EXCEPTION_COMMENT.PUBLISH_FAILED,
      });
    }
  }
}
