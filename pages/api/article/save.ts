import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article, Tag } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(save, ironOptions);

async function save(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const {
    id = 0,
    title = '',
    content = '',
    tagIds = [],
    rel_id = 0,
  } = req.body;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const articleRepo = db.getRepository(Article);
  const tagRepo = db.getRepository(Tag);

  const user = await userRepo.findOne({
    id: session.id,
  });

  const tags = await tagRepo.find({
    where: tagIds?.map((tagId: number) => ({ id: tagId })),
  });

  if (id) {
    const article = await articleRepo.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
    // 首先根据id判断是不是草稿，如果不是，就新建
    if (article && article.is_draft === false) {
      const article = new Article();
      article.title = title;
      article.content = content;
      article.is_draft = true;
      article.create_time = new Date();
      article.update_time = new Date();
      article.rel_id = rel_id;
      article.is_delete = false;
      article.like_counts = 0;
      article.views = 0;

      if (user) {
        article.user = user;
      }

      const newTags = tags?.map((tag) => {
        tag.article_count = tag?.article_count + 1;
        return tag;
      });
      article.tags = newTags;
      const resArticle = await articleRepo.save(article);
      if (resArticle) {
        res.status(200).json({ data: resArticle, code: 0, msg: '保存成功' });
      } else {
        res.status(200).json({ ...EXCEPTION_ARTICLE.SAVE_FAILED });
      }
    } else if (article && article.is_draft === true) {
      // 如果是草稿，就更新草稿
      article.title = title;
      article.content = content;
      article.is_draft = true;
      article.update_time = new Date();

      const newTags = tags?.map((tag) => {
        tag.article_count = tag?.article_count + 1;
        return tag;
      });
      article.tags = newTags;

      const resArticle = await articleRepo.save(article);

      if (resArticle) {
        res.status(200).json({ data: resArticle, code: 0, msg: '保存成功' });
      } else {
        res.status(200).json({ ...EXCEPTION_ARTICLE.SAVE_FAILED });
      }
    }
  } else if (id === 0) {
    const article = new Article();
    article.title = title;
    article.content = content;
    article.is_draft = true;
    article.create_time = new Date();
    article.update_time = new Date();
    article.rel_id = 0;
    article.is_delete = false;
    article.like_counts = 0;
    article.views = 0;

    if (user) {
      article.user = user;
    }

    const newTags = tags?.map((tag) => {
      tag.article_count = tag?.article_count + 1;
      return tag;
    });
    article.tags = newTags;
    const resArticle = await articleRepo.save(article);
    if (resArticle) {
      res.status(200).json({ data: resArticle, code: 0, msg: '保存成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_ARTICLE.SAVE_FAILED });
    }
  }
}
