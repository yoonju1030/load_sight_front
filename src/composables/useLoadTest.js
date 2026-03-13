import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { makeTest, getTests } from '../api/test'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const AUTH_TYPES = [
  { title: '인증 없음', value: 'none' },
  { title: 'Bearer Token', value: 'bearer' },
  { title: 'Basic Authentication', value: 'basic' },
  { title: 'API Key (Header)', value: 'apikey-header' },
  { title: 'API Key (Query Parameter)', value: 'apikey-query' },
  { title: 'Custom Header', value: 'custom' }
]

const defaultConfig = () => ({
  testName: '',
  description: '',
  method: 'GET',
  url: '',
  headers: '',
  body: '',
  concurrentRequests: 5,
  totalRequests: 100,
  requestInterval: 1,
  authType: 'none',
  auth: {
    bearerToken: '',
    basicUsername: '',
    basicPassword: '',
    apiKeyHeaderName: 'X-API-Key',
    apiKeyHeaderValue: '',
    apiKeyQueryName: 'api_key',
    apiKeyQueryValue: '',
    customHeaderName: '',
    customHeaderValue: ''
  }
})

const defaultStats = () => ({
  success: 0,
  failed: 0,
  totalTime: 0,
  minTime: Infinity,
  maxTime: 0,
  startTime: null,
  endTime: null
})

