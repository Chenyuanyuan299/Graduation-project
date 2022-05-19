import Link from 'next/link';
import { useState } from 'react';
import { NextApiRequest } from 'next';
import PersonalControl from 'components/PersonalControl';
import { observer } from 'mobx-react-lite';
import { Button, Avatar, Divider } from 'antd';
import { IUserInfo, IArticle } from 'pages/api/index';
import ArticleItem from 'components/Article';
import { prepareConnection } from 'db/index';
import { User, Article } from 'db/entity';
import styles from './index.module.scss';
import classnames from 'classnames';

interface IProps {
  loginId: number;
  userInfo: IUserInfo;
  articles: IArticle[];
}

export async function getServerSideProps(context: {
  params: any,
  req: NextApiRequest,
}) {
  const { params, req } = context;
  const loginId = req.cookies.id;
  const userId = params?.id;
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
    order: {
      update_time: 'DESC',
    },
    relations: ['user', 'tags'],
  });
  return {
    props: {
      loginId: loginId,
      userInfo: JSON.parse(JSON.stringify(user)),
      articles: JSON.parse(JSON.stringify(articles)),
    },
  };
}

const UserDetail = (props: IProps) => {
  const { loginId, userInfo, articles = [] } = props;
  const publishedArticles = articles.filter(
    (article) => article.is_draft === false
  );
  const drafts = articles.filter((article) => article.is_draft === true);
  const [releaseState, setReleaseState] = useState('publish');

  return (
    <div className="content-layout">
      <div className={styles.userDetail}>
        <div className={styles.left}>
          <div className={styles.userInfo}>
            <Avatar
              className={styles.avatar}
              src={userInfo?.avatar}
              size={90}
            />
            <div>
              <div className={styles.nickname}>{userInfo?.nickname}</div>
              <div className={styles.desc}>
                <i className="iconfont icon-profile" /> {userInfo?.job}
              </div>
              <div className={styles.desc}>
                <i className="iconfont icon-edit" /> {userInfo?.introduce}
              </div>
            </div>
            {Number(loginId) === Number(userInfo.id) ? (
              <Link href="/user/profile" passHref>
                <Button>编辑个人资料</Button>
              </Link>
            ) : null}
          </div>
          <Divider />
          {Number(loginId) === Number(userInfo.id) ? (
            <>
              <div className={styles.releaseStates}>
                <div
                  className={classnames(
                    styles.releaseState,
                    releaseState === 'publish'
                      ? styles['selectReleaseState']
                      : ''
                  )}
                  onClick={() => setReleaseState('publish')}
                >
                  已发布
                </div>
                <div
                  className={classnames(
                    styles.releaseState,
                    releaseState === 'draft' ? styles['selectReleaseState'] : ''
                  )}
                  onClick={() => setReleaseState('draft')}
                >
                  草稿
                </div>
              </div>
              {releaseState === 'publish' ? (
                <div className={styles.article}>
                  {publishedArticles?.map((article: any) => (
                    <div key={article?.id}>
                      <ArticleItem article={article} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.article}>
                  {drafts?.map((article: any) => (
                    <div key={article?.id}>
                      <ArticleItem article={article} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.article}>
              {articles?.map((article: any) => (
                <div key={article?.id}>
                  <ArticleItem article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
        <PersonalControl
          articles={articles}
          userInfo={userInfo}
          loginId={loginId}
        />
      </div>
    </div>
  );
};

export default observer(UserDetail);
