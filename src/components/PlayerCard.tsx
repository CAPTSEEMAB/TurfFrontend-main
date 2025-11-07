import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Edit, Trash2 } from "lucide-react";

interface Performance {
  points: number;
  assists: number;
  rebounds: number;
  overall_score: number;
  performance_date: string;
}

interface PlayerCardProps {
  id: string;
  name: string;
  position: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  nationality: string;
  image_url?: string;
  is_active: boolean;
  notes?: string;
  performances?: Performance[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const PlayerCard = ({
  id,
  name,
  position,
  age,
  nationality,
  image_url,
  is_active,
  performances = [],
  onEdit,
  onDelete,
}: PlayerCardProps) => {
  // Calculate average stats from recent performances
  const avgScore = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.overall_score, 0) / performances.length).toFixed(1)
    : "N/A";
  
  const avgPoints = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.points, 0) / performances.length).toFixed(1)
    : "N/A";

  return (
    <Card className="group overflow-hidden glass hover:shadow-neon transition-spring hover:scale-105 animate-fade-in border border-primary/20">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-cover transition-spring group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-subtle">
              <Users className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3 flex gap-2">
            {!is_active && (
              <Badge variant="destructive" className="shadow-lg">
                Inactive
              </Badge>
            )}
          </div>

          {/* Position Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 shadow-lg backdrop-blur-sm">
              {position}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-5">
        <div>
          <Link to={`/player/${id}`}>
            <h3 className="text-xl font-display font-bold transition-colors hover:text-primary line-clamp-1">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <span>{nationality}</span>
            <span>•</span>
            <span>{age} years</span>
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-lg font-bold text-gradient font-display">{avgScore}</p>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Points</span>
            </div>
            <p className="text-lg font-bold text-gradient font-display">{avgPoints}</p>
          </div>
        </div>

        {performances.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Based on {performances.length} recent performance{performances.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 flex flex-col gap-2">
        <Link to={`/player/${id}`} className="w-full">
          <Button 
            className="w-full gradient-primary shadow-glow transition-spring hover:scale-105" 
            size="lg"
          >
            View Details
          </Button>
        </Link>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  onEdit();
                }}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                variant="destructive" 
                size="sm"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
