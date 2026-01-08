import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            {...props}
        />
    )
}

// Pre-built skeleton patterns for common use cases
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("glass rounded-2xl p-6 space-y-4", className)}>
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
        </div>
    )
}

function SkeletonListItem({ className }: { className?: string }) {
    return (
        <div className={cn("glass rounded-xl p-4 flex items-center gap-4", className)}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
    )
}

function SkeletonLeaderboard({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-3">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <Skeleton className="h-8 w-16 ml-auto" />
                        <Skeleton className="h-3 w-14 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function SkeletonStats() {
    return (
        <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[1, 2, 3].map((i) => (
                <div key={i} className="text-center glass rounded-2xl p-4 space-y-2">
                    <Skeleton className="h-8 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                </div>
            ))}
        </div>
    )
}

function SkeletonCourseCard() {
    return (
        <div className="glass overflow-hidden rounded-xl">
            <Skeleton className="h-24 w-full" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    )
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols - 2}, 1fr)` }}>
                        {Array.from({ length: cols - 2 }).map((_, j) => (
                            <Skeleton key={j} className="h-4" />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonListItem,
    SkeletonLeaderboard,
    SkeletonStats,
    SkeletonCourseCard,
    SkeletonTable
}
