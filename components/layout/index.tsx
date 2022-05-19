import type { NextPage } from 'next';
import Navbar from '../Navbar';

const Layout: NextPage = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
