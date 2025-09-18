class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private lastRequestTime = 0
  private minDelay = 1000 // 1 second between requests

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime

      if (timeSinceLastRequest < this.minDelay) {
        await new Promise((resolve) => setTimeout(resolve, this.minDelay - timeSinceLastRequest))
      }

      const request = this.queue.shift()
      if (request) {
        this.lastRequestTime = Date.now()
        await request()
      }
    }

    this.processing = false
  }
}

export const flippRequestQueue = new RequestQueue()