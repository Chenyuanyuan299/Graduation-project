import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextApiRequest } from 'next';
import { prepareConnection } from 'db/index';
import { Article, User } from 'db/entity';
import { IArticle, IUserInfo } from 'pages/api/index';
import styles from './index.module.scss';
import ArticleList from 'components/Article';
import request from 'service/fetch';
import classnames from 'classnames';

interface IProps {
  articles: IArticle[];
  userInfo: IUserInfo;
}

export async function getServerSideProps(context: {
  params: any,
  req: NextApiRequest,
}) {
  const { params = {}, req } = context;
  const loginId = req?.cookies?.id;
  const userId = params?.id;
  if (loginId === userId) {
    const db = await prepareConnection();
    const user = await db.getRepository(User).findOne({
      where: {
        id: Number(userId),
      },
    });
    const articles = await db.getRepository(Article).find({
      where: {
        is_delete: false,
        user: {
          id: Number(userId),
        },
      },
      relations: ['user', 'tags'],
    });

    return {
      props: {
        userInfo: JSON.parse(JSON.stringify(user)),
        articles: JSON.parse(JSON.stringify(articles)),
      },
    };
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}

const ManageArticle = (props: IProps) => {
  const { userInfo, articles = [] } = props;
  const { query, push } = useRouter();
  const [selectTag, setSelectTag] = useState(Number(query.firstShow));
  const [showAricles, setShowAricles] = useState([...articles]);

  const handleSelectTag = (e: any) => {
    const { tagid } = e?.target?.dataset || {};
    setSelectTag(Number(tagid));
  };

  const handleBackToPersonal = () => {
    push(`/user/${userInfo.id}`);
  };

  useEffect(() => {
    if (selectTag === 0) {
      request
        .get(`/api/article/get?user_id=${userInfo.id}`)
        .then((res: any) => {
          if (res?.code === 0) {
            setShowAricles(res?.data);
          }
        });
    } else {
      selectTag &&
        request
          .get(`/api/article/get?tag_id=${selectTag}&user_id=${userInfo.id}`)
          .then((res: any) => {
            if (res?.code === 0) {
              setShowAricles(res?.data);
            }
          });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectTag]);

  const tagMap = new Map();
  articles.map((i) => {
    for (const tag of i.tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag.title);
      }
    }
  });
  const tags = Array.from(tagMap);

  const randomColor = () => {
    let color = 'rgb(';
    for (let i = 0; i < 3; i++) {
      color += Math.round(Math.random() * 256) + ',';
    }
    color = color.substring(0, color.length - 1) + ')';
    return color;
  };

  return (
    <div className="content-layout">
      <div className={styles.container}>
        <div className={styles.back} onClick={handleBackToPersonal}>
          <i className="iconfont icon-arrow-left-1-icon" />
          <span>返回个人中心</span>
        </div>
        <div className={styles.tags} onClick={handleSelectTag}>
          <span
            data-tagid={0}
            className={classnames(
              styles.tag,
              selectTag === 0 ? styles['active'] : ''
            )}
            style={{ backgroundColor: randomColor() }}
          >
            全部
          </span>
          {tags?.map((tag) => (
            <span
              data-tagid={tag[0]}
              key={tag[0]}
              className={classnames(
                styles.tag,
                selectTag === tag[0] ? styles['active'] : ''
              )}
              style={{ backgroundColor: randomColor() }}
            >
              {tag[1]}
            </span>
          ))}
        </div>
        <div className={styles.blogList}>
          {showAricles?.map((article) => (
            <div key={article.id}>
              <ArticleList article={article} isEdit={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageArticle;
