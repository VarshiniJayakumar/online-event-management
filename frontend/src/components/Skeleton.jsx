const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`}></div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden h-full flex flex-col border-white/5 min-w-[320px] md:min-w-[380px]">
      <Skeleton className="h-56 rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </div>
  );
};

export default Skeleton;
