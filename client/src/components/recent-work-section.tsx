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

const videoData: Video[] = [
  {
    id: 1,
    title: "Mountain Retreat",
    client: "Alpine Resorts",
    thumbnailUrl: "https://images.unsplash.com/photo-1518021964703-4b2030f03085?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/2HEhWPJPfZY",
    description: "Cinematic soundscape featuring custom mountain ambience and ethereal textures."
  },
  {
    id: 2,
    title: "Ocean Depths",
    client: "Blue Marine Foundation",
    thumbnailUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/v1yYm7zRjpQ",
    description: "Deep underwater atmosphere with whale songs and custom submarine sounds."
  },
  {
    id: 3,
    title: "Urban Motion",
    client: "City Ventures",
    thumbnailUrl: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/mkR_Qwix4Ho",
    description: "Modern city ambience with sleek transitions and minimalist sound design."
  },
  {
    id: 4,
    title: "Product Launch",
    client: "TechVision Inc.",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/U_Yp5KI4Q0E",
    description: "Futuristic product reveal soundtrack with premium UI sounds and transitions."
  },
  {
    id: 5,
    title: "Nature Documentary",
    client: "EarthView Productions",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/5HwdSMSxln0",
    description: "Expansive natural soundscapes with custom foley and atmospheric design."
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

  // Auto-changing effect removed as requested

  // Get visible videos with proper wrapping
  const visibleVideos = [];
  for (let i = 0; i < maxVisibleItems; i++) {
    const index = (currentIndex + i) % videoData.length;
    visibleVideos.push(videoData[index]);
  }

  return (
    <section id="recent-work" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent to-gray-100/40 dark:to-gray-900/20">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 -ml-6 md:ml-0"
            variant="ghost"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </Button>
          
          <Button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 -mr-6 md:mr-0"
            variant="ghost"
          >
            <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
                  <Card className="h-full overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200/20 dark:border-gray-800/20 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_40px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          onClick={() => handleSelectVideo(video)}
                          className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary text-white hover:scale-110 transition-all duration-300 flex items-center justify-center"
                        >
                          <Play className="h-8 w-8 fill-current" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-1">{video.title}</h3>
                      <p className="text-primary/80 text-sm mb-3">Client: {video.client}</p>
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
            className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
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
                  <p className="text-primary/80">Client: {selectedVideo.client}</p>
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