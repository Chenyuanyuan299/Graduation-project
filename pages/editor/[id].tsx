import { Editor } from '@bytemd/react'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'store/index';
import { observer } from 'mobx-react-lite';
import { mdPlugins } from 'config/editConfig'
import { message, Select, Space } from 'antd';
import styles from './index.module.scss';
import request from 'service/fetch'
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity';
import { IArticle } from 'pages/api';

interface IProps {
  article: IArticle
}

export async function getServerSideProps({ params }: any) {
  const articleID = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleID,
    },
    relations: ['user', 'tags'],
  });

  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

const ModifyEditor = ({ article }: IProps) => {
  const store = useStore();
  const { id } = store.user.userInfo;
  const { push, query, back } = useRouter();
  const articleID = query?.id
  const [ title, setTitle ] = useState(article?.title || '');
  const [ content, setContent ] = useState(article?.content || '');
  const [ tagIds, setTagIds ] = useState(article?.tags.map((i) => i.id) || [])
  const [ allTags, setAllTags ] = useState([])

  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.allTags || [])
      }
    })
  }, []);

  const handleUpdate = () => {
    if (!title) {
      message.warning('请输入文章标题')
      return;
    }
    request.post('/api/article/update', {
      id: articleID,
      title,
      content,
      tagIds
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('更新成功');
        if (query.isEdit) {
          back();
        } else {
          articleID ? push(`/detail/${articleID}`) : push('/');
        }
      } else {
        message.error(res?.msg || '更新失败');
      }
    })
  }

  const handleSaveDraft = () => {
    if (!title) {
      message.warning('请输入文章标题')
      return;
    }
    request.post('/api/article/save', {
      id: articleID,
      title,
      content,
      tagIds,
      rel_id: articleID,
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
          <button className={styles.button} onClick={handleUpdate}>发布</button>
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

(ModifyEditor as any).layout = null;

export default observer(ModifyEditor);
