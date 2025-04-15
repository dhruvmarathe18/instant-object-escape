
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { removeBackground, loadImage } from '@/utils/imageProcessor';
import { Download, Upload, Image as ImageIcon, Wand2 } from 'lucide-react';

const BackgroundRemover: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [edgeRefinement, setEdgeRefinement] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.).",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      // Create a URL for the original image
      const originalImageUrl = URL.createObjectURL(file);
      setOriginalImage(originalImageUrl);
      
      setProgress(30);
      // Load the image
      const img = await loadImage(file);
      
      setProgress(50);
      // Process the image
      const processedBlob = await removeBackground(img, edgeRefinement);
      
      setProgress(90);
      // Create a URL for the processed image
      const processedImageUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedImageUrl);
      
      setProgress(100);
      toast({
        title: "Success!",
        description: "Background removed successfully.",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing failed",
        description: "There was an error removing the background.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImage(file);
    }
  }, [edgeRefinement]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processImage(file);
    }
  }, [edgeRefinement]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'background-removed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [processedImage]);

  const handleEdgeRefinementChange = useCallback((value: number[]) => {
    setEdgeRefinement(value[0]);
    if (originalImage && processedImage) {
      // Re-process with new edge refinement
      const img = new Image();
      img.onload = async () => {
        try {
          setIsProcessing(true);
          const processedBlob = await removeBackground(img, value[0]);
          const processedImageUrl = URL.createObjectURL(processedBlob);
          setProcessedImage(processedImageUrl);
        } catch (error) {
          console.error("Error re-processing image:", error);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = originalImage;
    }
  }, [originalImage, processedImage]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div
        className={`dropzone ${isDragging ? 'active' : ''} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-app-primary/10 p-3">
            <Upload className="w-6 h-6 text-app-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Drag & Drop your image here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />
          <Button 
            onClick={handleButtonClick}
            variant="outline"
            className="mt-2"
            disabled={isProcessing}
          >
            Select Image
          </Button>
        </div>
      </div>

      {isProcessing && (
        <div className="my-4">
          <p className="text-sm text-center mb-2">Processing your image...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {originalImage && processedImage && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1 p-4">
              <div className="font-medium flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4" /> Original Image
              </div>
              <div className="image-container aspect-square">
                <img src={originalImage} alt="Original" />
              </div>
            </Card>
            
            <Card className="flex-1 p-4">
              <div className="font-medium flex items-center gap-2 mb-3">
                <Wand2 className="w-4 h-4" /> Processed Image
              </div>
              <div className="image-container aspect-square checkerboard-bg">
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse-subtle">Processing...</div>
                  </div>
                ) : (
                  <img src={processedImage} alt="Processed" />
                )}
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <div className="mb-3">
              <h3 className="text-lg font-medium mb-2">Edge Refinement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adjust to make edges sharper (right) or softer (left)
              </p>
              <Slider 
                min={-10} 
                max={10} 
                step={1} 
                value={[edgeRefinement]}
                onValueChange={handleEdgeRefinementChange}
                disabled={isProcessing}
              />
            </div>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleDownload}
              disabled={isProcessing || !processedImage}
              className="bg-app-primary hover:bg-app-primary-hover"
            >
              <Download className="mr-2 h-4 w-4" /> Download Result
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;
