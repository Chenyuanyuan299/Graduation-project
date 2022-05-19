import { IUserInfo } from 'pages/api/index';

export interface IUserStore {
  userInfo: IUserInfo;
  // eslint-disable-next-line no-unused-vars
  setUserInfo: (value: IUserInfo) => void;
}

const userStore = (): IUserStore => {
  return {
    userInfo: { id: 0 },
    setUserInfo: function (value) {
      this.userInfo = value;
    },
  };
};

export default userStore;
