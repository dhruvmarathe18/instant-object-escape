
import BackgroundRemover from '@/components/BackgroundRemover';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-app-primary to-app-secondary py-6 px-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Background Remover</h1>
          <p className="text-white/80 mt-2">
            Remove backgrounds from images using AI-powered segmentation
          </p>
        </div>
      </header>
      
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        <BackgroundRemover />
      </main>
      
      <footer className="bg-gray-50 py-6 px-4 border-t">
        <div className="container max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>Powered by Hugging Face Transformers.js</p>
          <p className="mt-1">Upload images to remove backgrounds instantly</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
