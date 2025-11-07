import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import TurfCard from "@/components/TurfCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";




const AllTurfs = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchTurfs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(API_ENDPOINTS.TURFS);
        if (res.status === 401) {
          navigate('/');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setTurfs(data.data);
        } else {
          setError(data.message || 'Failed to fetch turfs');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchTurfs();
  }, [navigate, isAuthenticated, authLoading]);

  const filteredTurfs = turfs.filter((turf) => {
    const query = searchQuery.toLowerCase();
    return (
      turf.name.toLowerCase().includes(query) ||
      turf.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-2">All Available Turfs</h1>
              <p className="text-muted-foreground">
                Browse through all our sports venues
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-lg">Loading turfs...</div>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : (
            <>
              <div className="mb-4 text-muted-foreground">
                {filteredTurfs.length} venue{filteredTurfs.length !== 1 ? "s" : ""} found
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTurfs.map((turf) => (
                  <TurfCard key={turf.id} {...turf} />
                ))}
              </div>
              {filteredTurfs.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    No turfs found matching your search.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllTurfs;
