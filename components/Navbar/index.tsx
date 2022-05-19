import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar } from 'antd';
import Login from 'components/Login/index';
import styles from './index.module.scss';
import { navsInLogin, navs } from './config';
import { useState } from 'react';
import { useStore } from 'store/index';
import { observer } from 'mobx-react-lite';
import request from 'service/fetch';

const NavBar: NextPage = () => {
  const store = useStore();
  const { id, avatar, nickname } = store.user.userInfo;
  const { pathname, push } = useRouter();
  const [isShowLogin, setIsShowLogin] = useState(false);

  const handleGotoPersonalPage = () => {
    push(`/user/${id}`);
  };

  const handleLogin = () => {
    setIsShowLogin(true);
  };

  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) => {
      if (res?.code === 0) {
        store.user.setUserInfo({ id: 0 });
        push('/');
      }
    });
  };

  const handleClose = () => {
    setIsShowLogin(false);
  };

  return (
    <div className={styles.navbar}>
      {id ? (
        <>
          <section className={styles.adminArea}>
            <Avatar src={avatar} size={40} />
            <span>{nickname}</span>
          </section>
          <section className={styles.linkArea}>
            {navsInLogin?.map((nav) => (
              <Link key={nav?.label} href={nav?.value}>
                <a className={pathname === nav.value ? styles.active : ''}>
                  {nav?.label}
                </a>
              </Link>
            ))}
          </section>
          <section className={styles.operationArea}>
            <div className={styles.personal}>
              <i className="iconfont icon-zhanghao" />
              <span onClick={handleGotoPersonalPage}>个人中心</span>
            </div>
            <div className={styles.logout}>
              <i className="iconfont icon-tuichu" />
              <span onClick={handleLogout}>退出登录</span>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className={styles.logoArea}>Blog</section>
          <section className={styles.linkArea}>
            {navs?.map((nav) => (
              <Link key={nav?.label} href={nav?.value}>
                <a className={pathname === nav.value ? styles.active : ''}>
                  {nav?.label}
                </a>
              </Link>
            ))}
          </section>
          <section className={styles.operationArea}>
            <button className={styles.loginButton} onClick={handleLogin}>
              登录
            </button>
          </section>
        </>
      )}
      <Login isShow={isShowLogin} onClose={handleClose} />
    </div>
  );
};

export default observer(NavBar);
