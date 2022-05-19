import styles from './index.module.scss';
import { format } from 'date-fns';

interface IProps {
  name?: string | undefined;
}

const TimeModule = (props: IProps) => {
  const time = new Date();
  const hour = time.getHours();
  let msg = '';
  if (hour >= 0 && hour < 6) {
    msg = '夜深了，早点休息。';
  } else if (hour >= 6 && hour < 12) {
    msg = '早上好！';
  } else if (hour >= 12 && hour < 18) {
    msg = '下午好！';
  } else if (hour >= 18 && hour < 24) {
    msg = '晚上好！';
  }

  return (
    <div className={styles.container}>
      <i className="iconfont icon-like-round" />
      {props?.name ? <span>{props.name} </span> : null}
      <span>{msg}</span>
      <span className={styles.now}>
        今天是 {format(time, 'yyyy年MM月dd日')}
      </span>
    </div>
  );
};

export default TimeModule;
