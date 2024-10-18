import {SessionProvider} from 'next-auth/react'
import { ProjectProvider } from '../components/utils/projectContext';
import { SocketProvider } from '../components/utils/socketContext';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps, session }) {
  return (
    <SessionProvider 
    session={session}
    // Re-fetch session every 10 minutes
    refetchInterval={10 * 60}
    // Re-fetches session when window is focused
    refetchOnWindowFocus={true}
    >
      <Head>
        <title>Cellborg</title>
      </Head>
      <SocketProvider>
        <ProjectProvider>
          <Component {...pageProps} />
        </ProjectProvider>
      </SocketProvider>
    </SessionProvider>
  )
}