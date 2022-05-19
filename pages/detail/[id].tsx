import { useState, useRef } from 'react';
import Link from 'next/link';
import { Avatar, Input, Button, message } from 'antd';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store/index';
import MarkDown from 'markdown-to-jsx';
import { format } from 'date-fns';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity';
import { IArticle } from 'pages/api';
import styles from './index.module.scss';
import request from 'service/fetch';
import CommentArea from 'components/Comment'

interface IProps {
  article: IArticle;
}

export async function getServerSideProps({ params }: any) {
  const articleID = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleID,
    },    
    relations: [
      'user', 'like_users', 
      'comments', 
      'comments.user',
      'comments.like_users',
      'comments.related_comments', 
      'comments.related_comments.user',
      'comments.related_comments.like_users',
      'comments.related_comments.rel_user'
    ],
  });

  if (article) {
    // 阅读次数 +1
    article.views = article?.views + 1;
    await articleRepo.save(article);
  }

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

const ArticleDetail = (props: IProps) => {
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;
  const loginId = Number(loginUserInfo?.id);
  const [article, setArticle] = useState(props.article)
  const {
    user: { id, nickname, avatar },
  } = article;
  
  const [inputVal, setInputVal] = useState('');
  let _comments = [...article.comments]
  // 处理删除
  _comments = _comments.filter((comment) => comment.is_delete === false)
  _comments.map((i) => i.related_comments = i.related_comments.filter((rel_comment) => rel_comment.is_delete === false))

  // 处理排序
  _comments.map((comment) => {
    comment?.related_comments?.sort((a, b) => a.id - b.id)
  })
  _comments.sort((a, b) => b.like_counts - a.like_counts)
  const [comments, setComments] = useState(_comments || []);

  let count = comments?.length
  comments.forEach((i) => {
    count += i?.related_comments?.length || 0
  })
  const [commentsCount, setCommentsCount] = useState(count)

  const commentRef: any = useRef(null)

  const handleLike = () => {
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const newLikeUser = JSON.parse(JSON.stringify(loginUserInfo));
    newLikeUser.id = Number(newLikeUser.id);
    const newArticle = {...article}
    newArticle.like_users = newArticle.like_users.concat([newLikeUser])
    newArticle.like_counts++
    setArticle(newArticle)
    request
      .post('/api/article/like', {
        articleId: article?.id,
        type: 'like',
      })
      .then((res: any) => {
        if (res?.code !== 0) {
          message.error('点赞失败，请检查您的网络');
        }
      });
  }

  const handleUnLike =() => {
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const newArticle = {...article}
    newArticle.like_users = newArticle.like_users.filter((user) => user.id !== loginId)
    newArticle.like_counts--
    setArticle(newArticle)
    request
      .post('/api/article/like', {
        articleId: article?.id,
        type: 'unlike',
      })
      .then((res: any) => {
        if (res?.code !== 0) {
          message.error('取消失败，请检查您的网络');
        }
      });
  }

  const handleToComment = () => {
    if (commentRef?.current) {
      window.scrollTo(0, commentRef.current.offsetTop - 64)
    }
  }

  const handleComment = () => {
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const newComment = {
      id: Infinity,
      create_time: new Date(),
      update_time: new Date(),
      content: inputVal,
      rank: 1,
      like_counts: 0,
      like_users: [],
      is_delete: false,
      user: {
        id: Number(loginUserInfo?.id),
        avatar: loginUserInfo?.avatar,
        nickname: loginUserInfo?.nickname,
      },
      related_comments: [],
    }
    const newComments = [newComment].concat([...(comments as any)])
    setComments(newComments);
    setCommentsCount(commentsCount+1)
    setInputVal('');
    request
      .post('/api/comment/publish', {
        articleId: article?.id,
        content: inputVal,
        rank: 1
      })
      .then((res: any) => {
        if (res?.code === 0) {
          message.success('发表成功');
        } else {
          message.error('发表失败');
        }
      });
  };

  return (
    <div className="content-layout">
      <div className={styles.funcs}>
      {article?.like_users?.find((user) => user.id === loginId) ? (        
        <div className={classnames(styles.func, styles['is_like'])} onClick={handleUnLike}>
          <i className="iconfont icon-appreciate-light-fill"/>
          <div className={styles.like_counts}>{article.like_counts}</div>
        </div>
        ) : (        
        <div className={styles.func} onClick={handleLike}>
          <i className="iconfont icon-appreciate-light-fill"/>
          <div className={styles.like_counts}>{article.like_counts}</div>
        </div>) 
      }
        <div className={styles.func} onClick={handleToComment}>
          <i className="iconfont icon-comment-fill"/>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.article}>
          <h1 className={styles.title}>{article?.title}</h1>
          <div className={styles.user}>
            <Avatar src={avatar} size={40} />
            <div className={styles.info}>
              <div className={styles.name}>{nickname}</div>
              <div className={styles.date}>
                <div>
                  {format(new Date(article?.update_time), 'yyyy-MM-dd hh:mm:ss')}
                </div>
                <div>阅读 {article?.views}</div>
                {Number(loginUserInfo?.id) === Number(id) && (
                  <Link href={`/editor/${article?.id}`}>编辑</Link>
                )}
              </div>
            </div>
          </div>
          <MarkDown className={styles.markdown}>{article?.content}</MarkDown>
        </div>
        <div className={styles.replyArea} ref={commentRef}>
          <h3>{commentsCount} 评论</h3>
          {loginId && (
            <div className={styles.enter}>
              <div className={styles.avatar}>
                <Avatar src={loginUserInfo.avatar} size={48} />
              </div>
              <Input.TextArea
                placeholder="请输入评论"
                rows={3}
                value={inputVal}
                onChange={(event) => setInputVal(event?.target?.value)}
              />
              <Button type="primary" onClick={handleComment}>
                发表评论
              </Button>
            </div>
          )}
        <CommentArea comments={comments} setComments={setComments} article_user_id={article.user.id} commentsCount={commentsCount} setCommentsCount={setCommentsCount}/>
        </div>
      </div>
    </div>
  );
};

export default observer(ArticleDetail);