import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import request from 'service/fetch';
import { message } from 'antd';
import { IArticle } from 'pages/api/index';
import { markdownToTxt } from 'markdown-to-txt';
import classnames from 'classnames';
import styles from './index.module.scss';

interface IProps {
  article: IArticle;
  isEdit?: boolean;
}

const Article = (props: IProps) => {
  const { article, isEdit = false } = props;
  const { user, tags } = article;
  const { push, reload } = useRouter();

  const handleGoToEditBlog = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    push({ pathname: `/editor/${article.id}`, query: { isEdit: isEdit } });
  };

  const handleDeleteBlog = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    request
      .delete('/api/article/delete', {
        params: {
          id: article.id,
        },
      })
      .then((res: any) => {
        if (res?.code === 0) {
          message.success('删除成功');
          reload();
        } else {
          message.error(res?.msg || '删除失败');
        }
      });
  };

  return (
    <Link href={`/detail/${article.id}`} passHref>
      <div className={classnames(isEdit ? styles['active'] : styles.container)}>
        <div className={styles.article}>
          <span className={styles.title}>{article?.title}</span>
          <div className={styles.Info}>
            <i className="iconfont icon-my-fill" />
            <span className={styles.name}>{user?.nickname}</span>
            <i className="iconfont icon-time-fill" />
            <span className={styles.date}>
              {formatDistanceToNow(new Date(article?.update_time))}
            </span>
            {tags?.length > 0 ? (
              <>
                <i className="iconfont icon-news-hot-fill" />
                <span className={styles.tag}>
                  {tags?.map((i) => i.title).join(' · ')}
                </span>
              </>
            ) : null}
            <i className="iconfont icon-attention-fill" />
            <span className={styles.item}>{article?.views}</span>
          </div>
          <p className={styles.content}>{markdownToTxt(article?.content)}</p>
        </div>
        {isEdit ? (
          <div className={styles.editArea}>
            <div
              className={styles.button}
              onClick={(e) => handleGoToEditBlog(e)}
            >
              <i className="iconfont icon-edit" />
              <span>编辑博客</span>
            </div>
            <div className={styles.button} onClick={(e) => handleDeleteBlog(e)}>
              <i className="iconfont icon-delete-fill" />
              <span>删除博客</span>
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
};

export default Article;
