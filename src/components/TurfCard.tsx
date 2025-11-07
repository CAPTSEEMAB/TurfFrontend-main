import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface TurfCardProps {
  id: string;
  name: string;
  location: string;
  description?: string;
  price_per_hour: number;
  images?: string[];
  amenities?: string[];
  open_time?: string;
  close_time?: string;
  is_active?: boolean;
  currency?: string;
}

const TurfCard = ({
  id,
  name,
  location,
  description,
  price_per_hour,
  images = [],
  amenities = [],
  open_time,
  close_time,
  is_active,
  currency = "INR",
}: TurfCardProps) => {
  const hoursDisplay = open_time && close_time ? `${open_time} - ${close_time}` : null;

  return (
    <Card className="group overflow-hidden glass border-2 border-border/50 hover:border-primary/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover-lift animate-fade-in-up">
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        <Link to={`/turf/${id}`} className="absolute inset-0 z-0" />
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full h-full relative z-10"
        >
          <CarouselContent>
            {images && images.length > 0 ? images.map((imageUrl, index) => (
              <CarouselItem key={index}>
                <div className="h-full w-full aspect-video relative">
                  <img
                    src={imageUrl}
                    alt={`${name} - Image ${index + 1}`}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="h-full w-full aspect-video flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No images available</span>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
        </Carousel>
        {is_active === false && (
          <Badge className="absolute top-4 right-4 z-10 bg-red-600 text-white font-accent shadow-neon" variant="secondary">
            Inactive
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="text-xl font-display font-bold mb-3 group-hover:text-gradient transition-all">{name}</h3>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 transition-colors group-hover:text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate">{location}</span>
          </div>
          {hoursDisplay && (
            <div className="flex items-center gap-2 transition-colors group-hover:text-foreground">
              <Clock className="h-4 w-4 shrink-0 text-accent" />
              <span>{hoursDisplay}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xl font-bold text-gradient pt-2">
            <Euro className="h-6 w-6" />
            <span>{price_per_hour}</span>
            <span className="text-sm font-normal text-muted-foreground">/hour</span>
          </div>
          {description && (
            <div className="pt-2 text-xs text-muted-foreground line-clamp-2">{description}</div>
          )}
          {amenities && amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {amenities.map((am, i) => (
                <Badge key={i} className="bg-secondary text-xs text-foreground/80 border border-border/50">{am}</Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gradient-primary hover:shadow-glow transition-spring hover:scale-105 font-medium" 
          asChild
        >
          <Link to={`/turf/${id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TurfCard;
