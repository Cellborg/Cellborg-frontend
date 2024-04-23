import dynamic from 'next/dynamic';
const HomeLayout = dynamic(() => import('../components/HomeLayout'), {ssr: false});
const Hero = dynamic(() => import('../components/Hero'), {ssr: false});

export default function Home() {
  return (
    <>
      <HomeLayout>
        <title>Cellborg</title>
        <Hero />
      </HomeLayout>
    </>
  );
};