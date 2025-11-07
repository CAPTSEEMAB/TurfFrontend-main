import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, TrendingUp, Activity, Calendar as CalendarIcon, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";

interface Performance {
  points: number;
  assists: number;
  rebounds: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  minutes_played?: number;
  field_goal_pct?: number;
  three_point_pct?: number;
  free_throw_pct?: number;
  efficiency_rating?: number;
  overall_score: number;
  performance_date: string;
}

interface Player {
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
  performances: Performance[];
}

const PlayerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${id}?days=30`);
        if (res.status === 401) {
          navigate("/auth");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setPlayer(data.data);
        } else {
          setError(data.message || "Failed to fetch player");
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    };

    fetchPlayer();
  }, [id, navigate, isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">Loading player details...</div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-red-500">{error || "Player not found"}</div>
        </div>
      </div>
    );
  }

  // Calculate aggregate stats
  const performances = player.performances || [];
  const avgPoints = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.points, 0) / performances.length).toFixed(1)
    : "0";
  const avgAssists = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.assists, 0) / performances.length).toFixed(1)
    : "0";
  const avgRebounds = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.rebounds, 0) / performances.length).toFixed(1)
    : "0";
  const avgScore = performances.length > 0
    ? (performances.reduce((sum, p) => sum + p.overall_score, 0) / performances.length).toFixed(1)
    : "0";

  const exportPlayerData = () => {
    const dataToExport = {
      export_date: new Date().toISOString(),
      player: {
        ...player,
        average_stats: {
          points: avgPoints,
          assists: avgAssists,
          rebounds: avgRebounds,
          overall_score: avgScore,
        }
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `player-${player.name.replace(/\s+/g, "-")}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Player data exported successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Back Button and Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/players">
            <Button variant="ghost" className="transition-spring hover:scale-105">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
          <Button onClick={exportPlayerData} className="gradient-primary shadow-glow">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Player Header */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          {/* Player Image */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden glass border-primary/20">
              <div className="relative aspect-[3/4] bg-muted">
                {player.image_url ? (
                  <img
                    src={player.image_url}
                    alt={player.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-subtle">
                    <Users className="h-32 w-32 text-muted-foreground/30" />
                  </div>
                )}
                {!player.is_active && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="shadow-lg">
                      Inactive
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Player Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-in-up">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-5xl font-display font-bold text-gradient mb-2">
                    {player.name}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {player.nationality} • {player.age} years old
                  </p>
                </div>
                <Badge className="bg-primary text-lg px-4 py-2">
                  {player.position}
                </Badge>
              </div>

              {player.notes && (
                <p className="text-muted-foreground text-lg glass p-4 rounded-xl">
                  {player.notes}
                </p>
              )}
            </div>

            {/* Physical Stats */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-gradient">Physical Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Height</div>
                    <div className="text-2xl font-bold text-gradient font-display">
                      {player.height_cm} cm
                    </div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Weight</div>
                    <div className="text-2xl font-bold text-gradient font-display">
                      {player.weight_kg} kg
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Performance Stats */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-gradient flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Average Performance (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                    <div className="text-3xl font-bold text-gradient font-display">{avgPoints}</div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Assists</div>
                    </div>
                    <div className="text-3xl font-bold text-gradient font-display">{avgAssists}</div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Rebounds</div>
                    </div>
                    <div className="text-3xl font-bold text-gradient font-display">{avgRebounds}</div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="text-sm text-muted-foreground">Overall</div>
                    </div>
                    <div className="text-3xl font-bold text-gradient font-display">{avgScore}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Performances */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="text-gradient flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Recent Performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performances.length > 0 ? (
              <div className="space-y-4">
                {performances.map((perf, index) => (
                  <div
                    key={index}
                    className="glass p-6 rounded-xl hover:shadow-neon transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="text-lg font-semibold">
                        {new Date(perf.performance_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <Badge className="bg-primary/20 text-primary w-fit">
                        Overall Score: {perf.overall_score}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient font-display">{perf.points}</div>
                        <div className="text-xs text-muted-foreground mt-1">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient font-display">{perf.assists}</div>
                        <div className="text-xs text-muted-foreground mt-1">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gradient font-display">{perf.rebounds}</div>
                        <div className="text-xs text-muted-foreground mt-1">Rebounds</div>
                      </div>
                      {perf.steals !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gradient font-display">{perf.steals}</div>
                          <div className="text-xs text-muted-foreground mt-1">Steals</div>
                        </div>
                      )}
                      {perf.blocks !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gradient font-display">{perf.blocks}</div>
                          <div className="text-xs text-muted-foreground mt-1">Blocks</div>
                        </div>
                      )}
                      {perf.minutes_played !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gradient font-display">{perf.minutes_played}</div>
                          <div className="text-xs text-muted-foreground mt-1">Minutes</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerDetail;
