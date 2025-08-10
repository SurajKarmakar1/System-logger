# System Monitor

A Node.js application for monitoring system resources including CPU, memory, network, and process information with logging capabilities.

## Demo
![System Demo]()



## Features

- **Real-time System Monitoring**: Continuously monitors system resources at configurable intervals
- **Comprehensive Metrics Collection**: Tracks CPU usage, memory consumption, network interfaces, and process information
- **Advanced Logging**: Built-in logging system with file persistence and console output
- **Alert System**: Automatic warning and error notifications for high resource usage
- **Detailed Reporting**: Generates summary reports of system performance and monitoring statistics
- **Graceful Shutdown**: Proper cleanup and report generation on application termination

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-logger.js
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
node custom-logger.js
```

## Usage

The system monitor starts automatically when the script is executed. It will:

- Create a `logs` directory for storing monitoring data
- Begin monitoring system resources every 3 seconds
- Display real-time metrics in the console
- Log all events to `./logs/system-monitor.log`
- Generate a summary report on shutdown (saved as `monitor-report.txt`)

### To stop monitoring:
Press `Ctrl+C` to gracefully shutdown the application.

## Monitored Metrics

- **Memory Usage**: Total, used, and free memory with percentage utilization
- **CPU Information**: Number of cores, model, load average, and usage percentage
- **Process Metrics**: Current process memory usage and uptime
- **System Information**: Platform, architecture, hostname, and user information
- **Network Interfaces**: Count and details of available network interfaces

## Alert Thresholds

The system automatically generates alerts based on resource usage:

- **Memory Usage**:
  - Warning: Above 70%
  - Critical: Above 85%

- **CPU Usage**:
  - Warning: Above 60%
  - Critical: Above 80%

## Log Format

Logs are stored in `./logs/system-monitor.log` with the following format:
```
2024-01-01T12:00:00.000Z [LEVEL] Message content
```

Where `LEVEL` can be:
- `INFO`: General information and metrics
- `WARN`: Warning alerts
- `ERROR`: Critical alerts

## Configuration

The monitoring interval can be adjusted by modifying the parameter in:
```javascript
monitor.startMonitoring(3000); // 3000ms = 3 seconds
```

## Requirements

- Node.js 
- File system write permissions for log directory creation

