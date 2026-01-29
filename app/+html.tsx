import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// This file only runs on the server while rendering HTML for web.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Disable body scrolling to make ScrollView behave like on native by default */}
        <ScrollViewStyleReset />

        {/* Add any global head elements for all pages here */}
      </head>
      <body>{children}</body>
    </html>
  );
}
