import * as diagnosticsChannel from "node:diagnostics_channel";
import * as timers from "node:timers";
import { createGetRuntimeStats } from "./collector";
export const channelName = "@ndhoule/node-runtime-stats";
export const channel = diagnosticsChannel.channel(channelName);
/**
 * Installs a monitor that publishes process statistics to the exported
 * diagnostic channel at the configured interval.
 *
 * @returns A function that, when invoked, stops the monitor.
 */
export const installStatsMonitor = ({ interval = 5000, } = {}) => {
    const getStats = createGetRuntimeStats();
    const intervalId = timers
        .setInterval(() => {
        try {
            // Stats have some internal state, so while it'd be nice to not collect
            // them if there are no subscribers, we would likely emit some weird
            // stats on subscribe.
            const stats = getStats();
            if (channel.hasSubscribers) {
                return;
            }
            channel.publish({
                name: "runtime.node.event_loop.active",
                value: stats.runtime.node.eventLoop.active,
            });
            channel.publish({
                name: "runtime.node.event_loop.idle",
                value: stats.runtime.node.eventLoop.idle,
            });
            channel.publish({
                name: "runtime.node.event_loop.utilization",
                value: stats.runtime.node.eventLoop.utilization,
            });
            channel.publish({
                name: "runtime.node.heap.total_heap_size",
                value: stats.runtime.node.heap.totalSize,
            });
            channel.publish({
                name: "runtime.node.heap.total_heap_size_executable",
                value: stats.runtime.node.heap.totalExecutableSize,
            });
            channel.publish({
                name: "runtime.node.heap.total_physical_size",
                value: stats.runtime.node.heap.totalPhysicalSize,
            });
            channel.publish({
                name: "runtime.node.heap.total_available_size",
                value: stats.runtime.node.heap.totalAvailableSize,
            });
            channel.publish({
                name: "runtime.node.heap.heap_size_limit",
                value: stats.runtime.node.heap.sizeLimit,
            });
            channel.publish({
                name: "runtime.node.heap.malloced_memory",
                value: stats.runtime.node.heap.mallocedMemory,
            });
            channel.publish({
                name: "runtime.node.heap.peak_malloced_memory",
                value: stats.runtime.node.heap.peakMallocedMemory,
            });
            if (stats.runtime.node.memory.heapUsed != null) {
                channel.publish({
                    name: "runtime.node.heap_used",
                    value: stats.runtime.node.memory.heapUsed,
                });
            }
            if (stats.runtime.node.memory.heapTotal != null) {
                channel.publish({
                    name: "runtime.node.heap_total",
                    value: stats.runtime.node.memory.heapTotal,
                });
            }
            if (stats.runtime.node.memory.external != null) {
                channel.publish({
                    name: "runtime.node.mem.external",
                    value: stats.runtime.node.memory.external,
                });
            }
            if (stats.runtime.node.memory.rss != null) {
                channel.publish({
                    name: "runtime.node.mem.rss",
                    value: stats.runtime.node.memory.rss,
                });
            }
            if (stats.runtime.node.memory.total != null) {
                channel.publish({
                    name: "runtime.node.mem.total",
                    value: stats.runtime.node.memory.total,
                });
            }
            channel.publish({
                name: "runtime.node.mem.free",
                value: stats.runtime.node.memory.free,
            });
            channel.publish({
                name: "runtime.node.cpu.system",
                value: stats.runtime.node.cpu.system,
            });
            channel.publish({
                name: "runtime.node.cpu.total",
                value: stats.runtime.node.cpu.total,
            });
            channel.publish({
                name: "runtime.node.cpu.user",
                value: stats.runtime.node.cpu.user,
            });
            channel.publish({
                name: "runtime.node.process.uptime",
                value: stats.runtime.node.process.uptime,
            });
        }
        catch {
            // Swallow errors; failures should never cause the process to crash.
        }
    }, interval)
        .unref();
    return () => {
        timers.clearInterval(intervalId);
    };
};
//# sourceMappingURL=index.js.map