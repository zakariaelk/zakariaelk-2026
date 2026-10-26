// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://leiby-design-build.netlify.app',
  integrations: [react(), markdoc(), keystatic()],
  adapter: netlify({ imageCDN: false, devFeatures: { images: false, edgeFunctions: false, environmentVariables: false } }),
  // Pages from the earlier agency version.
  redirects: {
    '/projects': '/',
    '/services': '/',
    '/blog': '/',
    '/contact': '/',
    '/portrait': '/',
    // the video test and the short INSO case became the main versions (19 Oct 2026)
    '/tests/one-alert': '/',
    '/tests/one-alert/work/mitigating-risk-with-location-based-alerts': '/work/mitigating-risk-with-location-based-alerts/',
    // the Simple format became the main INSO case (26 Oct 2026); its test address now lands there
    '/work/mitigating-risk-with-location-based-alerts-simple': '/work/mitigating-risk-with-location-based-alerts/',
  },
  prefetch: {
    prefetchAll: true,
  },
});
