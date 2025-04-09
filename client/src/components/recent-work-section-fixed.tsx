import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type Video = {
  id: number;
  title: string;
  client: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
};

// Static local images instead of imports
const DeenAthleticImage = "/client/src/assets/deen-athletic.png";

const videoData: Video[] = [
  {
    id: 1,
    title: "Deen Athletic",
    client: "Sports Brand",
    thumbnailUrl: "https://i.imgur.com/8nLFCVP.png", // Fallback URL for demonstration
    videoUrl: "https://www.youtube.com/embed/2HEhWPJPfZY",
    description: "Custom audio design for sports brand promotional material featuring dynamic sound effects and voiceover."
  },
  {
    id: 2,
    title: "Abu53",
    client: "German Nasheed Artist",
    thumbnailUrl: "https://i.imgur.com/kDJSUbK.jpg", // Fallback URL for demonstration
    videoUrl: "https://www.youtube.com/embed/qX9IHIyyn9I",
    description: "Professional audio production for German nasheed artist with carefully crafted sound design."
  },
  {
    id: 3,
    title: "Sunnahshop",
    client: "Islamic Online Shop",
    thumbnailUrl: "https://i.imgur.com/M9JMH2k.png", // Fallback URL for demonstration
    videoUrl: "https://www.youtube.com/embed/mkR_Qwix4Ho",
    description: "Professional voiceovers for Islamic online shop featuring dates, black seed oil, and other specialty products."
  },
  {
    id: 4,
    title: "Safwa Centre",
    client: "Educational Channel",
    thumbnailUrl: "https://i.imgur.com/HMnGMws.png", // Fallback URL for demonstration
    videoUrl: "https://www.youtube.com/embed/U_Yp5KI4Q0E",
    description: "Audio production for educational channel from Paris with clear voiceovers and balanced background elements."
  }
];

export function RecentWorkSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const maxVisibleItems = 3;
  const videoSliderRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentIndex < videoData.length - maxVisibleItems) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(videoData.length - maxVisibleItems);
    }
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  // Get visible videos with proper wrapping
  const visibleVideos = [];
  for (let i = 0; i < maxVisibleItems; i++) {
    const index = (currentIndex + i) % videoData.length;
    visibleVideos.push(videoData[index]);
  }

  return (
    <section id="recent-work" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-[#C2A278]/10">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#C2A278]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-[#A89078]/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 relative z-10">
            Recent <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our recent audio projects and see how our soundpacks and custom audio 
            solutions have elevated these brands and creators.
          </p>
        </div>
        
        <div className="relative" ref={videoSliderRef}>
          {/* Navigation Buttons */}
          <Button 
            onClick={handlePrev} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-gray-900/80 backdrop-blur-md shadow-xl hover:bg-[#C2A278]/90 hover:text-black hover:scale-105 transition-all duration-300 border border-gray-700/50 -ml-6 md:ml-0"
            variant="ghost"
          >
            <ChevronLeft className="h-6 w-6 text-white/80" />
          </Button>
          
          <Button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-gray-900/80 backdrop-blur-md shadow-xl hover:bg-[#C2A278]/90 hover:text-black hover:scale-105 transition-all duration-300 border border-gray-700/50 -mr-6 md:mr-0"
            variant="ghost"
          >
            <ChevronRight className="h-6 w-6 text-white/80" />
          </Button>
          
          {/* Video Slider */}
          <div className="overflow-hidden px-6 md:px-12">
            <div className="flex gap-6 py-8">
              {visibleVideos.map((video, index) => (
                <motion.div
                  key={`${video.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full md:w-1/3 flex-shrink-0"
                >
                  <Card className="h-full overflow-hidden bg-gray-950/50 backdrop-blur-xl border-gray-800/30 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4),0_10px_20px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(194,162,120,0.3)] hover:shadow-[0_35px_60px_rgba(0,0,0,0.6),0_10px_30px_rgba(194,162,120,0.3)] transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          onClick={() => handleSelectVideo(video)}
                          className="h-16 w-16 rounded-full bg-[#C2A278]/90 hover:bg-[#C2A278] text-black hover:scale-110 transition-all duration-300 flex items-center justify-center"
                        >
                          <Play className="h-8 w-8 fill-current" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-1">{video.title}</h3>
                      <p className="text-[#C2A278]/80 text-sm mb-3">{video.client}</p>
                      <p className="text-muted-foreground text-sm line-clamp-2">{video.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseVideo}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl bg-gray-900/95 rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full">
              <iframe 
                src={`${selectedVideo.videoUrl}?autoplay=1&rel=0`} 
                title={selectedVideo.title}
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
                  <p className="text-[#C2A278]/80">{selectedVideo.client}</p>
                </div>
                <Button 
                  onClick={handleCloseVideo}
                  variant="ghost" 
                  className="rounded-full h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <p className="text-muted-foreground">{selectedVideo.description}</p>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}