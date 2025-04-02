import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const TemplateSkeleton = () => {
  return (
    <div className="flex flex-col items-start mx-auto px-4 mt-8 rounded-md">
      {/* Image Skeleton */}
      {/* <div className="w-full" style={{ paddingBottom: "56.25%" }}> */}
      <Skeleton width="100%" height="18rem"></Skeleton>
      {/* </div> */}

      {/* Title Skeleton */}
      <Skeleton width="70%" className="mt-4 mb-2" height="2rem"></Skeleton>

      {/* Summary Skeleton */}
      <Skeleton width="90%" className="mb-2" height="1rem"></Skeleton>
      <Skeleton width="90%" className="mb-4" height="1rem"></Skeleton>

      {/* Date and Zap Amount Skeleton */}
      <div className="flex justify-between w-full">
        <Skeleton width="30%" height="1rem"></Skeleton>
        <Skeleton width="5%" height="1rem"></Skeleton>
      </div>
    </div>
  );
};

export default TemplateSkeleton;
