import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'pages/api/config/index';
import { prepareConnection } from 'db/index';
import { Article, Tag } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/resCode';

export default withIronSessionApiRoute(update, ironOptions);

async function update(req: NextApiRequest, res: NextApiResponse) {
  const { title = '', content = '', id = 0, tagIds = [] } = req.body;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const tagRepo = db.getRepository(Tag);

  const tags = await tagRepo.find({
    where: tagIds?.map((tagId: number) => ({ id: tagId })),
  });

  const newTags = tags?.map((tag) => {
    tag.article_count = tag?.article_count + 1;
    return tag;
  });

  const article = await articleRepo.findOne({
    where: {
      id,
    },
    relations: ['user'],
  });

  // 发布后，更新为草稿，再次发布
  if (article && article?.is_draft && article.rel_id) {
    // 找到原文章
    const rel_id = article.rel_id;
    const originalArticle = await articleRepo.findOne({
      where: {
        id: rel_id,
      },
      relations: ['user'],
    });
    if (originalArticle) {
      // 更新原文章
      originalArticle.title = title;
      originalArticle.content = content;
      originalArticle.update_time = new Date();
      originalArticle.tags = newTags;
      // 删除草稿
      article.is_delete = true;

      const resOriginalArticle = await articleRepo.save(originalArticle);
      const resArticle = await articleRepo.save(article);

      if (resArticle && resOriginalArticle) {
        res
          .status(200)
          .json({ data: resOriginalArticle, code: 0, msg: '更新成功' });
      } else {
        res.status(200).json({ ...EXCEPTION_ARTICLE.UPDATE_FAILED });
      }
    } else {
      res.status(200).json({ ...EXCEPTION_ARTICLE.NOT_FOUND });
    }
    // 发布后更新发布
    // 发布为草稿后更新为发布
  } else if (article) {
    article.title = title;
    article.content = content;
    article.update_time = new Date();
    article.tags = newTags;
    article.is_draft = false;

    const resArticle = await articleRepo.save(article);

    if (resArticle) {
      res.status(200).json({ data: resArticle, code: 0, msg: '更新成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_ARTICLE.UPDATE_FAILED });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_ARTICLE.NOT_FOUND });
  }
}
