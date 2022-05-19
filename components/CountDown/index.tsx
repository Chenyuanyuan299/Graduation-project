import { useState, useEffect } from 'react';
import styles from './index.module.scss';

interface IProps {
  time: number;
  onEnd: Function;
}

const CountDown = (props: IProps) => {
  const { time, onEnd } = props;
  const [count, setCount] = useState(time || 60);

  useEffect(() => {
    const timer = setInterval(() => {
      if (count === 1) {
        clearInterval(timer);
        onEnd && onEnd();
      } else {
        setCount(count - 1);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [count, onEnd]);

  return <div className={styles.countDown}>{count}</div>;
};

export default CountDown;
