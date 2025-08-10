// system-monitor.js
const fs = require("fs");
const os = require("os");
const EventEmitter = require("events");

// Enhanced Logger Class
class SystemLogger extends EventEmitter {
  constructor() {
    super();
    this.logFile = "./logs/system-monitor.log";
    this.ensureLogFile();
  }

  ensureLogFile() {
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs", { recursive: true });
    }
  }

  log(message, type = "INFO") {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${type}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
    this.emit("logged", { timestamp, type, message });
  }

  error(message) {
    this.log(message, "ERROR");
  }

  warn(message) {
    this.log(message, "WARN");
  }

  info(message) {
    this.log(message, "INFO");
  }
}

// System Monitor Class
class SystemMonitor {
  constructor(logger) {
    this.logger = logger;
    this.monitoring = false;
    this.monitorInterval = null;
    this.startTime = process.hrtime.bigint();
  }

  startMonitoring(interval = 5000) {
    if (this.monitoring) return;

    this.monitoring = true;
    this.logger.info("System monitoring started");

    this.monitorInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, interval);
  }

  stopMonitoring() {
    if (!this.monitoring) return;

    clearInterval(this.monitorInterval);
    this.monitoring = false;
    this.logger.info("System monitoring stopped");
  }

  collectSystemMetrics() {
    // Memory Metrics
    const memory = this.getMemoryInfo();
    this.logger.info(
      `Memory: ${memory.usedPercent}% (${memory.usedFormatted}/${memory.totalFormatted})`
    );

    // CPU Metrics
    const cpu = this.getCPUInfo();
    this.logger.info(`CPU: ${cpu.cores} cores, ${cpu.model}`);
    this.logger.info(`CPU Usage: ${cpu.usagePercent}%`);

    // Process Metrics
    const processInfo = this.getProcessInfo();
    this.logger.info(
      `Process: ${processInfo.memoryUsedFormatted}, Uptime: ${processInfo.uptime}s`
    );

    // System Info
    const system = this.getSystemInfo();
    this.logger.info(
      `System: ${system.platform} ${system.arch} (${system.hostname})`
    );

    // Network Info
    const network = this.getNetworkInfo();
    this.logger.info(`Network Interfaces: ${network.interfaces}`);

    // Check for alerts
    this.checkAlerts(memory, cpu);
  }

  getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usedPercent = parseFloat(((used / total) * 100).toFixed(2));

    return {
      total,
      free,
      used,
      usedPercent,
      totalFormatted: this.formatBytes(total),
      freeFormatted: this.formatBytes(free),
      usedFormatted: this.formatBytes(used),
    };
  }

  getCPUInfo() {
    const cpus = os.cpus();
    const loadAverage = os.loadavg().map((avg) => parseFloat(avg.toFixed(2)));

    // Calculate CPU usage (simple method)
    const usagePercent = this.getCPUUsage();

    return {
      cores: cpus.length,
      model: cpus[0]?.model || "Unknown",
      loadAverage,
      usagePercent: parseFloat((usagePercent * 100).toFixed(2)),
    };
  }

  getCPUUsage() {
    const cpus = os.cpus();

    let totalIdle = 0,
      totalTick = 0;
    for (let i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i];
      for (const type in cpu.times) {
        // Fixed: added 'const'
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    return 1 - totalIdle / totalTick;
  }

  getProcessInfo() {
    const memoryUsage = process.memoryUsage();
    const uptime =
      Number(process.hrtime.bigint() - this.startTime) / 1000000000;

    return {
      memoryUsed: memoryUsage.rss,
      memoryUsedFormatted: this.formatBytes(memoryUsage.rss),
      uptime: parseFloat(uptime.toFixed(2)),
    };
  }

  getSystemInfo() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      userInfo: os.userInfo ? os.userInfo() : {},
    };
  }

  getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const interfaceCount = Object.keys(interfaces).length;

    return {
      interfaces: interfaceCount,
      details: interfaces,
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  checkAlerts(memory, cpu) {
    if (memory.usedPercent > 85) {
      this.logger.error(`🚨 CRITICAL: Memory usage at ${memory.usedPercent}%`);
    } else if (memory.usedPercent > 70) {
      this.logger.warn(`⚠️  WARNING: Memory usage at ${memory.usedPercent}%`);
    }

    if (cpu.usagePercent > 80) {
      this.logger.error(`🚨 CRITICAL: CPU usage at ${cpu.usagePercent}%`);
    } else if (cpu.usagePercent > 60) {
      this.logger.warn(`⚠️  WARNING: CPU usage at ${cpu.usagePercent}%`);
    }
  }

  generateReport() {
    if (!fs.existsSync(this.logger.logFile)) {
      return "No log data available";
    }

    const content = fs.readFileSync(this.logger.logFile, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      return "No log data available";
    }

    const stats = {
      totalEntries: lines.length,
      errors: lines.filter((line) => line.includes("[ERROR]")).length,
      warnings: lines.filter((line) => line.includes("[WARN]")).length,
      startTime: lines[0].split(" ")[0],
      endTime: lines[lines.length - 2].split(" ")[0],
    };

    return `
===============================
  SYSTEM MONITOR REPORT
===============================
Total Log Entries: ${stats.totalEntries}
Errors: ${stats.errors}
Warnings: ${stats.warnings}
Start Time: ${stats.startTime}
End Time: ${stats.endTime}
===============================
`;
  }
}

// Initialize components
const logger = new SystemLogger();
const monitor = new SystemMonitor(logger);

// Event handlers
logger.on("logged", (entry) => {
  console.log(`[${entry.type}] ${entry.message}`);
});

// Start monitoring
monitor.startMonitoring(3000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down monitor...");
  monitor.stopMonitoring();

  // Generate and save report
  const report = monitor.generateReport();
  fs.writeFileSync("./monitor-report.txt", report);
  console.log("Report saved to monitor-report.txt");
  process.exit(0);
});

// Initial log entries
logger.info("System Monitor Backend Initialized");
logger.info(`Node.js Version: ${process.version}`);
logger.info(`Process ID: ${process.pid}`);
