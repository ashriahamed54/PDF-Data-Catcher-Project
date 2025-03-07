
import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import { Input } from '@/components/ui/input';
import { Entry } from '@/types/entry';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFUploaderProps {
  onDataExtracted: (entries: Omit<Entry, 'id'>[], url: string) => void;
}

const PDFUploader = ({ onDataExtracted }: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const extractTruckNumber = (text: string): string => {
    // First try to match the format with letters (XX-NNNN)
    const truckMatch = text.match(/Truck & Trailer\s*:\s*([A-Z]{2}-\d{4}(?:\s+[A-Z]{2}-\d{4})*)/);
    
    if (truckMatch && truckMatch[1]) {
      const truckNumbers = truckMatch[1].match(/[A-Z]{2}-\d{4}/g) || [];
      return truckNumbers.join(' ');
    }
    
    // If no match found, try to match numeric format (NNN-NNNN)
    const numericTruckMatch = text.match(/Truck & Trailer\s*:\s*(\d{2,3}-\d{4}(?:\s+\d{2,3}-\d{4})*)/);
    
    if (numericTruckMatch && numericTruckMatch[1]) {
      const numericTruckNumbers = numericTruckMatch[1].match(/\d{2,3}-\d{4}/g) || [];
      return numericTruckNumbers.join(' ');
    }
    
    return '';
  };

  // Try to extract token number from PDF
  const extractTokenNumber = (text: string): string => {
    const tokenMatch = text.match(/Token(?:\s+No\.?)?(?:\s*:)?\s*(\d+)/i);
    return tokenMatch && tokenMatch[1] ? tokenMatch[1].trim() : '';
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
        
        console.log('Extracted text from PDF:', text);
        
        const entries: Omit<Entry, 'id'>[] = [];
        
        const passNumberMatch = text.match(/P\s+(\d+)/);
        const cusdecMatch = text.match(/CUSDEC No & Date :\s+CBHQ1\s+I\s+(\d+)/);
        const containerMatch = text.match(/Container No\s*:\s*([A-Z0-9]+)/);
        const destinationMatch = text.match(/Destination\s*:\s*([^:\n]+?)(?=\s*(?:\(SCAN\)|Container No|Cargo Handler|$))/);
        const nameMatch = text.match(/(?:Wharf Clerk|)\s*([A-Z]\s*[A-Z]\s*[A-Z][A-Z\s]+)(?=\.{3,}|ASC\/DSC)/);
        const truckNumber = extractTruckNumber(text);
        const tokenNumber = extractTokenNumber(text);

        if (passNumberMatch || cusdecMatch || containerMatch || destinationMatch || truckNumber) {
          const feet = truckNumber.split(/\s+/).length > 1 ? '40 FEET' : '20 FEET';
          const name = nameMatch ? nameMatch[1].trim() : '';
          const destination = destinationMatch ? destinationMatch[1].trim().replace(/\s*\(SCAN\)\s*$/, '') : '';

          const entry: Omit<Entry, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            passNumber: passNumberMatch ? passNumberMatch[1].trim() : '',
            cusdecNo: cusdecMatch ? cusdecMatch[1].trim() : '',
            containerNo: containerMatch ? containerMatch[1].trim() : '',
            destination: destination,
            truckNumber: truckNumber,
            name: name,
            feet: feet,
            item: '',
            tokenNumber: tokenNumber,
            status: 'IN'
          };
          
          console.log('Parsed entry:', entry);
          entries.push(entry);
        }

        const pdfUrl = URL.createObjectURL(file);
        onDataExtracted(entries, pdfUrl);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      console.log('PDF file loaded:', files[0].name);
      await extractTextFromPDF(files[0]);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Input
        type="file"
        accept=".pdf"
        onChange={onFileChange}
        className="cursor-pointer w-full max-w-full bg-background text-foreground"
      />
    </div>
  );
};

export default PDFUploader;