export function useLoadTest(refs = {}) {
  const chartCanvasRef = refs.chartCanvasRef
  const logContainerRef = refs.logContainerRef
  const errorRateChartRef = refs.errorRateChartRef
  const p95LatencyChartRef = refs.p95LatencyChartRef

  const panels = ref([0, 1, 2, 3])
  const isRunning = ref(false)
  const showBearerToken = ref(false)
  const showBasicPassword = ref(false)
  const showApiKey = ref(false)
  const testHistory = ref([])
  const showTestDialog = ref(false)
  const selectedTest = ref(null)

  const config = ref(defaultConfig())
  const stats = ref(defaultStats())
  const logs = ref([])
  const results = ref([])
  const realtimeData = ref({
    errorRate: [],
    p95Latency: [],
    timestamps: []
  })

  let stopFlag = false
  let activeRequests = 0
  let updateInterval = null

  const isValidConfig = computed(() =>
    config.value.url.trim() !== '' &&
    config.value.totalRequests > 0 &&
    config.value.concurrentRequests > 0
  )

  const hasResults = computed(() =>
    results.value.length > 0 || stats.value.success + stats.value.failed > 0
  )

  const successRate = computed(() => {
    const total = stats.value.success + stats.value.failed
    return total > 0 ? ((stats.value.success / total) * 100).toFixed(2) : 0
  })

  const failureRate = computed(() => {
    const total = stats.value.success + stats.value.failed
    return total > 0 ? ((stats.value.failed / total) * 100).toFixed(2) : 0
  })

  const averageResponseTime = computed(() => {
    const total = stats.value.success + stats.value.failed
    return total > 0 ? Math.round(stats.value.totalTime / total) : 0
  })

  const requestsPerSecond = computed(() => {
    if (!stats.value.startTime) return 0
    const elapsed = (Date.now() - stats.value.startTime) / 1000
    const total = stats.value.success + stats.value.failed
    return elapsed > 0 ? (total / elapsed).toFixed(2) : 0
  })

  const progress = computed(() => {
    const total = stats.value.success + stats.value.failed
    return config.value.totalRequests > 0
      ? ((total / config.value.totalRequests) * 100).toFixed(1)
      : 0
  })

  const errorRate = computed(() => {
    const total = stats.value.success + stats.value.failed
    if (total === 0) return 0
    const errorCount = results.value.filter(r =>
      !r.success || (r.statusCode >= 500 && r.statusCode < 600) || r.errorType === 'timeout'
    ).length
    return ((errorCount / total) * 100).toFixed(2)
  })

  const calculatePercentile = (percentile) => {
    if (results.value.length === 0) return 0
    const successfulResults = results.value
      .filter(r => r.success && r.latency_ms !== undefined)
      .map(r => r.latency_ms)
      .sort((a, b) => a - b)
    if (successfulResults.length === 0) return 0
    const index = Math.ceil((percentile / 100) * successfulResults.length) - 1
    return successfulResults[Math.max(0, index)] || 0
  }

  const p50Latency = computed(() => calculatePercentile(50))
  const p95Latency = computed(() => calculatePercentile(95))
  const displayLogs = computed(() => logs.value.slice(-100).reverse())

  const addLog = (message, type = 'info', responseTime = null) => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
    logs.value.push({ time: timeStr, message, type, responseTime })
    if (logs.value.length > 1000) logs.value = logs.value.slice(-1000)
    nextTick(() => {
      const el = logContainerRef?.value
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  const updateStats = (responseTime, success) => {
    if (success) stats.value.success++
    else stats.value.failed++
    stats.value.totalTime += responseTime
    stats.value.minTime = Math.min(stats.value.minTime, responseTime)
    stats.value.maxTime = Math.max(stats.value.maxTime, responseTime)
  }

  // const buildAuthHeaders = () => {
  //   const authHeaders = {}
  //   switch (config.value.authType) {
  //     case 'bearer':
  //       if (config.value.auth.bearerToken?.trim()) {
  //         authHeaders['Authorization'] = `Bearer ${config.value.auth.bearerToken.trim()}`
  //       }
  //       break
  //     case 'basic':
  //       if (config.value.auth.basicUsername?.trim() && config.value.auth.basicPassword?.trim()) {
  //         const credentials = `${config.value.auth.basicUsername.trim()}:${config.value.auth.basicPassword.trim()}`
  //         authHeaders['Authorization'] = `Basic ${btoa(credentials)}`
  //       }
  //       break
  //     case 'apikey-header':
  //       if (config.value.auth.apiKeyHeaderName?.trim() && config.value.auth.apiKeyHeaderValue?.trim()) {
  //         authHeaders[config.value.auth.apiKeyHeaderName.trim()] = config.value.auth.apiKeyHeaderValue.trim()
  //       }
  //       break
  //     case 'custom':
  //       if (config.value.auth.customHeaderName?.trim() && config.value.auth.customHeaderValue?.trim()) {
  //         authHeaders[config.value.auth.customHeaderName.trim()] = config.value.auth.customHeaderValue.trim()
  //       }
  //       break
  //   }
  //   return authHeaders
  // }

  const buildUrlWithQuery = (url) => {
    if (config.value.authType === 'apikey-query' &&
        config.value.auth.apiKeyQueryName?.trim() &&
        config.value.auth.apiKeyQueryValue?.trim()) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}${encodeURIComponent(config.value.auth.apiKeyQueryName.trim())}=${encodeURIComponent(config.value.auth.apiKeyQueryValue.trim())}`
    }
    return url
  }

  const makeRequest = async () => {
    if (stopFlag) return
    const startTime = Date.now()
    let responseTime = 0
    let success = false
    let errorMessage = null
    let statusCode = null
    let errorType = null

    try {
      if (config.value.headers?.trim()) {
        try {
          JSON.parse(config.value.headers)
        } catch (e) {
          addLog(`헤더 파싱 오류: ${e.message}`, 'error')
          return
        }
      }
      let body = null
      if (config.value.body?.trim() && ['POST', 'PUT', 'PATCH'].includes(config.value.method)) {
        try {
          body = JSON.parse(config.value.body)
        } catch (e) {
          addLog(`Body 파싱 오류: ${e.message}`, 'error')
          return
        }
      }
      const finalUrl = buildUrlWithQuery(config.value.url)
      const axiosConfig = {
        name: config.value.testName,
        descriptions: config.value.description,
        targetUrl: finalUrl,
        method: config.value.method.toUpperCase(),
        data: body,
        thread: config.value.concurrentRequests,
        totalRequest: config.value.totalRequests,
        requestInterval: config.value.requestInterval,
        authType: (config.value.authType || '').replace('-', '_'),
        auth: config.value.auth,
        timeout: 30000
      }
      const response = await makeTest(axiosConfig)
      responseTime = Date.now() - startTime
      success = true
      statusCode = response?.status ?? response?.data?.statusCode ?? 200

      updateStats(responseTime, success)
      addLog(
        `${config.value.method} ${config.value.url} - ${statusCode} ${response?.statusText || 'OK'}`,
        'success',
        responseTime
      )
      results.value.push({
        timestamp: new Date().toISOString(),
        method: config.value.method,
        url: config.value.url,
        statusCode,
        latency_ms: responseTime,
        responseTime,
        success: true,
        error: null,
        errorType: null
      })
    } catch (error) {
      responseTime = Date.now() - startTime
      success = false
      statusCode = error.response?.status || 0
      errorMessage = error.message
      if (error.code === 'ECONNABORTED' || errorMessage?.includes('timeout')) errorType = 'timeout'
      else if (statusCode >= 500 && statusCode < 600) errorType = '5xx'
      else if (statusCode > 0) errorType = 'other'
      else errorType = 'network'

      updateStats(responseTime, success)
      addLog(`${config.value.method} ${config.value.url} - ${errorMessage}`, 'error', responseTime)
      results.value.push({
        timestamp: new Date().toISOString(),
        method: config.value.method,
        url: config.value.url,
        statusCode,
        latency_ms: responseTime,
        responseTime,
        success: false,
        error: errorMessage,
        errorType
      })
    }
  }

  const finishTest = () => {
    isRunning.value = false
    stats.value.endTime = Date.now()
    stopFlag = false
    const duration = (stats.value.endTime - stats.value.startTime) / 1000
    addLog(`부하 테스트 완료 - 총 ${stats.value.success + stats.value.failed}개 요청, 소요 시간: ${duration.toFixed(2)}초`, 'info')
    saveTestToHistory()
    nextTick(() => drawChart())
  }

  const startLoadTest = async () => {
    stopFlag = false
    isRunning.value = true
    stats.value = { ...defaultStats(), startTime: Date.now() }
    logs.value = []
    results.value = []
    activeRequests = 0
    realtimeData.value = { errorRate: [], p95Latency: [], timestamps: [] }

    addLog('부하 테스트 시작', 'info')
    addLog(`설정: ${config.value.concurrentRequests}개 동시 요청, 총 ${config.value.totalRequests}개 요청`, 'info')

    let completedRequests = 0
    const totalRequests = config.value.totalRequests

    const done = () => {
      activeRequests--
      completedRequests++
      if (completedRequests >= totalRequests || stopFlag) {
        if (activeRequests === 0) finishTest()
      }
    }

    makeRequest().finally(done)
  }

  const stopLoadTest = () => {
    stopFlag = true
    addLog('부하 테스트 중지 요청', 'warning')
  }

  const drawChart = () => {
    const canvas = chartCanvasRef?.value
    if (!canvas || results.value.length === 0) return
    const ctx = canvas.getContext('2d')
    const container = canvas.parentElement
    canvas.width = container?.clientWidth || 400
    canvas.height = 300
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const successfulResults = results.value.filter(r => r.success)
    if (successfulResults.length === 0) return

    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    const responseTimes = successfulResults.map(r => r.responseTime ?? r.latency_ms)
    const maxTime = Math.max(...responseTimes)
    const minTime = Math.min(...responseTimes)
    const range = maxTime - minTime || 1

    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding)
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)')
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(padding, padding, chartWidth, chartHeight)

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    const lineGradient = ctx.createLinearGradient(padding, padding, canvas.width - padding, canvas.height - padding)
    lineGradient.addColorStop(0, '#667eea')
    lineGradient.addColorStop(1, '#764ba2')
    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    successfulResults.forEach((result, index) => {
      const rt = result.responseTime ?? result.latency_ms
      const x = padding + (chartWidth / (successfulResults.length - 1 || 1)) * index
      const y = padding + chartHeight - ((rt - minTime) / range) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    successfulResults.forEach((result, index) => {
      const rt = result.responseTime ?? result.latency_ms
      const x = padding + (chartWidth / (successfulResults.length - 1 || 1)) * index
      const y = padding + chartHeight - ((rt - minTime) / range) * chartHeight
      const pointGradient = ctx.createRadialGradient(x, y, 0, x, y, 6)
      pointGradient.addColorStop(0, '#ffffff')
      pointGradient.addColorStop(0.5, '#667eea')
      pointGradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = pointGradient
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    ctx.fillStyle = '#555'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('요청 순서', canvas.width / 2, canvas.height - 8)
    ctx.save()
    ctx.translate(18, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('응답 시간 (ms)', 0, 0)
    ctx.restore()
    ctx.textAlign = 'right'
    ctx.font = '11px Arial'
    ctx.fillStyle = '#777'
    for (let i = 0; i <= 5; i++) {
      const value = maxTime - (range / 5) * i
      const y = padding + (chartHeight / 5) * i
      ctx.fillText(Math.round(value).toString(), padding - 12, y + 4)
    }
  }

  const drawRealtimeChart = (canvas, data, color, maxValue = null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)
    if (!data || data.length === 0) return
    const displayData = data.slice(-30)
    if (displayData.length < 1) return
    const values = displayData.map(d => parseFloat(d) || 0)
    const minVal = 0
    const maxVal = maxValue || Math.max(...values, 1) || 1
    const range = maxVal - minVal || 1
    const padding = 4
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 3; i++) {
      const y = padding + (chartHeight / 3) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }
    if (displayData.length === 1) {
      const x = padding + chartWidth / 2
      const y = padding + chartHeight - ((parseFloat(displayData[0]) - minVal) / range) * chartHeight
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    displayData.forEach((value, index) => {
      const x = padding + (chartWidth / (displayData.length - 1 || 1)) * index
      const y = padding + chartHeight - ((parseFloat(value) - minVal) / range) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.fillStyle = color
    displayData.forEach((value, index) => {
      const x = padding + (chartWidth / (displayData.length - 1 || 1)) * index
      const y = padding + chartHeight - ((parseFloat(value) - minVal) / range) * chartHeight
      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const collectRealtimeData = () => {
    if (!isRunning.value) return
    const currentErrorRate = parseFloat(errorRate.value) || 0
    const currentP95 = p95Latency.value || 0
    realtimeData.value.errorRate.push(currentErrorRate)
    realtimeData.value.p95Latency.push(currentP95)
    realtimeData.value.timestamps.push(Date.now())
    if (realtimeData.value.errorRate.length > 30) {
      realtimeData.value.errorRate.shift()
      realtimeData.value.p95Latency.shift()
      realtimeData.value.timestamps.shift()
    }
    nextTick(() => {
    const errCanvas = errorRateChartRef?.value
    const p95Canvas = p95LatencyChartRef?.value
      if (errCanvas && realtimeData.value.errorRate.length > 0) {
        const maxErrorRate = Math.max(...realtimeData.value.errorRate, 100, 1)
        drawRealtimeChart(errCanvas, realtimeData.value.errorRate, '#ffffff', maxErrorRate)
      }
      if (p95Canvas && realtimeData.value.p95Latency.length > 0) {
        const maxLatency = Math.max(...realtimeData.value.p95Latency, 1000, 1)
        drawRealtimeChart(p95Canvas, realtimeData.value.p95Latency, '#ffffff', maxLatency)
      }
    })
  }

  const setupRealtimeCharts = () => {
    nextTick(() => {
      const errCanvas = errorRateChartRef?.value
      const p95Canvas = p95LatencyChartRef?.value
      if (errCanvas) {
        errCanvas.width = errCanvas.offsetWidth || 200
        errCanvas.height = 80
      }
      if (p95Canvas) {
        p95Canvas.width = p95Canvas.offsetWidth || 200
        p95Canvas.height = 80
      }
    })
  }

  const startRealTimeUpdate = () => {
    if (updateInterval) clearInterval(updateInterval)
    realtimeData.value = { errorRate: [], p95Latency: [], timestamps: [] }
    setupRealtimeCharts()
    collectRealtimeData()
    updateInterval = setInterval(() => {
      if (isRunning.value) collectRealtimeData()
    }, 2000)
  }

  const stopRealTimeUpdate = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  const downloadReport = () => {
    const report = {
      testName: config.value.testName || '',
      description: config.value.description || '',
      testConfig: {
        testName: config.value.testName || '',
        description: config.value.description || '',
        method: config.value.method,
        url: config.value.url,
        concurrentRequests: config.value.concurrentRequests,
        totalRequests: config.value.totalRequests,
        requestInterval: config.value.requestInterval,
        authType: config.value.authType,
        auth: config.value.authType !== 'none' ? {
          bearerToken: config.value.auth.bearerToken ? '***' : '',
          basicUsername: config.value.auth.basicUsername || '',
          basicPassword: config.value.auth.basicPassword ? '***' : '',
          apiKeyHeaderName: config.value.auth.apiKeyHeaderName || '',
          apiKeyHeaderValue: config.value.auth.apiKeyHeaderValue ? '***' : '',
          apiKeyQueryName: config.value.auth.apiKeyQueryName || '',
          apiKeyQueryValue: config.value.auth.apiKeyQueryValue ? '***' : '',
          customHeaderName: config.value.auth.customHeaderName || '',
          customHeaderValue: config.value.auth.customHeaderValue ? '***' : ''
        } : null
      },
      statistics: {
        totalRequests: stats.value.success + stats.value.failed,
        success: stats.value.success,
        failed: stats.value.failed,
        successRate: parseFloat(successRate.value),
        failureRate: parseFloat(failureRate.value),
        errorRate: parseFloat(errorRate.value),
        averageResponseTime: averageResponseTime.value,
        minResponseTime: stats.value.minTime === Infinity ? 0 : stats.value.minTime,
        maxResponseTime: stats.value.maxTime,
        p50Latency: p50Latency.value,
        p95Latency: p95Latency.value,
        duration: stats.value.endTime && stats.value.startTime
          ? (stats.value.endTime - stats.value.startTime) / 1000
          : 0,
        requestsPerSecond: parseFloat(requestsPerSecond.value)
      },
      results: results.value,
      logs: logs.value
    }
    const testNameForFile = config.value.testName
      ? config.value.testName.replace(/[^a-zA-Z0-9가-힣]/g, '-').substring(0, 50)
      : 'load-test-report'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const jsonUrl = URL.createObjectURL(jsonBlob)
    const jsonLink = document.createElement('a')
    jsonLink.href = jsonUrl
    jsonLink.download = `${testNameForFile}-${timestamp}.json`
    jsonLink.click()
    URL.revokeObjectURL(jsonUrl)
    const csvHeaders = ['Timestamp', 'Method', 'URL', 'Status Code', 'Latency (ms)', 'Success', 'Error', 'Error Type']
    const csvRows = results.value.map(r => [
      r.timestamp, r.method, r.url, r.statusCode,
      r.latency_ms || r.responseTime, r.success, r.error || '', r.errorType || ''
    ])
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
    const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const csvUrl = URL.createObjectURL(csvBlob)
    const csvLink = document.createElement('a')
    csvLink.href = csvUrl
    csvLink.download = `${testNameForFile}-${timestamp}.csv`
    csvLink.click()
    URL.revokeObjectURL(csvUrl)
    addLog('리포트 다운로드 완료', 'success')
  }

  const clearResults = () => {
    stats.value = defaultStats()
    logs.value = []
    results.value = []
    realtimeData.value = { errorRate: [], p95Latency: [], timestamps: [] }
    const canvas = chartCanvasRef?.value
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    const errCanvas = errorRateChartRef?.value
    if (errCanvas) {
      const ctx = errCanvas.getContext('2d')
      ctx.clearRect(0, 0, errCanvas.width, errCanvas.height)
    }
    const p95Canvas = p95LatencyChartRef?.value
    if (p95Canvas) {
      const ctx = p95Canvas.getContext('2d')
      ctx.clearRect(0, 0, p95Canvas.width, p95Canvas.height)
    }
  }

  const saveTestToHistory = () => {
    if (results.value.length === 0) return
    const testResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      testName: config.value.testName || '',
      description: config.value.description || '',
      testConfig: {
        testName: config.value.testName || '',
        description: config.value.description || '',
        method: config.value.method,
        url: config.value.url,
        concurrentRequests: config.value.concurrentRequests,
        totalRequests: config.value.totalRequests,
        requestInterval: config.value.requestInterval,
        authType: config.value.authType
      },
      statistics: {
        totalRequests: stats.value.success + stats.value.failed,
        success: stats.value.success,
        failed: stats.value.failed,
        successRate: parseFloat(successRate.value),
        failureRate: parseFloat(failureRate.value),
        errorRate: parseFloat(errorRate.value),
        averageResponseTime: averageResponseTime.value,
        minResponseTime: stats.value.minTime === Infinity ? 0 : stats.value.minTime,
        maxResponseTime: stats.value.maxTime,
        p50Latency: p50Latency.value,
        p95Latency: p95Latency.value,
        duration: stats.value.endTime && stats.value.startTime
          ? (stats.value.endTime - stats.value.startTime) / 1000
          : 0,
        requestsPerSecond: parseFloat(requestsPerSecond.value)
      }
    }
    testHistory.value.unshift(testResult)
    if (testHistory.value.length > 50) testHistory.value = testHistory.value.slice(0, 50)
    try {
      localStorage.setItem('loadTestHistory', JSON.stringify(testHistory.value))
    } catch (e) {
      console.warn('히스토리 저장 실패:', e)
    }
  }

  const loadTestHistory = () => {
    try {
      const saved = localStorage.getItem('loadTestHistory')
      if (saved) testHistory.value = JSON.parse(saved)
    } catch (e) {
      console.warn('히스토리 불러오기 실패:', e)
    }
  }

  const clearHistory = () => {
    testHistory.value = []
    try {
      localStorage.removeItem('loadTestHistory')
    } catch (e) {
      console.warn('히스토리 삭제 실패:', e)
    }
  }

  const viewTestDetails = (test) => {
    selectedTest.value = test
    showTestDialog.value = true
  }

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname + urlObj.pathname.substring(0, 30) + (urlObj.pathname.length > 30 ? '...' : '')
    } catch {
      return (url || '').substring(0, 40) + ((url || '').length > 40 ? '...' : '')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = (rate) => {
    if (rate >= 95) return 'success'
    if (rate >= 80) return 'warning'
    return 'error'
  }

  const getStatusIcon = (rate) => {
    if (rate >= 95) return 'mdi-check-circle'
    if (rate >= 80) return 'mdi-alert-circle'
    return 'mdi-close-circle'
  }

  watch(() => results.value.length, () => {
    if (hasResults.value && !isRunning.value) nextTick(drawChart)
  })

  watch(() => isRunning.value, (newVal) => {
    if (newVal) startRealTimeUpdate()
    else stopRealTimeUpdate()
  })

  onUnmounted(() => {
    stopRealTimeUpdate()
    stopFlag = true
  })

  return {
    panels,
    isRunning,
    config,
    stats,
    logs,
    testHistory,
    showTestDialog,
    selectedTest,
    httpMethods: HTTP_METHODS,
    authTypes: AUTH_TYPES,
    showBearerToken,
    showBasicPassword,
    showApiKey,
    isValidConfig,
    hasResults,
    successRate,
    failureRate,
    errorRate,
    averageResponseTime,
    p50Latency,
    p95Latency,
    requestsPerSecond,
    progress,
    displayLogs,
    startLoadTest,
    stopLoadTest,
    downloadReport,
    clearResults,
    clearHistory,
    viewTestDetails,
    formatUrl,
    formatDate,
    formatDateTime,
    getStatusColor,
    getStatusIcon,
    loadTestHistory,
    drawChart,
    setupRealtimeCharts,
    getTests
  }
}
