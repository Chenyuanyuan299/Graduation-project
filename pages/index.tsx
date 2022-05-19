import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import classnames from 'classnames';
import { prepareConnection } from 'db/index';
import { Article, Tag } from 'db/entity';
import { IArticle, ITag } from 'pages/api/index';
import request from 'service/fetch';
import styles from 'pages/index.module.scss';
import AdminControl from 'components/AdminControl/index';

const DynamicComponent = dynamic(() => import('components/Article'));

interface IProps {
  articles: IArticle[];
  tags: ITag[];
}

export async function getServerSideProps() {
  const db = await prepareConnection();
  const articles = await db.getRepository(Article).find({
    where: { is_delete: false, is_draft: false },
    relations: ['user', 'tags'],
    order: {
      update_time: 'DESC',
    },
  });
  const tags = await db.getRepository(Tag).find({
    relations: ['users'],
  });

  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles)) || [],
      tags: JSON.parse(JSON.stringify(tags)) || [],
    },
  };
}

const Home = (props: IProps) => {
  const { articles, tags } = props;
  const [selectTag, setSelectTag] = useState(0);
  const [showAricles, setShowAricles] = useState([...articles]);

  const handleSelectTag = (e: any) => {
    const { tagid } = e?.target?.dataset || {};
    setSelectTag(Number(tagid));
  };

  useEffect(() => {
    if (selectTag === 0) {
      request.get(`/api/article/get`).then((res: any) => {
        if (res?.code === 0) {
          setShowAricles(res?.data);
        }
      });
    } else {
      selectTag &&
        request.get(`/api/article/get?tag_id=${selectTag}`).then((res: any) => {
          if (res?.code === 0) {
            setShowAricles(res?.data);
          }
        });
    }
  }, [selectTag]);

  return (
    <div className="content-layout">
      <div className={styles.tagsBlock}>
        <div className={styles.tags} onClick={handleSelectTag}>
          <div
            data-tagid={0}
            className={classnames(
              styles.tag,
              selectTag === 0 ? styles['active'] : ''
            )}
          >
            全部
          </div>
          {tags?.map((tag) => (
            <div
              key={tag?.id}
              data-tagid={tag?.id}
              className={classnames(
                styles.tag,
                selectTag === tag?.id ? styles['active'] : ''
              )}
            >
              {tag?.title}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.blogHome}>
        <div className={styles.blogList}>
          {showAricles?.map((article) => (
            <div key={article.id}>
              <DynamicComponent article={article} />
            </div>
          ))}
        </div>
        <AdminControl />
      </div>
    </div>
  );
};

export default Home;
