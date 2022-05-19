import { Editor } from '@bytemd/react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'store/index';
import { observer } from 'mobx-react-lite';
import { mdPlugins } from 'config/editConfig'
import { message, Select, Space } from 'antd';
import styles from './index.module.scss';
import request from 'service/fetch'

const MDEditor = () => {
  const store = useStore();
  const { id } = store.user.userInfo;
  const { push } = useRouter();
  const [ title, setTitle ] = useState('');
  const [ content, setContent ] = useState('');
  const [ tagIds, setTagIds ] = useState([])
  const [ allTags, setAllTags ] = useState([])

  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.allTags || [])
      }
    })
  }, []);

  const handlePublish = () => {
    if (!title) {
      message.warning('请输入文章标题')
      return;
    }
    request.post('/api/article/publish', {
      title,
      content,
      tagIds
    }).then((res: any) => {
      if (res?.code === 0) {
        id ? push(`/user/${id}`) : push('/');
        message.success('发布成功');
      } else {
        message.error(res?.msg || '发布失败');
      }
    })
  }

  const handleSaveDraft = () => {
    if (!title) {
      message.warning('请输入文章标题')
      return;
    }
    request.post('/api/article/save', {
      title,
      content,
      tagIds,
    }).then((res: any) => {
      if (res?.code === 0) {
        id ? push(`/user/${id}`) : push('/');
        message.success('保存成功');
      } else {
        message.error(res?.msg || '保存失败');
      }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.operations}>
        <input 
          className={styles.title} 
          placeholder="输入文章标题..." 
          value={title} 
          onChange={(e) => {
            setTitle(e?.target?.value)
          }}
        />
        <div className={styles.operation}>
          <Space direction="vertical" className={styles.space}>
            <Select 
              className={styles.select}
              mode="multiple" 
              allowClear 
              placeholder="请选择标签" 
              value={tagIds}
              onChange={(v) => {
                setTagIds(v)
              }}
              maxTagCount="responsive"
            >
              {allTags.map((tag: any) => (
                <Select.Option key={tag?.id} value={tag?.id}>{tag?.title}</Select.Option>
              ))}
            </Select>
          </Space>
          <button className={styles.button} onClick={handlePublish}>发布</button>
          <button className={styles.button} onClick={handleSaveDraft}>保存为草稿</button>
        </div>
      </div>
      <Editor 
        locale={mdPlugins.language}
        plugins={mdPlugins.plugins} 
        value={content} 
        onChange={(v) => {
          setContent(v)
        }} 
      />
    </div>
  );
};

(MDEditor as any).layout = null;

export default observer(MDEditor);
