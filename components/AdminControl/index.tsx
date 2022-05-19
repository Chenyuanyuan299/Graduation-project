/* eslint-disable @next/next/no-img-element */
import styles from './index.module.scss';
import { useStore } from 'store/index';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { message } from 'antd';
import TimeModule from 'components/TimeModule/index';

const AdminControl = () => {
  const store = useStore();
  const { id, avatar, nickname } = store.user.userInfo;
  const { push } = useRouter();

  const handleGotoNewPage = () => {
    if (id) {
      push('/editor/new');
    } else {
      message.warning('请先登录');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {id ? (
          <>
            <img src={avatar} className={styles.avatar} alt="头像"/>
            <TimeModule name={nickname} />
          </>
        ) : (
          <TimeModule />
        )}
      </div>
      <div className={styles.button} onClick={handleGotoNewPage}>
        新建博客
      </div>
    </div>
  );
};

export default observer(AdminControl);
