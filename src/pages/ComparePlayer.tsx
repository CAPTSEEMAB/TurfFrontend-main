import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, TrendingUp, Activity, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";

interface Performance {
  points: number;
  assists: number;
  rebounds: number;
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

const ComparePlayer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState<string>(searchParams.get("player1") || "");
  const [player2Id, setPlayer2Id] = useState<string>(searchParams.get("player2") || "");
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    fetchPlayers();
  }, [navigate, isAuthenticated, authLoading]);

  useEffect(() => {
    if (player1Id) fetchPlayerDetails(player1Id, 1);
  }, [player1Id]);

  useEffect(() => {
    if (player2Id) fetchPlayerDetails(player2Id, 2);
  }, [player2Id]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(API_ENDPOINTS.PLAYERS);
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch players");
    }
    setLoading(false);
  };

  const fetchPlayerDetails = async (id: string, playerNum: 1 | 2) => {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${id}?days=30`);
      const data = await res.json();
      if (data.success) {
        if (playerNum === 1) setPlayer1(data.data);
        else setPlayer2(data.data);
      }
    } catch (err) {
      toast.error(`Failed to fetch player ${playerNum} details`);
    }
  };

  const calculateStats = (player: Player | null) => {
    if (!player || !player.performances || player.performances.length === 0) {
      return { avgPoints: 0, avgAssists: 0, avgRebounds: 0, avgScore: 0 };
    }
    const perfs = player.performances;
    return {
      avgPoints: Number((perfs.reduce((sum, p) => sum + p.points, 0) / perfs.length).toFixed(1)),
      avgAssists: Number((perfs.reduce((sum, p) => sum + p.assists, 0) / perfs.length).toFixed(1)),
      avgRebounds: Number((perfs.reduce((sum, p) => sum + p.rebounds, 0) / perfs.length).toFixed(1)),
      avgScore: Number((perfs.reduce((sum, p) => sum + p.overall_score, 0) / perfs.length).toFixed(1)),
    };
  };

  const exportComparison = () => {
    if (!player1 || !player2) {
      toast.error("Please select two players to compare");
      return;
    }

    const stats1 = calculateStats(player1);
    const stats2 = calculateStats(player2);

    const comparisonData = {
      comparison_date: new Date().toISOString(),
      player1: {
        ...player1,
        average_stats: stats1,
      },
      player2: {
        ...player2,
        average_stats: stats2,
      },
    };

    const blob = new Blob([JSON.stringify(comparisonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `player-comparison-${player1.name.replace(/\s+/g, "-")}-vs-${player2.name.replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Comparison data exported!");
  };

  const stats1 = calculateStats(player1);
  const stats2 = calculateStats(player2);

  const StatComparison = ({ label, value1, value2, icon: Icon }: any) => {
    const isP1Better = value1 > value2;
    const isP2Better = value2 > value1;
    return (
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <div className="text-sm font-medium">{label}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className={`text-2xl font-bold font-display ${isP1Better ? "text-primary" : ""}`}>
            {value1}
          </div>
          <div className="text-center text-xs text-muted-foreground">VS</div>
          <div className={`text-2xl font-bold font-display text-right ${isP2Better ? "text-primary" : ""}`}>
            {value2}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/players")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Players
        </Button>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-5xl font-display font-bold text-gradient mb-2">Compare Players</h1>
              <p className="text-muted-foreground text-lg">Select two players to compare their stats</p>
            </div>
            {player1 && player2 && (
              <Button onClick={exportComparison} className="gradient-primary shadow-glow">
                <Download className="mr-2 h-4 w-4" />
                Export Comparison
              </Button>
            )}
          </div>
        </div>

        {/* Player Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Player 1</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={player1Id} onValueChange={setPlayer1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id} disabled={player.id === player2Id}>
                      {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Player 2</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={player2Id} onValueChange={setPlayer2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id} disabled={player.id === player1Id}>
                      {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Comparison View */}
        {player1 && player2 && (
          <div className="space-y-8 animate-fade-in">
            {/* Player Headers */}
            <div className="grid md:grid-cols-2 gap-6">
              {[player1, player2].map((player) => (
                <Card key={player.id} className="glass border-primary/20 overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    {player.image_url ? (
                      <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users className="h-20 w-20 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-3xl font-display font-bold text-gradient mb-2">{player.name}</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-primary">{player.position}</Badge>
                      <span className="text-muted-foreground">{player.nationality}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{player.age} years</span>
                    </div>
                    {player.notes && (
                      <p className="text-sm text-muted-foreground">{player.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Physical Stats Comparison */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-gradient">Physical Comparison</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <div className="text-sm text-muted-foreground mb-2">Height</div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className={`text-2xl font-bold font-display ${player1.height_cm > player2.height_cm ? "text-primary" : ""}`}>
                      {player1.height_cm} cm
                    </div>
                    <div className="text-center text-xs text-muted-foreground">VS</div>
                    <div className={`text-2xl font-bold font-display text-right ${player2.height_cm > player1.height_cm ? "text-primary" : ""}`}>
                      {player2.height_cm} cm
                    </div>
                  </div>
                </div>
                <div className="glass p-4 rounded-xl">
                  <div className="text-sm text-muted-foreground mb-2">Weight</div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className={`text-2xl font-bold font-display ${player1.weight_kg > player2.weight_kg ? "text-primary" : ""}`}>
                      {player1.weight_kg} kg
                    </div>
                    <div className="text-center text-xs text-muted-foreground">VS</div>
                    <div className={`text-2xl font-bold font-display text-right ${player2.weight_kg > player1.weight_kg ? "text-primary" : ""}`}>
                      {player2.weight_kg} kg
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats Comparison */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-gradient">Performance Comparison (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <StatComparison label="Average Points" value1={stats1.avgPoints} value2={stats2.avgPoints} icon={Activity} />
                <StatComparison label="Average Assists" value1={stats1.avgAssists} value2={stats2.avgAssists} icon={Activity} />
                <StatComparison label="Average Rebounds" value1={stats1.avgRebounds} value2={stats2.avgRebounds} icon={Activity} />
                <StatComparison label="Overall Score" value1={stats1.avgScore} value2={stats2.avgScore} icon={TrendingUp} />
              </CardContent>
            </Card>

            {/* Recent Performances Comparison */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-gradient">Recent Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[player1, player2].map((player) => (
                    <div key={player.id} className="space-y-3">
                      <h3 className="font-semibold text-lg mb-4">{player.name}</h3>
                      {player.performances.slice(0, 5).map((perf, idx) => (
                        <div key={idx} className="glass p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(perf.performance_date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">Score: {perf.overall_score}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-lg font-bold text-primary">{perf.points}</div>
                              <div className="text-xs text-muted-foreground">PTS</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-primary">{perf.assists}</div>
                              <div className="text-xs text-muted-foreground">AST</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-primary">{perf.rebounds}</div>
                              <div className="text-xs text-muted-foreground">REB</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!player1 && !player2 && !loading && (
          <div className="text-center py-20 glass rounded-3xl">
            <Users className="h-20 w-20 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">Select two players to start comparing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePlayer;
