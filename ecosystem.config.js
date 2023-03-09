module.exports = {
  apps: [
    {
      name: 'NuxtApp',
      port: 8080,
      exec_mode: 'cluster',
      instances: '1',
      script: './.output/server/index.mjs',
      args: 'preview',
    },
  ],
}
