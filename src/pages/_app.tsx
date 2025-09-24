import type { AppProps } from 'next/app';
import '../styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
};
export default App;
