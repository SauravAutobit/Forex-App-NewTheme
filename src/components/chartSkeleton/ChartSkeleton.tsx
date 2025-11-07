const SHIMMER_CLASSES = `
  bg-cardBg 
  bg-gradient-to-r 
  from-cardBg 
  via-[#1e1e1e]  
  to-cardBg 
  animate-shimmer 
  bg-[length:1000px_100%]
`;
const ChartSkeleton = () => {
  return (
    <div className="w-full px-5 transition-opacity duration-300 opacity-90">
      <div className="flex items-center justify-between">
        <button
          className={`btn w-[104px] h-[40px] bg-cardBg rounded-10 ${SHIMMER_CLASSES}`}
        ></button>

        <button
          className={`btn w-[104px] h-[40px] bg-cardBg rounded-10 ${SHIMMER_CLASSES}`}
        ></button>
        <button
          className={`btn w-[104px] h-[40px] bg-cardBg rounded-10 ${SHIMMER_CLASSES}`}
        ></button>
      </div>
      <div
        className={`bg-cardBg h-[660px] mt-4 rounded-10 ${SHIMMER_CLASSES}`}
      ></div>
    </div>
  );
};

export default ChartSkeleton;
