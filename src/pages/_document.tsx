import { Head, Html, Main, NextScript } from 'next/document';

export default function Document(props: any) {

  return (
    <Html translate='no'>
      <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no' />
      <Head>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
