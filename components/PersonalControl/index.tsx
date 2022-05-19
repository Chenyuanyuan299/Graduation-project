import styles from './index.module.scss';
import { IArticle, IUserInfo } from 'pages/api/index';
import { useRouter } from 'next/router';
import classnames from 'classnames';

interface IProps {
  loginId: number;
  articles: IArticle[];
  userInfo: IUserInfo;
}

const PersonalControl = (props: IProps) => {
  const { loginId, userInfo, articles = [] } = props;
  const { push } = useRouter();
  const tagMap = new Map();
  articles.map((i) => {
    for (const tag of i.tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag.title);
      }
    }
  });
  const tags = Array.from(tagMap);
  const viewsCount = articles?.reduce(
    (prev: any, next: any) => prev + next?.views,
    0
  );
  const like_counts = articles?.reduce(
    (prev: any, next: any) => prev + next?.like_counts,
    0
  );

  const randomColor = () => {
    let color = 'rgb(';
    for (let i = 0; i < 3; i++) {
      color += Math.round(Math.random() * 256) + ',';
    }
    color = color.substring(0, color.length - 1) + ')';
    return color;
  };

  const handleGotoNewPage = () => {
    push('/editor/new');
  };

  const handleGotoEditBlogPage = (id: number) => {
    push({ pathname: `/manage/${userInfo?.id}`, query: { firstShow: id } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.achievementsArea}>
          <i className="iconfont icon-chengjiu" />
          <span>个人成就</span>
          <div className={styles.achievements}>
            <div className={styles.achievement}>
              <div className={styles.achievementTitle}>文章数</div>
              <div>{articles.length}</div>
            </div>
            <div className={styles.achievement}>
              <div className={styles.achievementTitle}>阅读数</div>
              <div>{viewsCount}</div>
            </div>
            <div className={styles.achievement}>
              <div className={styles.achievementTitle}>点赞数</div>
              <div>{like_counts}</div>
            </div>
          </div>
        </div>
        {Number(loginId) === Number(userInfo.id) ? (
          <>
            <div className={styles.tagsArea}>
              <i className="iconfont icon-news-hot-fill" />
              <span>文章标签</span>
              <div className={styles.tags}>
                <span
                  className={styles.tag}
                  style={{ backgroundColor: randomColor() }}
                  onClick={() => {
                    handleGotoEditBlogPage(0);
                  }}
                >
                  全部
                </span>
                {tags?.map((i) => (
                  <span
                    className={styles.tag}
                    style={{ backgroundColor: randomColor() }}
                    key={i[0]}
                    onClick={() => {
                      handleGotoEditBlogPage(i[0]);
                    }}
                  >
                    {i[1]}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.button} onClick={handleGotoNewPage}>
              新建博客
            </div>
            <div
              className={styles.button}
              onClick={() => {
                handleGotoEditBlogPage(0);
              }}
            >
              编辑所有博客
            </div>
          </>
        ) : (
          <div className={styles.tagsArea}>
            <i className="iconfont icon-news-hot-fill" />
            <span>文章标签</span>
            <div className={classnames(styles['static-tags'])}>
              {tags?.map((i) => (
                <span
                  className={styles.tag}
                  style={{ backgroundColor: randomColor() }}
                  key={i[0]}
                >
                  {i[1]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalControl;
