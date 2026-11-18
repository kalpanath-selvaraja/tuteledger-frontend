type SkeletonProps = {
  className?: string
}

function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={"animate-pulse rounded-lg bg-emerald-100 " + className}></div>
}

export default Skeleton