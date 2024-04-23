import AnimatedNav from './AnimatedNav';

function HomeLayout({ children }) {
  return (
    <div>
      <AnimatedNav />
      <main>{children}</main>
    </div>
  );
}

export default HomeLayout;
