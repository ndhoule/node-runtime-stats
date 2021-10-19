import * as perfHooks from "node:perf_hooks";
import * as process from "node:process";
import * as v8 from "node:v8";
import * as os from "os";
const createGetCpuUsageStats = () => {
    let stats;
    return () => {
        stats = process.cpuUsage(stats);
        return stats;
    };
};
const createGetEventLoopUtilizationStats = () => {
    let stats;
    return () => {
        stats = perfHooks.performance.eventLoopUtilization(stats);
        return stats;
    };
};
const createGetMemoryUsageStats = () => () => {
    try {
        // This throws under some conditions (e.g. on Linux platforms when /proc
        // is not mounted)
        return process.memoryUsage();
    }
    catch {
        return null;
    }
};
const createGetHeapStats = () => () => {
    return v8.getHeapStatistics();
};
export const createGetRuntimeStats = () => {
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
                        total: cpuUsageStats.system + cpuUsageStats.user,
                        user: cpuUsageStats.user,
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
//# sourceMappingURL=collector.js.map