import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PlayerCard from "@/components/PlayerCard";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Download, GitCompare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";

const AllPlayers = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    nationality: "",
    image_url: "",
    notes: "",
  });
  const [editPlayer, setEditPlayer] = useState({
    name: "",
    position: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    nationality: "",
    image_url: "",
    notes: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    fetchPlayers();
  }, [navigate, isAuthenticated, authLoading]);

  const fetchPlayers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(API_ENDPOINTS.PLAYERS);
      if (res.status === 401) {
        navigate("/auth");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data);
      } else {
        setError(data.message || "Failed to fetch players");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const playerData = {
        ...newPlayer,
        age: parseInt(newPlayer.age),
        height_cm: parseInt(newPlayer.height_cm),
        weight_kg: parseInt(newPlayer.weight_kg),
        is_active: true,
      };

      const res = await apiFetch(API_ENDPOINTS.PLAYERS, {
        method: "POST",
        body: JSON.stringify(playerData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Player added successfully!");
        setDialogOpen(false);
        setNewPlayer({
          name: "",
          position: "",
          age: "",
          height_cm: "",
          weight_kg: "",
          nationality: "",
          image_url: "",
          notes: "",
        });
        fetchPlayers();
      } else {
        toast.error(data.message || "Failed to add player");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase();
    return (
      player.name.toLowerCase().includes(query) ||
      player.position.toLowerCase().includes(query) ||
      player.nationality.toLowerCase().includes(query)
    );
  });

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    
    try {
      const playerData = {
        ...editPlayer,
        age: parseInt(editPlayer.age),
        height_cm: parseInt(editPlayer.height_cm),
        weight_kg: parseInt(editPlayer.weight_kg),
      };

      const res = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${selectedPlayer.id}`, {
        method: "PUT",
        body: JSON.stringify(playerData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Player updated successfully!");
        setEditDialogOpen(false);
        setSelectedPlayer(null);
        fetchPlayers();
      } else {
        toast.error(data.message || "Failed to update player");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;
    
    try {
      const res = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${selectedPlayer.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Player deleted successfully!");
        setDeleteDialogOpen(false);
        setSelectedPlayer(null);
        fetchPlayers();
      } else {
        toast.error(data.message || "Failed to delete player");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const openEditDialog = (player: any) => {
    setSelectedPlayer(player);
    setEditPlayer({
      name: player.name,
      position: player.position,
      age: player.age.toString(),
      height_cm: player.height_cm.toString(),
      weight_kg: player.weight_kg.toString(),
      nationality: player.nationality,
      image_url: player.image_url || "",
      notes: player.notes || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (player: any) => {
    setSelectedPlayer(player);
    setDeleteDialogOpen(true);
  };

  const exportPlayersData = () => {
    const dataToExport = {
      export_date: new Date().toISOString(),
      total_players: players.length,
      players: players.map(player => ({
        ...player,
        average_stats: {
          points: player.performances?.length > 0 
            ? (player.performances.reduce((sum, p) => sum + p.points, 0) / player.performances.length).toFixed(1)
            : 0,
          assists: player.performances?.length > 0
            ? (player.performances.reduce((sum, p) => sum + p.assists, 0) / player.performances.length).toFixed(1)
            : 0,
          rebounds: player.performances?.length > 0
            ? (player.performances.reduce((sum, p) => sum + p.rebounds, 0) / player.performances.length).toFixed(1)
            : 0,
          overall_score: player.performances?.length > 0
            ? (player.performances.reduce((sum, p) => sum + p.overall_score, 0) / player.performances.length).toFixed(1)
            : 0,
        }
      }))
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `players-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Players data exported successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-5xl font-display font-bold text-gradient mb-3">
                All Players
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse and manage player profiles and performances
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/compare-players">
                <Button variant="outline" className="glass border-primary/50 hover:bg-primary/10">
                  <GitCompare className="mr-2 h-5 w-5" />
                  Compare Players
                </Button>
              </Link>
              <Button onClick={exportPlayersData} variant="outline" className="glass border-primary/50 hover:bg-primary/10">
                <Download className="mr-2 h-5 w-5" />
                Export Data
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary shadow-glow transition-spring hover:scale-105">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add New Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPlayer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newPlayer.name}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        placeholder="e.g., PG, SF, C"
                        value={newPlayer.position}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, position: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newPlayer.age}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, age: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        value={newPlayer.nationality}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, nationality: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newPlayer.height_cm}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, height_cm: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newPlayer.weight_kg}
                        onChange={(e) =>
                          setNewPlayer({ ...newPlayer, weight_kg: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={newPlayer.image_url}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, image_url: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newPlayer.notes}
                      onChange={(e) =>
                        setNewPlayer({ ...newPlayer, notes: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary">
                    Add Player
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, position, or nationality..."
              className="pl-12 glass-strong border-primary/30 focus:border-primary h-12 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg">Loading players...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-6 text-muted-foreground">
              Showing {filteredPlayers.length} of {players.length} players
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PlayerCard 
                    {...player} 
                    onEdit={() => openEditDialog(player)}
                    onDelete={() => openDeleteDialog(player)}
                  />
                </div>
              ))}
            </div>
            {filteredPlayers.length === 0 && (
              <div className="text-center py-20 glass rounded-3xl animate-fade-in">
                <p className="text-xl text-muted-foreground">
                  No players found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Player Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPlayer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editPlayer.name}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Position *</Label>
                <Input
                  id="edit-position"
                  placeholder="e.g., PG, SF, C"
                  value={editPlayer.position}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, position: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age *</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editPlayer.age}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, age: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nationality">Nationality *</Label>
                <Input
                  id="edit-nationality"
                  value={editPlayer.nationality}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, nationality: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-height">Height (cm) *</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={editPlayer.height_cm}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, height_cm: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-weight">Weight (kg) *</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={editPlayer.weight_kg}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, weight_kg: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                type="url"
                value={editPlayer.image_url}
                onChange={(e) =>
                  setEditPlayer({ ...editPlayer, image_url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editPlayer.notes}
                onChange={(e) =>
                  setEditPlayer({ ...editPlayer, notes: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full gradient-primary">
              Update Player
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedPlayer?.name} and all their performance data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AllPlayers;
