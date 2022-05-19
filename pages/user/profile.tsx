import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import request from 'service/fetch';
import { useStore } from 'store/index';
import styles from './index.module.scss';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4 },
};

const UserProfile = () => {
  const [form] = Form.useForm();
  const store = useStore();
  const userInfo = store.user.userInfo;
  const { back } = useRouter();

  useEffect(() => {
    request.get('/api/user/detail').then((res: any) => {
      if (res?.code === 0) {
        form.setFieldsValue(res?.data?.userInfo);
      }
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    const newInfo = {
      ...userInfo,
      nickname: values.nickname,
    };
    request.post('/api/user/update', { ...values }).then((res: any) => {
      if (res?.code === 0) {
        store.user.setUserInfo(newInfo);
        message.success('修改成功');
      } else {
        message.error(res?.msg || '修改失败');
      }
    });
  };

  const handleBackToPersonal = () => {
    back();
  };

  return (
    <div className="content-layout">
      <div className={styles.container}>
        <div className={styles.back} onClick={handleBackToPersonal}>
          <i className="iconfont icon-arrow-left-1-icon" />
          <span>返回个人中心</span>
        </div>
        <div className={styles.userProfile}>
          <h2>个人资料</h2>
          <div>
            <Form
              {...layout}
              form={form}
              className={styles.form}
              onFinish={handleSubmit}
            >
              <Form.Item label="用户名" name="nickname">
                <Input showCount maxLength={20} placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item label="职位" name="job">
                <Input showCount maxLength={20} placeholder="请输入职位" />
              </Form.Item>
              <Form.Item label="个人介绍" name="introduce">
                <Input.TextArea
                  showCount
                  maxLength={200}
                  rows={4}
                  placeholder="请输入个人介绍"
                />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);
