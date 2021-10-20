import * as perfHooks from "node:perf_hooks";
import * as process from "node:process";
import * as v8 from "node:v8";
import * as os from "os";

const createGetCpuUsageStats = () => {
  let lastTime: [number, number];
  let lastStats: NodeJS.CpuUsage | undefined;

  return (): {
    system: number;
    systemTime: number;
    total: number;
    totalTime: number;
    user: number;
    userTime: number;
  } => {
    const time = process.hrtime(lastTime);
    const stats = process.cpuUsage(lastStats);

    const ms = time[0] * 1000 + time[1] / 1000000;
    const user = (100 * stats.user) / 1000 / ms;
    const system = (100 * stats.system) / 1000 / ms;

    lastTime = time;
    lastStats = stats;

    return {
      system,
      systemTime: stats.system,
      total: user + system,
      totalTime: stats.user + stats.system,
      user,
      userTime: stats.user,
    };
  };
};

const createGetEventLoopUtilizationStats = () => {
  let lastStats: perfHooks.EventLoopUtilization | undefined;
  return (): perfHooks.EventLoopUtilization => {
    const stats = perfHooks.performance.eventLoopUtilization();
    const delta = perfHooks.performance.eventLoopUtilization(stats, lastStats);
    lastStats = stats;
    return delta;
  };
};

const createGetMemoryUsageStats = () => (): NodeJS.MemoryUsage | null => {
  try {
    // This throws under some conditions (e.g. on Linux platforms when /proc
    // is not mounted)
    return process.memoryUsage();
  } catch {
    return null;
  }
};

const createGetHeapStats = () => (): v8.HeapInfo => {
  return v8.getHeapStatistics();
};

export interface NodeRuntimeStats {
  runtime: {
    node: {
      cpu: {
        system: number;
        systemTime: number;
        total: number;
        totalTime: number;
        user: number;
        userTime: number;
      };
      eventLoop: {
        active: number;
        idle: number;
        utilization: number;
      };
      heap: {
        mallocedMemory: number;
        peakMallocedMemory: number;
        sizeLimit: number;
        totalAvailableSize: number;
        totalExecutableSize: number;
        totalPhysicalSize: number;
        totalSize: number;
      };
      memory: {
        external: number | undefined;
        free: number;
        heapTotal: number | undefined;
        heapUsed: number | undefined;
        rss: number | undefined;
        total: number | undefined;
      };
      process: {
        uptime: number;
      };
    };
  };
}

export const createGetRuntimeStats = (): (() => NodeRuntimeStats) => {
  const getMemoryUsageStats = createGetMemoryUsageStats();
  const getCpuUsageStats = createGetCpuUsageStats();
  const getEventLoopUtilizationStats = createGetEventLoopUtilizationStats();
  const getHeapStats = createGetHeapStats();

  return () => {
    const eluStats = getEventLoopUtilizationStats();
    const heapStats = getHeapStats();
    const memoryUsage = getMemoryUsageStats();
    const cpuUsageStats = getCpuUsageStats();

    return {
      runtime: {
        node: {
          cpu: {
            system: cpuUsageStats.system,
            systemTime: cpuUsageStats.systemTime,
            total: cpuUsageStats.user,
            totalTime: cpuUsageStats.systemTime + cpuUsageStats.userTime,
            user: cpuUsageStats.system + cpuUsageStats.user,
            userTime: cpuUsageStats.userTime,
          },
          eventLoop: {
            active: eluStats.active,
            idle: eluStats.idle,
            utilization: eluStats.utilization,
          },
          heap: {
            mallocedMemory: heapStats.malloced_memory,
            peakMallocedMemory: heapStats.peak_malloced_memory,
            sizeLimit: heapStats.heap_size_limit,
            totalAvailableSize: heapStats.total_available_size,
            totalExecutableSize: heapStats.total_heap_size_executable,
            totalPhysicalSize: heapStats.total_physical_size,
            totalSize: heapStats.total_heap_size,
          },
          memory: {
            external: memoryUsage?.external,
            free: os.freemem(),
            heapTotal: memoryUsage?.heapTotal,
            heapUsed: memoryUsage?.heapUsed,
            rss: memoryUsage?.rss,
            total: os.totalmem(),
          },
          process: {
            uptime: Math.round(process.uptime()),
          },
        },
      },
    };
  };
};
