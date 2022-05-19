import { useState } from 'react';
import { useStore } from 'store/index';
import { useRouter } from 'next/router';
import { Avatar, Input, Button, message } from 'antd';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { IRelatedComment, IComment, IUserInfo } from 'pages/api';
import styles from './index.module.scss';
import classnames from 'classnames';
import request from 'service/fetch';

interface IProps {
  comments: IComment[];
  setComments: Function;
  article_user_id: number;
  commentsCount: number;
  setCommentsCount: Function;
}

const Comment = (props: IProps) => {
  const {
    comments,
    setComments,
    article_user_id,
    commentsCount,
    setCommentsCount,
  } = props;
  const { push } = useRouter();
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;
  const loginId = Number(loginUserInfo?.id);
  const [selectFunc, setSelectFunc] = useState('like');
  // 回复框控制
  const [replyShow, setReplyShow] = useState(false);
  // 被回复的根评论 ID
  const [rootId, setRootId] = useState(0);
  // 被回复的评论 ID
  const [replyId, setReplyId] = useState(0);
  // 被回复的用户
  const [replyUser, setReplyUser] = useState({ id: 0 });

  // 回复框的默认值
  const [placeholder, setPlaceholder] = useState('');
  // 回复框内容
  const [inputVal, setInputVal] = useState('');
  // 该条评论等级
  const [commentRank, setCommentRank] = useState(0);

  const renderRelatedCommend = (comment: IComment) => {
    return comment?.related_comments?.map((relatedComment: IRelatedComment) => (
      <div className={styles.relatedComment} key={relatedComment?.id}>
        <div className={styles.avatar}>
          <Avatar src={relatedComment?.user?.avatar} size={24} />
        </div>
        <div className={styles.main}>
          <span className={styles.relname}>
            {relatedComment?.user?.nickname}
          </span>
          {relatedComment?.rank === 3 ? (
            <span className={styles.reluser}>
              <span>回复 </span>
              <span
                className={styles.relname}
                onClick={() =>
                  handleGoToPersonalPage(relatedComment?.rel_user?.id)
                }
              >
                @{relatedComment?.rel_user?.nickname}：
              </span>
            </span>
          ) : null}
          <span className={styles.relcontent}>{relatedComment?.content}</span>
          <div className={styles.relinfo}>
            <div className={styles.date}>
              {format(
                new Date(relatedComment?.create_time),
                'yyyy-MM-dd hh:mm:ss'
              )}
            </div>
            {relatedComment?.like_users?.find((user) => user.id === loginId) ? (
              <div
                className={classnames(styles['is_like'])}
                onClick={() =>
                  handleUnLike(
                    relatedComment?.rank,
                    relatedComment?.id,
                    comment?.id
                  )
                }
              >
                <i className="iconfont icon-dianzan" />
                <span>{relatedComment?.like_counts}</span>
              </div>
            ) : (
              <div
                className={styles.like}
                onClick={() =>
                  handleLike(
                    relatedComment?.rank,
                    relatedComment?.id,
                    comment?.id
                  )
                }
              >
                <i className="iconfont icon-dianzan" />
                <span>{relatedComment?.like_counts}</span>
              </div>
            )}
            <div
              className={styles.replyComment}
              onClick={() =>
                handleReply(
                  comment?.id,
                  relatedComment?.id,
                  relatedComment?.user,
                  3
                )
              }
            >
              回复
            </div>
            {article_user_id === loginId ||
            relatedComment.user.id === loginId ? (
              <div
                className={styles.delete}
                onClick={() =>
                  handleDelete(
                    relatedComment?.rank,
                    relatedComment?.id,
                    comment?.id
                  )
                }
              >
                <i className="iconfont icon-delete" />
                <span>删除</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ));
  };

  const handleGoToPersonalPage = (id: number) => {
    push(`/user/${id}`);
  };

  const handleSortCommentByTime = () => {
    setSelectFunc('time');
    const sortComments = [...comments];
    sortComments.sort((a, b) => b.id - a.id);
    setComments(sortComments);
  };

  const handleSortCommentByLike = () => {
    setSelectFunc('like');
    const sortComments = [...comments];
    sortComments.sort((a, b) => b.like_counts - a.like_counts);
    setComments(sortComments);
  };

  // 控制回复框的函数
  const handleReply = (
    rootId: number, // 根评论 ID
    id: number, // 被回复评论 ID
    user: IUserInfo, // 被回复用户
    rank: number // 新建评论的等级：2 | 3
  ) => {
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const str = `回复 @${user.nickname}：`;
    setRootId(rootId);
    setInputVal('');
    setCommentRank(rank);
    setReplyId(id);
    if (!replyUser.id || user.id !== replyUser.id || (rank === commentRank && replyId !== id)) {
      setReplyUser(user);
      setReplyShow(true);
      setPlaceholder(str);
    } else {
      setReplyUser({ id: 0 });
      setReplyShow(false);
      setPlaceholder('');
      setCommentRank(0);
    }
  };

  const handleLike = (rank: number, id: number, rootId: number) => {
    // rank 被点赞评论等级
    // id 被点赞评论 id，分为 comment 和 related_comment
    // rootId 根评论 id
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const newComments = [...comments];
    const newLikeUser = JSON.parse(JSON.stringify(loginUserInfo));
    newLikeUser.id = Number(newLikeUser.id);
    if (rank === 1) {
      newComments.map((comment) => {
        if (id === comment.id) {
          comment.like_users = comment.like_users.concat([newLikeUser]);
          comment.like_counts++;
        }
      });
    } else {
      newComments.map((comment) => {
        // 先找到根评论
        if (rootId === comment.id) {
          comment.related_comments.map((rel_comment) => {
            // 再找到对应评论
            if (rel_comment.id === id) {
              rel_comment.like_users = rel_comment.like_users.concat([
                newLikeUser,
              ]);
              rel_comment.like_counts++;
            }
          });
        }
      });
    }
    setComments(newComments);
    request
      .post('/api/comment/like', {
        commentId: id,
        rank: rank,
        type: 'like',
      })
      .then((res: any) => {
        if (res?.code !== 0) {
          message.error('点赞失败，请检查您的网络');
        }
      });
  };

  const handleUnLike = (rank: number, id: number, rootId: number) => {
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    const newComments = [...comments];
    if (rank === 1) {
      newComments.map((comment) => {
        if (id === comment.id) {
          comment.like_users = comment.like_users.filter(
            (user) => user.id !== loginId
          );
          comment.like_counts--;
        }
      });
    } else {
      newComments.map((comment) => {
        // 先找到根评论
        if (rootId === comment.id) {
          comment.related_comments.map((rel_comment) => {
            // 再找到对应评论
            if (rel_comment.id === id) {
              rel_comment.like_users = rel_comment.like_users.filter(
                (user) => user.id !== loginId
              );
              rel_comment.like_counts--;
            }
          });
        }
      });
    }
    setComments(newComments);
    request
      .post('/api/comment/like', {
        commentId: id,
        rank: rank,
        type: 'unlike',
      })
      .then((res: any) => {
        if (res?.code !== 0) {
          message.error('取消失败，请检查您的网络');
        }
      });
  };

  const handleComment = () => {
    // console.log('rootId', rootId);
    // console.log('回复谁', replyUser);
    // console.log('内容', inputVal);
    // console.log('等级', commentRank);
    if (!loginId) {
      message.warning('请先登录');
      return;
    }
    // 新建一条嵌套评论，有两种等级
    const newRelComment: IRelatedComment = {
      id: Infinity,
      rel_comment_id: rootId,
      create_time: new Date(),
      update_time: new Date(),
      content: inputVal,
      rank: commentRank,
      like_counts: 0,
      like_users: [],
      is_delete: false,
      user: {
        id: Number(loginUserInfo?.id),
        avatar: loginUserInfo?.avatar,
        nickname: loginUserInfo?.nickname,
      },
      rel_user: replyUser,
    };
    const newComments = [...comments];
    newComments.map((comment) => {
      if (comment.id === rootId) {
        comment.related_comments.push(newRelComment);
      }
    });
    setComments(newComments);
    setCommentsCount(commentsCount + 1);
    setReplyShow(false);
    setInputVal('');
    request
      .post('/api/comment/publish', {
        replyCommentId: rootId,
        replyUserId: replyUser.id,
        content: inputVal,
        rank: commentRank,
      })
      .then((res: any) => {
        if (res?.code === 0) {
          message.success('发表成功');
        } else {
          message.error('发表失败');
        }
      });
  };

  const handleDelete = (rank: number, id: number, rootId: number) => {
    let newComments = [...comments];
    if (rank === 1) {
      newComments = newComments.filter((comment) => comment.id !== id);
    } else {
      newComments.map((comment) => {
        if (comment.id === rootId) {
          comment.related_comments = comment.related_comments.filter(
            (rel_comment) => rel_comment.id !== id
          );
        }
      });
    }
    setComments(newComments);
    request
      .post('/api/comment/delete', {
        commentId: id,
        rank: rank,
      })
      .then((res: any) => {
        if (res?.code !== 0) {
          message.error('删除失败，请检查您的网络');
        }
      });
  };

  return (
    <div className={styles.commentArea}>
      <div className={styles.sort}>
        <div
          className={classnames(
            styles.sortFunc,
            selectFunc === 'like' ? styles['selectFunc'] : ''
          )}
          onClick={handleSortCommentByLike}
        >
          按热度排序
        </div>
        <div
          className={classnames(
            styles.sortFunc,
            selectFunc === 'time' ? styles['selectFunc'] : ''
          )}
          onClick={handleSortCommentByTime}
        >
          按时间排序
        </div>
      </div>
      {comments?.map((comment: IComment) => (
        <div className={styles.comment} key={comment?.id}>
          <div className={styles.commentContent}>
            <div className={styles.avatar}>
              <Avatar src={comment?.user?.avatar} size={48} />
            </div>
            <div className={styles.main}>
              <div className={styles.name}>{comment?.user?.nickname}</div>
              <div className={styles.content}>{comment?.content}</div>
              <div className={styles.info}>
                <div className={styles.date}>
                  {format(
                    new Date(comment?.create_time),
                    'yyyy-MM-dd hh:mm:ss'
                  )}
                </div>
                {comment?.like_users?.find((user) => user.id === loginId) ? (
                  <div
                    className={classnames(styles['is_like'])}
                    onClick={() =>
                      handleUnLike(comment?.rank, comment?.id, comment?.id)
                    }
                  >
                    <i className="iconfont icon-dianzan" />
                    <span>{comment?.like_counts}</span>
                  </div>
                ) : (
                  <div
                    className={styles.like}
                    onClick={() =>
                      handleLike(comment?.rank, comment?.id, comment?.id)
                    }
                  >
                    <i className="iconfont icon-dianzan" />
                    <span>{comment?.like_counts}</span>
                  </div>
                )}
                <div
                  className={styles.replyComment}
                  onClick={() =>
                    handleReply(comment?.id, comment?.id, comment?.user, 2)
                  }
                >
                  回复
                </div>
                {article_user_id === loginId || comment.user.id === loginId ? (
                  <div
                    className={styles.delete}
                    onClick={() =>
                      handleDelete(comment?.rank, comment?.id, comment?.id)
                    }
                  >
                    <i className="iconfont icon-delete" />
                    <span>删除</span>
                  </div>
                ) : null}
              </div>
              <div className={styles.relatedCommendArea}>
                {renderRelatedCommend(comment)}
              </div>
            </div>
          </div>
          {loginId && replyShow && rootId === comment?.id ? (
            <div className={styles.enter}>
              <div className={styles.avatar}>
                <Avatar src={loginUserInfo.avatar} size={48} />
              </div>
              <Input.TextArea
                placeholder={placeholder}
                rows={3}
                value={inputVal}
                onChange={(event) => setInputVal(event?.target?.value)}
              />
              <Button type="primary" onClick={handleComment}>
                发表评论
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default observer(Comment);
