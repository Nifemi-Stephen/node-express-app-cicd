const { spawn } = require('child_process')

const PORT = 3002
const HOST = '127.0.0.1'
const URL = `http://${HOST}:${PORT}/hello`

const server = spawn(process.execPath, ['app.js'], {
  env: {
    ...process.env,
    HOSTNAME: HOST,
    PORT: PORT.toString()
  },
  stdio: 'inherit'
})

async function runTest() {
  const maxAttempts = 20

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(URL)
      const body = await response.text()

      if (response.status !== 200) {
        throw new Error(`Expected HTTP 200 but received ${response.status}`)
      }

      if (body !== 'Hello World!') {
        throw new Error(`Unexpected response: ${body}`)
      }

      console.log('Smoke test passed: /hello returned Hello World!')

      server.kill('SIGTERM')

      return
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('Application did not become available.')
        console.error(error.message)

        server.kill('SIGTERM')
        process.exitCode = 1
        return
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
}

runTest()
