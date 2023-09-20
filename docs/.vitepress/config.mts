import { defineConfig } from 'vitepress'
import { version } from '../../package.json'
import { description, name, ogImage, ogUrl } from './meta';

export default defineConfig({
  title: "feathers-auth-mgmt",
  description:
    "Sign up verification, forgotten password reset, and other capabilities for local authentication",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ["meta", { name: "theme-color", content: "#64007a" }],
    ["meta", { property: "og:title", content: name }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: ogUrl }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { name: "twitter:title", content: name }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    editLink: {
      pattern: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },
    socialLinks: [
      {
        icon: "twitter",
        link: "https://twitter.com/feathersjs",
      },
      {
        icon: "discord",
        link: "https://discord.gg/qa8kez8QBx",
      },
      {
        icon: "github",
        link: "https://github.com/feathersjs-ecosystem/feathers-authentication-management",
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022'
    },
    sidebar: [
      {
        text: 'Guide',
        items: [
          {
            text: "Overview",
            link: "/overview"
          }, {
            text: "Getting Started",
            link: "/getting-started"
          }, {
            text: "Process Flows",
            link: "/process-flows"
          }, {
            text: "Configuration",
            link: "/configuration"
          }, {
            text: "Service Hooks",
            link: "/service-hooks"
          }, {
            text: "Service Calls",
            link: "/service-calls"
          }, {
            text: "Best Practices",
            link: "/best-practices"
          }, {
            text: "Migration",
            link: "/migration"
          }
        ],
      },
    ],
    nav: [
      {
        text: `v${version}`,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/CHANGELOG.md'
          },
          {
            text: 'Contributing',
            link: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/.github/contributing.md'
          }
        ]
      }
    ],
    algolia: {
      appId: 'G92UWK8VPN',
      apiKey: 'fd13f8200bfdea8667089e1bb7857c1e',
      indexName: 'feathers-auth-mgmt'
    }
  }
});
