// File Content Extractor
class FileExtractor {
  constructor() {
    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  async extractContent(file) {
    try {
      const fileType = this.getFileType(file.name);
      
      switch (fileType) {
        case 'pdf':
          return await this.extractPDFContent(file);
        case 'pptx':
          return await this.extractPPTXContent(file);
        case 'docx':
          return await this.extractDOCXContent(file);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Error extracting file content:', error);
      throw error;
    }
  }

  getFileType(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    return extension;
  }

  async extractPDFContent(file) {
    try {
      this.updateProgress?.('Reading PDF file...');
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      this.updateProgress?.('Processing PDF pages...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const numPages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        this.updateProgress?.(`Processing page ${pageNum} of ${numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      this.updateProgress?.('PDF extraction completed');
      return {
        content: fullText.trim(),
        pages: numPages,
        type: 'pdf'
      };
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      throw new Error('Failed to extract PDF content. The file might be corrupted or password-protected.');
    }
  }

  async extractPPTXContent(file) {
    try {
      this.updateProgress?.('Reading PPTX file...');
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      this.updateProgress?.('Extracting slides...');
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      let fullText = '';
      let slideCount = 0;
      
      // Extract text from slide content
      const slideFiles = Object.keys(zip.files).filter(filename => 
        filename.match(/ppt\/slides\/slide\d+\.xml/)
      );
      
      slideCount = slideFiles.length;
      
      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        this.updateProgress?.(`Processing slide ${i + 1} of ${slideCount}...`);
        
        const xmlContent = await zip.files[slideFile].async('text');
        const slideText = this.extractTextFromXML(xmlContent);
        if (slideText.trim()) {
          fullText += slideText + '\n\n';
        }
      }
      
      // Also try to extract from slide notes if available
      const notesFiles = Object.keys(zip.files).filter(filename => 
        filename.match(/ppt\/notesSlides\/notesSlide\d+\.xml/)
      );
      
      if (notesFiles.length > 0) {
        this.updateProgress?.('Extracting speaker notes...');
        for (const notesFile of notesFiles) {
          const xmlContent = await zip.files[notesFile].async('text');
          const notesText = this.extractTextFromXML(xmlContent);
          if (notesText.trim()) {
            fullText += 'Notes: ' + notesText + '\n\n';
          }
        }
      }
      
      this.updateProgress?.('PPTX extraction completed');
      return {
        content: fullText.trim(),
        slides: slideCount,
        type: 'pptx'
      };
    } catch (error) {
      console.error('Error extracting PPTX content:', error);
      throw new Error('Failed to extract PPTX content. The file might be corrupted.');
    }
  }

  async extractDOCXContent(file) {
    try {
      this.updateProgress?.('Reading DOCX file...');
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      this.updateProgress?.('Extracting document content...');
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Extract main document content
      const documentXml = await zip.files['word/document.xml'].async('text');
      const mainText = this.extractTextFromXML(documentXml);
      
      let fullText = mainText;
      
      // Try to extract headers and footers
      try {
        this.updateProgress?.('Extracting headers and footers...');
        const headerFiles = Object.keys(zip.files).filter(filename => 
          filename.match(/word\/header\d*\.xml/)
        );
        
        for (const headerFile of headerFiles) {
          const headerXml = await zip.files[headerFile].async('text');
          const headerText = this.extractTextFromXML(headerXml);
          if (headerText.trim()) {
            fullText = headerText + '\n\n' + fullText;
          }
        }
        
        const footerFiles = Object.keys(zip.files).filter(filename => 
          filename.match(/word\/footer\d*\.xml/)
        );
        
        for (const footerFile of footerFiles) {
          const footerXml = await zip.files[footerFile].async('text');
          const footerText = this.extractTextFromXML(footerXml);
          if (footerText.trim()) {
            fullText += '\n\n' + footerText;
          }
        }
      } catch (e) {
        // Headers/footers are optional, continue without them
      }
      
      this.updateProgress?.('DOCX extraction completed');
      return {
        content: fullText.trim(),
        type: 'docx'
      };
    } catch (error) {
      console.error('Error extracting DOCX content:', error);
      throw new Error('Failed to extract DOCX content. The file might be corrupted.');
    }
  }

  extractTextFromXML(xmlContent) {
    try {
      // Handle CDATA sections
      xmlContent = xmlContent.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
      
      // Remove XML tags and extract text content
      let text = xmlContent
        .replace(/<[^>]*>/g, ' ') // Remove all XML tags
        .replace(/&lt;/g, '<')   // Decode HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) // Decode numeric entities
        .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode hex entities
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/\n+/g, '\n')   // Replace multiple newlines with single newline
        .trim();
      
      return text;
    } catch (error) {
      console.error('Error extracting text from XML:', error);
      return '';
    }
  }

  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Utility method to validate file before processing
  validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const allowedTypes = ['pdf', 'pptx', 'docx'];
    
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }
    
    const fileType = this.getFileType(file.name);
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`File type .${fileType} is not supported. Please use PDF, PPTX, or DOCX files.`);
    }
    
    return true;
  }
}

// Create global instance
const fileExtractor = new FileExtractor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FileExtractor, fileExtractor };
} else {
  window.fileExtractor = fileExtractor;
}
