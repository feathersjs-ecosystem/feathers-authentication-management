import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "feathers-auth-mgmt",
  description:
    "Sign up verification, forgotten password reset, and other capabilities for local authentication",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '/logo.svg',
    editLink: {
      pattern: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management' },
      { icon: 'discord', link: 'https://discord.gg/C6rSjSWR' }
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
        text: 'Config',
        link: '/configuration'
      },
      {
        text: 'Changelog',
        link: 'https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/CHANGELOG.md'
      }
    ]
  }
});
