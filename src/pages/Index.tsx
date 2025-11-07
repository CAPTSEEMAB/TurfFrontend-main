import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, Award, Calendar } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";




const Index = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchPlayers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(API_ENDPOINTS.PLAYERS);
        if (res.status === 401) {
          navigate('/auth');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setPlayers(data.data);
        } else {
          setError(data.message || 'Failed to fetch players');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchPlayers();
  }, [navigate, isAuthenticated, authLoading]);

  // Calculate dashboard stats
  const totalPlayers = players.length;
  const activePlayers = players.filter((p) => p.is_active).length;
  const avgPerformanceScore = players.length > 0
    ? (players.reduce((sum, p) => {
        const performances = p.performances || [];
        if (performances.length === 0) return sum;
        const avgScore = performances.reduce((s, perf) => s + perf.overall_score, 0) / performances.length;
        return sum + avgScore;
      }, 0) / players.length).toFixed(1)
    : 0;
  const topPerformer = players.length > 0
    ? players.reduce((best, p) => {
        const performances = p.performances || [];
        if (performances.length === 0) return best;
        const avgScore = performances.reduce((s, perf) => s + perf.overall_score, 0) / performances.length;
        const bestPerformances = best.performances || [];
        const bestAvgScore = bestPerformances.length > 0
          ? bestPerformances.reduce((s, perf) => s + perf.overall_score, 0) / bestPerformances.length
          : 0;
        return avgScore > bestAvgScore ? p : best;
      }, players[0])
    : null;

  // Prepare chart data
  const performanceTrendData = players.slice(0, 8).map((player) => {
    const performances = player.performances || [];
    const avgPoints = performances.length > 0
      ? (performances.reduce((sum, p) => sum + p.points, 0) / performances.length).toFixed(1)
      : 0;
    const avgAssists = performances.length > 0
      ? (performances.reduce((sum, p) => sum + p.assists, 0) / performances.length).toFixed(1)
      : 0;
    const avgRebounds = performances.length > 0
      ? (performances.reduce((sum, p) => sum + p.rebounds, 0) / performances.length).toFixed(1)
      : 0;
    
    return {
      name: player.name.split(' ')[0],
      points: Number(avgPoints),
      assists: Number(avgAssists),
      rebounds: Number(avgRebounds),
    };
  });

  const topPerformersData = players
    .map((player) => {
      const performances = player.performances || [];
      const avgScore = performances.length > 0
        ? performances.reduce((sum, p) => sum + p.overall_score, 0) / performances.length
        : 0;
      return { name: player.name.split(' ')[0], score: Number(avgScore.toFixed(1)) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const positionDistribution = players.reduce((acc, player) => {
    const position = player.position || 'Unknown';
    const existing = acc.find((item) => item.name === position);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: position, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40 animate-pulse" />
        
        <div className="relative h-[600px] md:h-[700px]">
          <img 
            src={heroBanner} 
            alt="Player performance dashboard" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-secondary/30 to-background" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 text-center text-white">
              <div className="animate-fade-in-up">
                <h1 className="mb-6 text-5xl font-display font-bold md:text-7xl lg:text-8xl drop-shadow-2xl">
                  Player Performance
                  <br />
                  <span className="inline-block glass-strong px-8 py-3 rounded-3xl mt-4 text-gradient animate-scale-in shadow-neon">
                    Dashboard
                  </span>
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg md:text-2xl drop-shadow-lg font-medium animate-fade-in">
                  Track, analyze, and compare player statistics and performance metrics
                </p>

                <div className="flex justify-center gap-4 animate-fade-in">
                  <Button 
                    size="lg" 
                    className="gradient-primary shadow-glow text-lg px-8 py-6 h-auto font-accent transition-spring hover:scale-110"
                    onClick={() => navigate("/players")}
                  >
                    View All Players
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="glass-strong border-2 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto font-accent transition-spring hover:scale-110"
                    onClick={() => navigate("/compare-players")}
                  >
                    Compare Players
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-16 relative">
        <div className="absolute inset-0 gradient-mesh opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-4xl font-display font-bold text-gradient mb-2">
              Performance Overview
            </h2>
            <p className="text-muted-foreground text-lg">
              Real-time statistics and insights
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg">Loading dashboard...</div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
                <Card className="glass border-primary/20 shadow-card hover:shadow-card-hover transition-all animate-fade-in-up">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-display text-gradient">{totalPlayers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activePlayers} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 shadow-card hover:shadow-card-hover transition-all animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-display text-gradient">{avgPerformanceScore}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall score
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 shadow-card hover:shadow-card-hover transition-all animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
                    <Award className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-display text-gradient truncate">
                      {topPerformer?.name || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topPerformer?.position || ''}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-primary/20 shadow-card hover:shadow-card-hover transition-all animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Performances</CardTitle>
                    <Activity className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-display text-gradient">
                      {players.reduce((sum, p) => sum + (p.performances?.length || 0), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recorded games
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="space-y-8">
                {/* Performance Comparison Chart */}
                <Card className="glass border-primary/20 shadow-card animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="text-2xl font-display text-gradient">Average Performance by Player</CardTitle>
                    <p className="text-sm text-muted-foreground">Points, Assists, and Rebounds comparison</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={performanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} name="Points" />
                        <Line type="monotone" dataKey="assists" stroke="hsl(var(--secondary))" strokeWidth={2} name="Assists" />
                        <Line type="monotone" dataKey="rebounds" stroke="hsl(var(--accent))" strokeWidth={2} name="Rebounds" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Top Performers Bar Chart */}
                  <Card className="glass border-primary/20 shadow-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <CardTitle className="text-2xl font-display text-gradient">Top 10 Performers</CardTitle>
                      <p className="text-sm text-muted-foreground">Based on overall performance score</p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topPerformersData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={80} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="score" fill="hsl(var(--primary))" name="Avg Score" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Position Distribution Pie Chart */}
                  <Card className="glass border-primary/20 shadow-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <CardHeader>
                      <CardTitle className="text-2xl font-display text-gradient">Position Distribution</CardTitle>
                      <p className="text-sm text-muted-foreground">Players by position</p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={positionDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {positionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-primary/20 py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="glass-strong p-12 rounded-3xl max-w-4xl mx-auto shadow-neon animate-fade-in-up">
            <h2 className="mb-6 text-5xl font-display font-bold text-gradient">Track Performance</h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
              Compare players, analyze statistics, and discover top performers.
              Make data-driven decisions.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                className="gradient-primary shadow-glow text-lg px-10 py-6 h-auto font-accent transition-spring hover:scale-110" 
                onClick={() => navigate("/compare-players")}
              >
                Compare Players
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="glass border-primary/50 hover:bg-primary/10 text-lg px-10 py-6 h-auto font-accent transition-spring hover:scale-110" 
                onClick={() => navigate("/players")}
              >
                Browse Players
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 glass">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-gradient">TurfBook</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2025 Player Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
