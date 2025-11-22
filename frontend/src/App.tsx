import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Image as ImageIcon, Tv, Search, Upload as UploadIcon, Moon, Sun } from 'lucide-react';
import { MediaFile, mediaApi } from './lib/api';
import { MediaGrid } from './components/MediaGrid';
import { UploadArea } from './components/UploadArea';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { Button } from './components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

const categories = [
  { id: 'images-videos', name: 'Images & Videos', icon: ImageIcon },
  { id: 'movies', name: 'Movies', icon: Film },
  { id: 'series', name: 'TV Series', icon: Tv },
];

function HomePage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.getAllFiles();
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    
    // Toggle dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFiles();
      return;
    }
    
    try {
      const results = await mediaApi.searchFiles(searchQuery);
      setFiles(results);
    } catch (error) {
      console.error('Error searching files:', error);
    }
  };

  const filteredFiles = searchQuery.trim() 
    ? files 
    : files;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold">🏠 Home Media Server</h1>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 pl-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <nav className="flex gap-4 mt-4">
            <Link to="/">
              <Button variant="ghost">All Files</Button>
            </Link>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} to={`/category/${category.id}`}>
                  <Button variant="ghost">
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                </Link>
              );
            })}
            <Link to="/upload">
              <Button variant="primary">
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-3xl font-bold mb-2">Media Library</h2>
              <p className="text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} in your collection
              </p>
            </motion.div>

            <MediaGrid files={filteredFiles} onPlayVideo={setSelectedVideo} />
          </>
        )}
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal file={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}

function CategoryPage({ categoryId }: { categoryId: string }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);

  const category = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    loadCategoryFiles();
  }, [categoryId]);

  const loadCategoryFiles = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.getFilesByCategory(categoryId);
      setFiles(data);
    } catch (error) {
      console.error('Error loading category files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return <div>Category not found</div>;
  }

  const Icon = category.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-8 w-8" />
          <h2 className="text-3xl font-bold">{category.name}</h2>
        </div>
        <p className="text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <MediaGrid files={files} onPlayVideo={setSelectedVideo} />
      )}

      <VideoPlayerModal file={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}

function UploadPage() {
  const [selectedCategory, setSelectedCategory] = useState('images-videos');
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Media Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="flex gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'primary' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <UploadArea category={selectedCategory} onUploadComplete={handleUploadComplete} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPageWrapper />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

function CategoryPageWrapper() {
  const categoryId = window.location.pathname.split('/').pop() || '';
  return <CategoryPage categoryId={categoryId} />;
}

export default App;
