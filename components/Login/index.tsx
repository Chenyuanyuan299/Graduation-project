import { ChangeEvent, useState } from 'react';
import styles from './index.module.scss';
import { message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CountDown from 'components/CountDown';
import request from 'service/fetch';
import { useStore } from 'store/index';
import { observer } from 'mobx-react-lite';

interface IProps {
  isShow: boolean;
  onClose: Function;
}

// client-id
// 213f2e49fbe19ba0fcf8

// client-secret
// ee15cb2cd7717ad3c73325557f0e8e12b63df9c1

const Login = (props: IProps) => {
  const store = useStore();
  const { isShow = false, onClose } = props;
  const [form, setForm] = useState({ phone: '', verify: '' });
  const [isShowVerifyCountDown, setIsShowVerifyCountDown] = useState(false);

  const handleClose = () => {
    onClose && onClose();
  };

  const handleGetVerifyCode = () => {
    if (!form?.phone) {
      message.warning('请输入手机号');
      return;
    }

    request
      .post('/api/user/sendVerifyCode', {
        to: form?.phone,
        templateId: 1,
      })
      .then((res: any) => {
        if (res?.code === 0) {
          setIsShowVerifyCountDown(true);
        } else {
          message.error(res?.msg || '未知错误');
        }
      });
  };

  const handleLogin = () => {
    request
      .post('/api/user/login', {
        ...form,
        identity_type: 'phone',
      })
      .then((res: any) => {
        if (res?.code === 0) {
          store.user.setUserInfo(res?.data);
          setForm({ phone: '', verify: '' });
          onClose && onClose();
        } else {
          message.error(res?.msg || '未知错误');
        }
      });
  };

  const handleOAuthGithub = () => {
    const githubClientID = '213f2e49fbe19ba0fcf8';
    const redirectUri = 'http://localhost:3000/api/oauth/redirect';
    const url = `https://github.com/login/oauth/authorize?client_id=${githubClientID}&redirect_uri=${redirectUri}`;
    window.location.href = url;
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleCountDownEnd = () => {
    setIsShowVerifyCountDown(false);
  };

  return isShow ? (
    <div className={styles.loginArea}>
      <div className={styles.loginBox}>
        <div className={styles.loginTitle}>
          <div>手机登录</div>
          <div className={styles.close} onClick={handleClose}>
            <CloseOutlined />
          </div>
        </div>
        <input
          name="phone"
          type="text"
          placeholder="请输入手机号"
          value={form.phone}
          onChange={handleFormChange}
        />
        <div className={styles.verifyCodeArea}>
          <input
            name="verify"
            type="text"
            placeholder="请输入验证码"
            value={form.verify}
            onChange={handleFormChange}
          />
          <span className={styles.verifyCode} onClick={handleGetVerifyCode}>
            {isShowVerifyCountDown ? (
              <CountDown time={10} onEnd={handleCountDownEnd} />
            ) : (
              '获取验证码'
            )}
          </span>
        </div>
        <div className={styles.loginBtn} onClick={handleLogin}>
          登录
        </div>
        <div className={styles.otherLogin} onClick={handleOAuthGithub}>
          使用 GitHub 登录
        </div>
        <div className={styles.loginPrivacy}>
          注册登录即表示同意&nbsp;
          <a
            href="https://lf3-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/juejin/86857833-55f6-4d9e-9897-45cfe9a42be4.html"
            target="_blank"
            rel="noreferrer"
          >
            用户协议
          </a>
          、
          <a
            href="https://lf3-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/juejin/7b28b328-1ae4-4781-8d46-430fef1b872e.html"
            target="_blank"
            rel="noreferrer"
          >
            隐私政策
          </a>
        </div>
      </div>
    </div>
  ) : null;
};

export default observer(Login);
