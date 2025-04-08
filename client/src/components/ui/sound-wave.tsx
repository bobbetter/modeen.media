import { motion } from "framer-motion";

export function SoundWave() {
  // Create bars with different heights for the sound wave
  const bars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.sin((i / 40) * Math.PI) * 50 + 10;
    return { id: i, height: `${height}%` };
  });

  return (
    <div className="w-full max-w-md mx-auto h-16 flex items-center justify-center gap-[2px]">
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="h-full w-1 bg-primary rounded-full"
          initial={{ height: "20%" }}
          animate={{ 
            height: bar.height, 
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: bar.id * 0.03 % 0.5
          }}
          style={{
            opacity: bar.id % 2 === 0 ? 0.7 : 0.4
          }}
        />
      ))}
    </div>
  );
}
